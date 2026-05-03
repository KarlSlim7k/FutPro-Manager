import type { SupabaseClient } from "@supabase/supabase-js";

type RecalculateStats = {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  points: number;
};

export type RecalculateStandingsError = {
  code?: string;
  message: string;
  details?: string;
};

export type RecalculateStandingsForSeasonResult = {
  success: boolean;
  teamsCount: number;
  matchesCount: number;
  error?: RecalculateStandingsError;
};

interface RecalculateStandingsForSeasonParams {
  supabase: SupabaseClient;
  leagueId: string;
  seasonId: string;
}

function toControlledError(error: {
  code?: string;
  message?: string;
  details?: string;
}): RecalculateStandingsError {
  return {
    code: error.code,
    message: error.message ?? "Unknown error",
    details: error.details,
  };
}

export async function recalculateStandingsForSeason({
  supabase,
  leagueId,
  seasonId,
}: RecalculateStandingsForSeasonParams): Promise<RecalculateStandingsForSeasonResult> {
  const { data: teamsData, error: teamsError } = await supabase
    .from("teams")
    .select("id")
    .eq("league_id", leagueId)
    .neq("status", "archived")
    .order("id", { ascending: true });

  if (teamsError) {
    return {
      success: false,
      teamsCount: 0,
      matchesCount: 0,
      error: toControlledError(teamsError),
    };
  }

  const teams = teamsData ?? [];

  if (teams.length === 0) {
    return {
      success: false,
      teamsCount: 0,
      matchesCount: 0,
      error: {
        code: "NO_TEAMS",
        message: "No teams available for standings recalculation.",
      },
    };
  }

  const { data: matchesData, error: matchesError } = await supabase
    .from("matches")
    .select("home_team_id, away_team_id, home_score, away_score")
    .eq("league_id", leagueId)
    .eq("season_id", seasonId)
    .eq("status", "completed");

  if (matchesError) {
    return {
      success: false,
      teamsCount: teams.length,
      matchesCount: 0,
      error: toControlledError(matchesError),
    };
  }

  const matches = matchesData ?? [];
  const stats = new Map<string, RecalculateStats>();

  for (const team of teams) {
    stats.set(team.id, {
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      points: 0,
    });
  }

  for (const match of matches) {
    const homeStats = stats.get(match.home_team_id);
    const awayStats = stats.get(match.away_team_id);

    if (!homeStats || !awayStats) {
      continue;
    }

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

  const rows = teams.map((team) => {
    const teamStats = stats.get(team.id)!;

    return {
      league_id: leagueId,
      season_id: seasonId,
      team_id: team.id,
      played: teamStats.played,
      won: teamStats.won,
      drawn: teamStats.drawn,
      lost: teamStats.lost,
      goals_for: teamStats.goals_for,
      goals_against: teamStats.goals_against,
      goal_difference: teamStats.goals_for - teamStats.goals_against,
      points: teamStats.points,
    };
  });

  const { error: upsertError } = await supabase
    .from("standings")
    .upsert(rows, { onConflict: "season_id,team_id" });

  if (upsertError) {
    return {
      success: false,
      teamsCount: teams.length,
      matchesCount: matches.length,
      error: toControlledError(upsertError),
    };
  }

  return {
    success: true,
    teamsCount: teams.length,
    matchesCount: matches.length,
  };
}
