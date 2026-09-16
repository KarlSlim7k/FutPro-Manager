import { createPublicClient } from "@/lib/supabase/public";

export interface HomeStats {
  leagues: number;
  teams: number;
  finishedMatches: number;
  leagueNames: string[];
}

export interface DemoStandingRow {
  pos: number;
  name: string;
  played: number;
  points: number;
  diff: string;
}

export interface DemoMatch {
  id: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  scheduledAt: string | null;
  round: string | null;
}

export interface HomeData {
  stats: HomeStats;
  standings: DemoStandingRow[];
  upcoming: DemoMatch[];
  results: DemoMatch[];
  demoSlug: string | null;
}

const FALLBACK: HomeData = {
  stats: { leagues: 0, teams: 0, finishedMatches: 0, leagueNames: [] },
  standings: [],
  upcoming: [],
  results: [],
  demoSlug: "liga-municipal-perote",
};

export async function getHomeData(): Promise<HomeData> {
  try {
    const supabase = createPublicClient();

    const [{ count: leagueCount, data: leaguesData }, { data: demoLeague }] =
      await Promise.all([
        supabase
          .from("leagues")
          .select("id, name", { count: "exact" })
          .eq("is_public", true)
          .eq("status", "active")
          .order("name", { ascending: true })
          .limit(12),
        supabase
          .from("leagues")
          .select("id, slug")
          .eq("slug", "liga-municipal-perote")
          .eq("is_public", true)
          .eq("status", "active")
          .maybeSingle(),
      ]);

    const publicLeagueIds = ((leaguesData as { id: string }[] | null) ?? []).map(
      (l) => l.id
    );
    const leagueNames = ((leaguesData as { name: string }[] | null) ?? [])
      .map((l) => l.name)
      .slice(0, 8);

    let teamCount = 0;
    let finishedCount = 0;
    if (publicLeagueIds.length > 0) {
      const [{ count: t }, { count: m }] = await Promise.all([
        supabase
          .from("teams")
          .select("id", { count: "exact", head: true })
          .in("league_id", publicLeagueIds),
        supabase
          .from("matches")
          .select("id", { count: "exact", head: true })
          .in("league_id", publicLeagueIds)
          .eq("status", "completed"),
      ]);
      teamCount = t ?? 0;
      finishedCount = m ?? 0;
    }

    // Demo league detail (para tabla + partidos reales en el hero)
    let standings: DemoStandingRow[] = [];
    let upcoming: DemoMatch[] = [];
    let results: DemoMatch[] = [];
    let demoSlug: string | null = "liga-municipal-perote";

    const demoId = (demoLeague as { id: string; slug: string } | null)?.id;
    if (demoId) {
      const { data: seasons } = await supabase
        .from("seasons")
        .select("id")
        .eq("league_id", demoId)
        .order("start_date", { ascending: false })
        .limit(1);
      const seasonId = (seasons?.[0] as { id: string } | undefined)?.id;

      if (seasonId) {
        const [{ data: st }, { data: up }, { data: res }, { data: teams }] =
          await Promise.all([
            supabase
              .from("standings")
              .select("team_id, played, points, goal_difference")
              .eq("league_id", demoId)
              .eq("season_id", seasonId)
              .order("points", { ascending: false })
              .order("goal_difference", { ascending: false })
              .limit(4),
            supabase
              .from("matches")
              .select(
                "id, home_team_id, away_team_id, status, scheduled_at, round_name, home_score, away_score"
              )
              .eq("league_id", demoId)
              .eq("season_id", seasonId)
              .in("status", ["scheduled", "in_progress"])
              .order("scheduled_at", { ascending: true })
              .limit(2),
            supabase
              .from("matches")
              .select(
                "id, home_team_id, away_team_id, status, scheduled_at, round_name, home_score, away_score"
              )
              .eq("league_id", demoId)
              .eq("season_id", seasonId)
              .eq("status", "completed")
              .order("scheduled_at", { ascending: false })
              .limit(2),
            supabase.from("teams").select("id, name").eq("league_id", demoId),
          ]);

        const nameById = new Map(
          ((teams as { id: string; name: string }[] | null) ?? []).map((t) => [
            t.id,
            t.name,
          ])
        );
        const teamName = (id: string) => nameById.get(id) ?? "Equipo";

        standings = ((st as unknown[]) ?? []).map((r, i) => {
          const row = r as {
            team_id: string;
            played: number;
            points: number;
            goal_difference: number;
          };
          return {
            pos: i + 1,
            name: teamName(row.team_id),
            played: row.played ?? 0,
            points: row.points ?? 0,
            diff:
              (row.goal_difference ?? 0) > 0
                ? `+${row.goal_difference}`
                : `${row.goal_difference ?? 0}`,
          };
        });

        const mapMatch = (m: {
          id: string;
          home_team_id: string;
          away_team_id: string;
          home_score: number | null;
          away_score: number | null;
          status: string;
          scheduled_at: string | null;
          round_name: string | null;
        }): DemoMatch => ({
          id: m.id,
          home: teamName(m.home_team_id),
          away: teamName(m.away_team_id),
          homeScore: m.home_score,
          awayScore: m.away_score,
          status: m.status,
          scheduledAt: m.scheduled_at,
          round: m.round_name,
        });
        upcoming = ((up as unknown[]) ?? []).map((m) =>
          mapMatch(m as Parameters<typeof mapMatch>[0])
        );
        results = ((res as unknown[]) ?? []).map((m) =>
          mapMatch(m as Parameters<typeof mapMatch>[0])
        );
      }
    } else {
      demoSlug = null;
    }

    return {
      stats: {
        leagues: leagueCount ?? 0,
        teams: teamCount,
        finishedMatches: finishedCount,
        leagueNames,
      },
      standings,
      upcoming,
      results,
      demoSlug,
    };
  } catch {
    return FALLBACK;
  }
}
