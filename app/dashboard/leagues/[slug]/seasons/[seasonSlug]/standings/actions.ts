"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type RecalculateActionState = {
  formError: string | null;
  success: boolean;
  message: string | null;
  teamsCount: number;
  matchesCount: number;
};

function mapRecalculateErrorMessage(
  code?: string,
  message?: string | null,
  details?: string | null
) {
  const normalizedErrorText = `${message ?? ""} ${details ?? ""}`.toLowerCase();

  if (code === "42501") {
    return "No tienes permisos para recalcular la tabla de esta temporada.";
  }

  if (
    normalizedErrorText.includes("row-level security") ||
    normalizedErrorText.includes("permission denied")
  ) {
    return "No tienes permisos para recalcular la tabla de esta temporada.";
  }

  if (normalizedErrorText.includes("unique")) {
    return "Error de integridad al guardar la tabla de posiciones.";
  }

  return "No se pudo guardar la tabla de posiciones.";
}

export async function recalculateStandingsAction(
  leagueSlug: string,
  seasonSlug: string,
  _prevState: RecalculateActionState,
  _formData: FormData
): Promise<RecalculateActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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
      formError: "Liga no encontrada o sin acceso.",
      success: false,
      message: null,
      teamsCount: 0,
      matchesCount: 0,
    };
  }

  const { data: season, error: seasonError } = await supabase
    .from("seasons")
    .select("id")
    .eq("league_id", league.id)
    .eq("slug", seasonSlug)
    .maybeSingle();

  if (seasonError) {
    throw seasonError;
  }

  if (!season) {
    return {
      formError: "Temporada no encontrada o sin acceso.",
      success: false,
      message: null,
      teamsCount: 0,
      matchesCount: 0,
    };
  }

  const { data: teamsData, error: teamsError } = await supabase
    .from("teams")
    .select("id, name")
    .eq("league_id", league.id)
    .neq("status", "archived")
    .order("name", { ascending: true });

  if (teamsError) {
    throw teamsError;
  }

  const teams = teamsData ?? [];

  if (teams.length === 0) {
    return {
      formError: "No hay equipos registrados para calcular la tabla.",
      success: false,
      message: null,
      teamsCount: 0,
      matchesCount: 0,
    };
  }

  const { data: matchesData, error: matchesError } = await supabase
    .from("matches")
    .select("home_team_id, away_team_id, home_score, away_score")
    .eq("league_id", league.id)
    .eq("season_id", season.id)
    .eq("status", "completed");

  if (matchesError) {
    throw matchesError;
  }

  const matches = matchesData ?? [];

  // Initialize stats for all teams
  const stats = new Map<
    string,
    {
      played: number;
      won: number;
      drawn: number;
      lost: number;
      goals_for: number;
      goals_against: number;
      goal_difference: number;
      points: number;
    }
  >();

  for (const team of teams) {
    stats.set(team.id, {
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
    });
  }

  for (const match of matches) {
    const homeStats = stats.get(match.home_team_id);
    const awayStats = stats.get(match.away_team_id);

    if (!homeStats || !awayStats) continue;

    homeStats.played += 1;
    awayStats.played += 1;

    homeStats.goals_for += match.home_score;
    homeStats.goals_against += match.away_score;
    awayStats.goals_for += match.away_score;
    awayStats.goals_against += match.home_score;

    if (match.home_score > match.away_score) {
      homeStats.won += 1;
      homeStats.points += 3;
      awayStats.lost += 1;
    } else if (match.home_score < match.away_score) {
      awayStats.won += 1;
      awayStats.points += 3;
      homeStats.lost += 1;
    } else {
      homeStats.drawn += 1;
      awayStats.drawn += 1;
      homeStats.points += 1;
      awayStats.points += 1;
    }
  }

  // Calculate goal difference
  const rows = [];
  for (const team of teams) {
    const s = stats.get(team.id)!;
    rows.push({
      league_id: league.id,
      season_id: season.id,
      team_id: team.id,
      played: s.played,
      won: s.won,
      drawn: s.drawn,
      lost: s.lost,
      goals_for: s.goals_for,
      goals_against: s.goals_against,
      goal_difference: s.goals_for - s.goals_against,
      points: s.points,
    });
  }

  const { error: upsertError } = await supabase
    .from("standings")
    .upsert(rows, { onConflict: "season_id,team_id" });

  if (upsertError) {
    return {
      formError: mapRecalculateErrorMessage(
        upsertError.code,
        upsertError.message,
        upsertError.details
      ),
      success: false,
      message: null,
      teamsCount: teams.length,
      matchesCount: matches.length,
    };
  }

  revalidatePath(`/dashboard/leagues/${leagueSlug}/seasons/${seasonSlug}/standings`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}/seasons/${seasonSlug}`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}`);

  return {
    formError: null,
    success: true,
    message: `Tabla recalculada correctamente: ${teams.length} equipos, ${matches.length} partidos finalizados.`,
    teamsCount: teams.length,
    matchesCount: matches.length,
  };
}