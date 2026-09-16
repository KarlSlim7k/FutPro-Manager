import type { SupabaseClient } from "@supabase/supabase-js";
import { buildPlayoffBracket, type PlayoffBracketData, type PlayoffMatch } from "./playoff-utils";

export async function getSeasonPlayoffs({
  supabase,
  leagueId,
  seasonId,
}: {
  supabase: SupabaseClient;
  leagueId: string;
  seasonId: string;
}): Promise<PlayoffBracketData> {
  const { data: matchesData, error: matchesError } = await supabase
    .from("matches")
    .select(
      "id, league_id, season_id, home_team_id, away_team_id, venue_id, referee_id, scheduled_at, status, home_score, away_score, home_penalty_score, away_penalty_score, round_name, stage, series_id, leg, created_at, updated_at"
    )
    .eq("league_id", leagueId)
    .eq("season_id", seasonId);

  if (matchesError || !matchesData || matchesData.length === 0) {
    return {
      roundOf16: [],
      quarterFinals: [],
      semiFinals: [],
      thirdPlace: null,
      final: null,
      hasPlayoffs: false,
    };
  }

  const { data: teamsData } = await supabase
    .from("teams")
    .select("id, name, slug, logo_url")
    .eq("league_id", leagueId);

  const teamMap = new Map(
    (teamsData ?? []).map((t) => [t.id, { id: t.id, name: t.name, slug: t.slug, logo_url: t.logo_url }])
  );

  const playoffMatches: PlayoffMatch[] = matchesData.map((m) => {
    const homeTeam = teamMap.get(m.home_team_id) ?? {
      id: m.home_team_id,
      name: "Equipo local",
      slug: "",
      logo_url: null,
    };
    const awayTeam = teamMap.get(m.away_team_id) ?? {
      id: m.away_team_id,
      name: "Equipo visitante",
      slug: "",
      logo_url: null,
    };

    return {
      ...m,
      homeTeam,
      awayTeam,
    };
  });

  return buildPlayoffBracket(playoffMatches);
}
