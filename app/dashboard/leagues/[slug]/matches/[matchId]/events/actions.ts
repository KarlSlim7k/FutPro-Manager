"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
    .select("id, season_id, home_team_id, away_team_id, status")
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

  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches/${matchId}`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches/${matchId}/events`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}`);
  revalidatePath("/dashboard");

  redirect(`/dashboard/leagues/${leagueSlug}/matches/${matchId}/events`);
}
