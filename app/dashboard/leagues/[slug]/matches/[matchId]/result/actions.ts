"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recalculateStandingsForSeason } from "@/lib/standings/recalculate-standings";
import { createClient } from "@/lib/supabase/server";

type UpdateMatchResultField = "home_score" | "away_score";

export type UpdateMatchResultActionState = {
  values: {
    home_score: string;
    away_score: string;
  };
  fieldErrors: Partial<Record<UpdateMatchResultField, string>>;
  formError: string | null;
  success: boolean;
  standingsWarning: string | null;
};

function mapUpdateErrorMessage(code?: string, message?: string | null, details?: string | null) {
  const normalizedErrorText = `${message ?? ""} ${details ?? ""}`.toLowerCase();

  if (code === "42501") {
    return "No tienes permisos para capturar el resultado de este partido.";
  }

  if (
    normalizedErrorText.includes("row-level security") ||
    normalizedErrorText.includes("permission denied")
  ) {
    return "No tienes permisos para capturar el resultado de este partido.";
  }

  return "No se pudo capturar el resultado. Inténtalo nuevamente.";
}

function validateScore(rawScore: string, fieldLabel: string) {
  if (!rawScore) {
    return `${fieldLabel} es obligatorio.`;
  }

  if (!/^\d+$/.test(rawScore)) {
    return `${fieldLabel} debe ser un número entero entre 0 y 99.`;
  }

  const parsedScore = Number.parseInt(rawScore, 10);
  if (!Number.isInteger(parsedScore) || parsedScore < 0 || parsedScore > 99) {
    return `${fieldLabel} debe ser un número entero entre 0 y 99.`;
  }

  return null;
}

export async function updateMatchResultAction(
  leagueSlug: string,
  matchId: string,
  _prevState: UpdateMatchResultActionState,
  formData: FormData
): Promise<UpdateMatchResultActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const values = {
    home_score: String(formData.get("home_score") ?? "").trim(),
    away_score: String(formData.get("away_score") ?? "").trim(),
  };

  const fieldErrors: Partial<Record<UpdateMatchResultField, string>> = {};

  const homeScoreError = validateScore(values.home_score, "El marcador del equipo local");
  const awayScoreError = validateScore(values.away_score, "El marcador del equipo visitante");

  if (homeScoreError) {
    fieldErrors.home_score = homeScoreError;
  }

  if (awayScoreError) {
    fieldErrors.away_score = awayScoreError;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      values,
      fieldErrors,
      formError: null,
      success: false,
      standingsWarning: null,
    };
  }

  const homeScore = Number.parseInt(values.home_score, 10);
  const awayScore = Number.parseInt(values.away_score, 10);

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
      formError: "Liga no encontrada o sin acceso para capturar resultados.",
      success: false,
      standingsWarning: null,
    };
  }

  const { data: matchData, error: matchError } = await supabase
    .from("matches")
    .select("id, season_id, status, home_team_id, away_team_id")
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
      formError: "Partido no encontrado o sin acceso para capturar resultado.",
      success: false,
      standingsWarning: null,
    };
  }

  if (matchData.status === "cancelled") {
    return {
      values,
      fieldErrors: {},
      formError: "No se puede capturar resultado de un partido cancelado.",
      success: false,
      standingsWarning: null,
    };
  }

  const { data: teamsData, error: teamsError } = await supabase
    .from("teams")
    .select("id")
    .in("id", [matchData.home_team_id, matchData.away_team_id])
    .eq("league_id", leagueData.id);

  if (teamsError) {
    throw teamsError;
  }

  if (!teamsData || teamsData.length < 2) {
    return {
      values,
      fieldErrors: {},
      formError: "No se puede capturar resultado porque el partido no tiene ambos equipos válidos.",
      success: false,
      standingsWarning: null,
    };
  }

  const { data: seasonData, error: seasonError } = await supabase
    .from("seasons")
    .select("slug")
    .eq("id", matchData.season_id)
    .eq("league_id", leagueData.id)
    .maybeSingle();

  if (seasonError) {
    throw seasonError;
  }

  const { data: updatedRows, error: updateError } = await supabase
    .from("matches")
    .update({
      home_score: homeScore,
      away_score: awayScore,
      status: "completed",
    })
    .eq("id", matchId)
    .eq("league_id", leagueData.id)
    .select("id");

  if (updateError) {
    return {
      values,
      fieldErrors: {},
      formError: mapUpdateErrorMessage(updateError.code, updateError.message, updateError.details),
      success: false,
      standingsWarning: null,
    };
  }

  if (!updatedRows?.[0]) {
    return {
      values,
      fieldErrors: {},
      formError: "No tienes permisos para capturar el resultado de este partido.",
      success: false,
      standingsWarning: null,
    };
  }

  const recalculateResult = await recalculateStandingsForSeason({
    supabase,
    leagueId: leagueData.id,
    seasonId: matchData.season_id,
  });

  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches/${matchId}`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}/standings`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}`);
  if (seasonData?.slug) {
    revalidatePath(`/dashboard/leagues/${leagueSlug}/seasons/${seasonData.slug}`);
    revalidatePath(`/dashboard/leagues/${leagueSlug}/seasons/${seasonData.slug}/standings`);
  }
  revalidatePath("/dashboard");

  if (!recalculateResult.success) {
    return {
      values,
      fieldErrors: {},
      formError: null,
      success: true,
      standingsWarning:
        "Resultado guardado correctamente, pero no se pudo actualizar la tabla de posiciones automáticamente. Puedes recalcularla manualmente desde la temporada.",
    };
  }

  redirect(`/dashboard/leagues/${leagueSlug}/matches/${matchId}`);
}
