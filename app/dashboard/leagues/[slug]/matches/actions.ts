"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MATCH_STATUS_VALUES, type MatchStatus } from "@/types/database";

type CreateMatchField =
  | "season_id"
  | "home_team_id"
  | "away_team_id"
  | "venue_id"
  | "scheduled_at"
  | "status"
  | "round_name";

type CreateMatchActionState = {
  values: {
    season_id: string;
    home_team_id: string;
    away_team_id: string;
    venue_id: string;
    scheduled_at: string;
    status: string;
    round_name: string;
  };
  fieldErrors: Partial<Record<CreateMatchField, string>>;
  formError: string | null;
};

function mapInsertErrorMessage(code?: string, message?: string | null, details?: string | null) {
  const normalizedErrorText = `${message ?? ""} ${details ?? ""}`.toLowerCase();

  if (code === "42501") {
    return "RLS bloqueó la creación: no tienes permisos para programar partidos en esta liga.";
  }

  if (code === "23503") {
    return "Los datos de temporada, equipo o sede no son válidos para esta liga.";
  }

  if (code === "22P02" || code === "23514") {
    return "Los datos enviados no cumplen con las reglas del sistema.";
  }

  if (
    normalizedErrorText.includes("row-level security") ||
    normalizedErrorText.includes("permission denied")
  ) {
    return "No tienes permisos para programar partidos en esta liga.";
  }

  if (normalizedErrorText.includes("trigger")) {
    return "El sistema rechazó la operación por inconsistencia de datos (liga, temporada, equipos o sede).";
  }

  return "No se pudo programar el partido. Inténtalo nuevamente.";
}

export async function createMatchAction(
  leagueSlug: string,
  _prevState: CreateMatchActionState,
  formData: FormData
): Promise<CreateMatchActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const values = {
    season_id: String(formData.get("season_id") ?? "").trim(),
    home_team_id: String(formData.get("home_team_id") ?? "").trim(),
    away_team_id: String(formData.get("away_team_id") ?? "").trim(),
    venue_id: String(formData.get("venue_id") ?? "").trim(),
    scheduled_at: String(formData.get("scheduled_at") ?? "").trim(),
    status: String(formData.get("status") ?? "").trim(),
    round_name: String(formData.get("round_name") ?? "").trim(),
  };

  const fieldErrors: Partial<Record<CreateMatchField, string>> = {};

  if (!values.season_id) {
    fieldErrors.season_id = "La temporada es obligatoria.";
  }

  if (!values.home_team_id) {
    fieldErrors.home_team_id = "El equipo local es obligatorio.";
  }

  if (!values.away_team_id) {
    fieldErrors.away_team_id = "El equipo visitante es obligatorio.";
  }

  if (values.home_team_id && values.away_team_id && values.home_team_id === values.away_team_id) {
    fieldErrors.away_team_id = "El equipo visitante debe ser diferente al local.";
  }

  if (!values.scheduled_at) {
    fieldErrors.scheduled_at = "La fecha y hora son obligatorias.";
  } else {
    const scheduledDate = new Date(values.scheduled_at);
    if (Number.isNaN(scheduledDate.getTime())) {
      fieldErrors.scheduled_at = "La fecha y hora no son válidas.";
    }
  }

  if (!MATCH_STATUS_VALUES.includes(values.status as MatchStatus)) {
    fieldErrors.status = "Selecciona un estado válido.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      values,
      fieldErrors,
      formError: null,
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
      formError: "Liga no encontrada o sin acceso para programar partidos.",
    };
  }

  // Validar que season pertenece a la liga
  const { data: seasonData, error: seasonError } = await supabase
    .from("seasons")
    .select("id")
    .eq("id", values.season_id)
    .eq("league_id", league.id)
    .maybeSingle();

  if (seasonError) {
    throw seasonError;
  }

  if (!seasonData) {
    return {
      values,
      fieldErrors: { season_id: "La temporada no pertenece a esta liga." },
      formError: null,
    };
  }

  // Validar que ambos equipos pertenecen a la liga
  const { data: teamsData, error: teamsError } = await supabase
    .from("teams")
    .select("id")
    .in("id", [values.home_team_id, values.away_team_id])
    .eq("league_id", league.id);

  if (teamsError) {
    throw teamsError;
  }

  if (!teamsData || teamsData.length < 2) {
    return {
      values,
      fieldErrors: {
        home_team_id: "Ambos equipos deben pertenecer a esta liga.",
        away_team_id: "Ambos equipos deben pertenecer a esta liga.",
      },
      formError: null,
    };
  }

  // Validar venue si se proporciona
  if (values.venue_id) {
    const { data: venueData, error: venueError } = await supabase
      .from("venues")
      .select("id")
      .eq("id", values.venue_id)
      .eq("league_id", league.id)
      .maybeSingle();

    if (venueError) {
      throw venueError;
    }

    if (!venueData) {
      return {
        values,
        fieldErrors: { venue_id: "La sede no pertenece a esta liga." },
        formError: null,
      };
    }
  }

  const { error: insertError } = await supabase.from("matches").insert({
    league_id: league.id,
    season_id: values.season_id,
    home_team_id: values.home_team_id,
    away_team_id: values.away_team_id,
    venue_id: values.venue_id || null,
    scheduled_at: values.scheduled_at,
    status: values.status as MatchStatus,
    round_name: values.round_name || null,
    home_score: 0,
    away_score: 0,
  });

  if (insertError) {
    return {
      values,
      fieldErrors: {},
      formError: mapInsertErrorMessage(insertError.code, insertError.message, insertError.details),
    };
  }

  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches`);
  redirect(`/dashboard/leagues/${leagueSlug}/matches`);
}
