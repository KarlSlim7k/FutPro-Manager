"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/audit/create-audit-log";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";
import { canOfficiateMatch } from "@/lib/permissions/match-permissions";
import { createClient } from "@/lib/supabase/server";
import { MATCH_EVENT_TYPE_VALUES, type MatchEventType } from "@/types/database";

type CreateMatchEventField = "team_id" | "player_id" | "event_type" | "minute" | "notes";

export type CreateMatchEventActionState = {
  values: {
    team_id: string;
    player_id: string;
    event_type: string;
    minute: string;
    notes: string;
  };
  fieldErrors: Partial<Record<CreateMatchEventField, string>>;
  formError: string | null;
};

function mapCreateEventErrorMessage(code?: string, message?: string | null, details?: string | null) {
  const normalizedErrorText = `${message ?? ""} ${details ?? ""}`.toLowerCase();

  if (code === "42501") {
    return "No tienes permisos para registrar eventos en este partido.";
  }

  if (
    normalizedErrorText.includes("row-level security") ||
    normalizedErrorText.includes("permission denied")
  ) {
    return "No tienes permisos para registrar eventos en este partido.";
  }

  return "No se pudo registrar el evento. Inténtalo nuevamente.";
}

export async function createMatchEventAction(
  leagueSlug: string,
  matchId: string,
  _prevState: CreateMatchEventActionState,
  formData: FormData
): Promise<CreateMatchEventActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const values: CreateMatchEventActionState["values"] = {
    team_id: String(formData.get("team_id") ?? "").trim(),
    player_id: String(formData.get("player_id") ?? "").trim(),
    event_type: String(formData.get("event_type") ?? "").trim(),
    minute: String(formData.get("minute") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim(),
  };

  const fieldErrors: Partial<Record<CreateMatchEventField, string>> = {};

  if (!values.team_id) {
    fieldErrors.team_id = "El equipo es obligatorio.";
  }

  if (!values.player_id) {
    fieldErrors.player_id = "El jugador es obligatorio.";
  }

  if (!values.event_type) {
    fieldErrors.event_type = "El tipo de evento es obligatorio.";
  } else if (!MATCH_EVENT_TYPE_VALUES.includes(values.event_type as MatchEventType)) {
    fieldErrors.event_type = "Tipo de evento no válido.";
  }

  if (values.minute === "") {
    fieldErrors.minute = "El minuto es obligatorio.";
  } else {
    if (!/^\d+$/.test(values.minute)) {
      fieldErrors.minute = "El minuto debe ser un número entero entre 0 y 130.";
    } else {
      const minute = Number.parseInt(values.minute, 10);
      if (!Number.isInteger(minute) || minute < 0 || minute > 130) {
        fieldErrors.minute = "El minuto debe ser un número entero entre 0 y 130.";
      }
    }
  }

  if (values.notes.length > 280) {
    fieldErrors.notes = "Las notas no pueden exceder 280 caracteres.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      values,
      fieldErrors,
      formError: null,
    };
  }

  const { data: leagueData, error: leagueError } = await supabase
    .from("leagues")
    .select("id")
    .eq("slug", leagueSlug)
    .maybeSingle();

  if (leagueError) {
    throw leagueError;
  }

  if (!leagueData) {
    return {
      values,
      fieldErrors: {},
      formError: "Liga no encontrada o sin acceso.",
    };
  }

  const { data: matchData, error: matchError } = await supabase
    .from("matches")
    .select("id, season_id, home_team_id, away_team_id, status, referee_id")
    .eq("id", matchId)
    .eq("league_id", leagueData.id)
    .maybeSingle();

  if (matchError) {
    throw matchError;
  }

  if (!matchData) {
    return {
      values,
      fieldErrors: {},
      formError: "Partido no encontrado o sin acceso.",
    };
  }

  if (matchData.status === "cancelled") {
    return {
      values,
      fieldErrors: {},
      formError: "No se pueden registrar eventos en un partido cancelado.",
    };
  }

  const participatingTeamIds = [matchData.home_team_id, matchData.away_team_id];
  if (!participatingTeamIds.includes(values.team_id)) {
    return {
      values: {
        ...values,
        player_id: "",
      },
      fieldErrors: { team_id: "El equipo seleccionado no participa en este partido." },
      formError: null,
    };
  }

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: leagueData.id,
  });

  const canOfficiateThisMatch = canOfficiateMatch(permissions, user.id, matchData.referee_id, matchId);
  const canManageThisTeam =
    permissions.canManageLeague ||
    canOfficiateThisMatch ||
    permissions.staffTeamIds.includes(values.team_id);

  if (!canManageThisTeam) {
    return {
      values,
      fieldErrors: { team_id: "No tienes permisos para registrar eventos para este equipo." },
      formError: null,
    };
  }

  if (matchData.status === "completed" && !permissions.canManageLeague) {
    return {
      values,
      fieldErrors: {},
      formError: "El partido ya está completado. Solo un administrador de liga puede registrar eventos.",
    };
  }

  const { data: registrationData, error: registrationError } = await supabase
    .from("player_team_registrations")
    .select("id")
    .eq("player_id", values.player_id)
    .eq("team_id", values.team_id)
    .eq("season_id", matchData.season_id)
    .eq("status", "active")
    .maybeSingle();

  if (registrationError) {
    throw registrationError;
  }

  if (!registrationData) {
    return {
      values,
      fieldErrors: {
        player_id:
          "El jugador seleccionado no está registrado en ese equipo para la temporada del partido.",
      },
      formError: null,
    };
  }

  // Enforcement server-side de elegibilidad (no solo UI): suspendidos,
  // lesionados, retirados/inactivos, roja previa o acumulación 3+ amarillas.
  const { data: playerRow } = await supabase
    .from("players")
    .select("id, full_name, status")
    .eq("id", values.player_id)
    .eq("league_id", leagueData.id)
    .maybeSingle();
  if (!playerRow) {
    return { values, fieldErrors: { player_id: "Jugador no encontrado en esta liga." }, formError: null };
  }
  let seasonDisciplinaryEvents: Array<{ id: string; match_id: string; player_id: string; event_type: "yellow_card" | "red_card"; created_at: string }> = [];
  try {
    const { data: seasonMatches } = await supabase
      .from("matches")
      .select("id")
      .eq("league_id", leagueData.id)
      .eq("season_id", matchData.season_id);
    const seasonMatchIds = (seasonMatches ?? []).map((m) => (m as { id: string }).id).filter(Boolean);
    if (seasonMatchIds.length > 0) {
      const { data: discEvents } = await supabase
        .from("match_events")
        .select("id, match_id, player_id, event_type, created_at")
        .in("match_id", seasonMatchIds)
        .eq("player_id", values.player_id)
        .in("event_type", ["yellow_card", "red_card"]);
      seasonDisciplinaryEvents = (discEvents ?? []) as typeof seasonDisciplinaryEvents;
    }
  } catch {
    seasonDisciplinaryEvents = [];
  }
  const { checkPlayerEligibility } = await import("@/lib/eligibility/player-eligibility");
  const eligibility = checkPlayerEligibility({
    player: {
      playerId: playerRow.id as string,
      fullName: (playerRow.full_name as string) ?? "",
      status: playerRow.status as "active" | "suspended" | "injured" | "retired" | "inactive",
    },
    seasonEvents: seasonDisciplinaryEvents,
    currentMatchId: matchData.id,
  });
  if (!eligibility.isEligible) {
    return { values, fieldErrors: { player_id: eligibility.reason ?? "Jugador no elegible para este partido." }, formError: null };
  }

  const insertPayload: {
    match_id: string;
    team_id: string;
    player_id: string;
    event_type: MatchEventType;
    minute: number;
    notes: string | null;
    created_by: string;
  } = {
    match_id: matchData.id,
    team_id: values.team_id,
    player_id: values.player_id,
    event_type: values.event_type as MatchEventType,
    minute: Number.parseInt(values.minute, 10),
    notes: values.notes || null,
    created_by: user.id,
  };

  const { data: insertedRows, error: insertError } = await supabase
    .from("match_events")
    .insert(insertPayload)
    .select("id");

  if (insertError) {
    return {
      values,
      fieldErrors: {},
      formError: mapCreateEventErrorMessage(insertError.code, insertError.message, insertError.details),
    };
  }

  if (!insertedRows?.[0]) {
    return {
      values,
      fieldErrors: {},
      formError: "No tienes permisos para registrar eventos en este partido.",
    };
  }

  await createAuditLog({
    supabase,
    actorId: user.id,
    leagueId: leagueData.id,
    action: "match.event_created",
    entityType: "match_event",
    entityId: insertedRows[0].id ?? null,
    metadata: {
      league_slug: leagueSlug,
      match_id: matchId,
      event_type: values.event_type,
      team_id: values.team_id,
    },
  });

  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches/${matchId}`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches/${matchId}/events`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}`);
  revalidatePath("/dashboard");

  redirect(`/dashboard/leagues/${leagueSlug}/matches/${matchId}/events`);
}

export type DeleteMatchEventState = {
  success: boolean;
  message: string | null;
};

export async function deleteMatchEventAction(
  leagueSlug: string,
  matchId: string,
  eventId: string
): Promise<DeleteMatchEventState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: leagueData, error: leagueError } = await supabase
    .from("leagues")
    .select("id")
    .eq("slug", leagueSlug)
    .maybeSingle();

  if (leagueError || !leagueData) {
    return { success: false, message: "Liga no encontrada." };
  }

  // Verificar que el partido pertenece a la liga y obtener contexto para auth.
  const { data: matchRow } = await supabase
    .from("matches")
    .select("id, league_id, status, home_team_id, away_team_id, referee_id")
    .eq("id", matchId)
    .eq("league_id", leagueData.id)
    .maybeSingle();
  if (!matchRow) {
    return { success: false, message: "Partido no encontrado en esta liga." };
  }
  // Auth app-layer (además de RLS): oficiante del partido o staff del equipo del evento.
  const permissions = await getLeaguePermissions({ supabase, userId: user.id, leagueId: leagueData.id });

  if (matchRow.status === "cancelled") {
    return { success: false, message: "No se pueden eliminar eventos de un partido cancelado." };
  }
  if (matchRow.status === "completed" && !permissions.canManageLeague) {
    return { success: false, message: "El partido ya está completado. Solo un administrador de liga puede eliminar eventos." };
  }

  // Verificar que el evento pertenece al partido (evita auditoría cross-liga).
  const { data: eventRow } = await supabase
    .from("match_events")
    .select("id, match_id, team_id")
    .eq("id", eventId)
    .eq("match_id", matchId)
    .maybeSingle();
  if (!eventRow) {
    return { success: false, message: "Evento no encontrado en este partido." };
  }

  const canOfficiate = canOfficiateMatch(permissions, user.id, matchRow.referee_id as string | null, matchId);
  const isEventTeamStaff =
    permissions.canManageLeague ||
    permissions.staffTeamIds.includes((eventRow as { team_id: string }).team_id);
  if (!canOfficiate && !isEventTeamStaff) {
    return { success: false, message: "No tienes permisos para borrar este evento." };
  }

  const { error: deleteError } = await supabase
    .from("match_events")
    .delete()
    .eq("id", eventId)
    .eq("match_id", matchId);

  if (deleteError) {
    return { success: false, message: "No tienes permisos para borrar este evento." };
  }

  await createAuditLog({
    supabase,
    actorId: user.id,
    leagueId: leagueData.id,
    action: "match.event_deleted",
    entityType: "match_event",
    entityId: eventId,
    metadata: {
      league_slug: leagueSlug,
      match_id: matchId,
    },
  });

  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches/${matchId}/events`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches/${matchId}`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}`);

  return { success: true, message: "Evento eliminado correctamente." };
}

