"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MATCH_EVENT_TYPE_VALUES, type MatchEventType } from "@/types/database";

type CreateEventField = "team_id" | "player_id" | "event_type" | "minute" | "notes";

type CreateEventActionState = {
  values: Record<string, string>;
  fieldErrors: Partial<Record<CreateEventField, string>>;
  formError: string | null;
  success: boolean;
};

function mapCreateEventErrorMessage(
  code?: string,
  message?: string | null,
  details?: string | null
) {
  const normalized = `${message ?? ""} ${details ?? ""}`.toLowerCase();

  if (
    code === "42501" ||
    normalized.includes("row-level security") ||
    normalized.includes("permission denied")
  ) {
    return "No tienes permisos para registrar eventos en este partido.";
  }

  if (normalized.includes("team must participate in the match")) {
    return "El equipo seleccionado no participa en este partido.";
  }

  if (normalized.includes("player must have an active registration")) {
    return "El jugador seleccionado no está registrado activo en ese equipo para la temporada del partido.";
  }

  if (normalized.includes("player must belong to the same league")) {
    return "El jugador no pertenece a la liga de este partido.";
  }

  if (normalized.includes("team_id is required when player_id is present")) {
    return "Debes seleccionar un equipo para asociar al jugador.";
  }

  if (normalized.includes("match must exist")) {
    return "Partido no encontrado o sin acceso.";
  }

  if (normalized.includes("created_by must match auth.uid()")) {
    return "Error de autenticación al registrar el evento.";
  }

  if (
    normalized.includes("check constraint") &&
    normalized.includes("minute")
  ) {
    return "El minuto debe estar entre 0 y 130.";
  }

  if (
    normalized.includes("trigger") ||
    normalized.includes("consistency")
  ) {
    return "El evento no es válido para este partido. Revisa equipo, jugador y temporada.";
  }

  return "No se pudo registrar el evento. Inténtalo nuevamente.";
}

export async function createMatchEventAction(
  leagueSlug: string,
  matchId: string,
  _prevState: CreateEventActionState,
  formData: FormData
): Promise<CreateEventActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const values = {
    team_id: String(formData.get("team_id") ?? "").trim(),
    player_id: String(formData.get("player_id") ?? "").trim(),
    event_type: String(formData.get("event_type") ?? "").trim(),
    minute: String(formData.get("minute") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim(),
  };

  const fieldErrors: Partial<Record<CreateEventField, string>> = {};

  if (!values.team_id) {
    fieldErrors.team_id = "Selecciona un equipo.";
  }

  if (!values.event_type) {
    fieldErrors.event_type = "Selecciona un tipo de evento.";
  } else if (!MATCH_EVENT_TYPE_VALUES.includes(values.event_type as MatchEventType)) {
    fieldErrors.event_type = "Tipo de evento no válido.";
  }

  if (values.minute === "") {
    fieldErrors.minute = "El minuto es obligatorio.";
  } else {
    const num = Number(values.minute);
    if (!Number.isInteger(num) || num < 0 || num > 130) {
      fieldErrors.minute = "El minuto debe ser un número entre 0 y 130.";
    }
  }

  if (values.notes.length > 500) {
    fieldErrors.notes = "Las notas no pueden exceder 500 caracteres.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      values,
      fieldErrors,
      formError: null,
      success: false,
    };
  }

  const { data: league, error: leagueError } = await supabase
    .from("leagues")
    .select("id")
    .eq("slug", leagueSlug)
    .maybeSingle();

  if (leagueError) {
    throw leagueError;
  }

  if (!league) {
    return {
      values,
      fieldErrors: {},
      formError: "Liga no encontrada o sin acceso.",
      success: false,
    };
  }

  const { data: matchData, error: matchError } = await supabase
    .from("matches")
    .select("id, season_id, home_team_id, away_team_id")
    .eq("id", matchId)
    .eq("league_id", league.id)
    .maybeSingle();

  if (matchError) {
    throw matchError;
  }

  if (!matchData) {
    return {
      values,
      fieldErrors: {},
      formError: "Partido no encontrado o sin acceso.",
      success: false,
    };
  }

  const participatingTeamIds = [matchData.home_team_id, matchData.away_team_id];
  if (!participatingTeamIds.includes(values.team_id)) {
    return {
      values,
      fieldErrors: { team_id: "El equipo seleccionado no participa en este partido." },
      formError: null,
      success: false,
    };
  }

  if (values.player_id) {
    const { data: registration, error: registrationError } = await supabase
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

    if (!registration) {
      return {
        values,
        fieldErrors: {
          player_id:
            "El jugador seleccionado no está registrado activo en ese equipo para la temporada del partido.",
        },
        formError: null,
        success: false,
      };
    }
  }

  const insertData: {
    match_id: string;
    team_id: string;
    event_type: MatchEventType;
    minute: number;
    notes: string | null;
    player_id: string | null;
  } = {
    match_id: matchId,
    team_id: values.team_id,
    event_type: values.event_type as MatchEventType,
    minute: Number(values.minute),
    notes: values.notes || null,
    player_id: values.player_id || null,
  };

  const { error: insertError } = await supabase
    .from("match_events")
    .insert(insertData);

  if (insertError) {
    return {
      values,
      fieldErrors: {},
      formError: mapCreateEventErrorMessage(
        insertError.code,
        insertError.message,
        insertError.details
      ),
      success: false,
    };
  }

  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches/${matchId}`);

  return {
    values: {
      team_id: "",
      player_id: "",
      event_type: "",
      minute: "",
      notes: "",
    },
    fieldErrors: {},
    formError: null,
    success: true,
  };
}
