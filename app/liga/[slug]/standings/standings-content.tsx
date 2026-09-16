import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StandingMobileCard } from "@/components/standings/standing-mobile-card";
import { StandingsTableView } from "@/components/standings/standings-table-view";
import type { StandingRowViewModel, StandingTeamSummary } from "@/components/standings/types";
import { TopScorersTable } from "@/components/stats/top-scorers-table";
import { FairPlayTable } from "@/components/stats/fair-play-table";
import { PlayoffBracket } from "@/components/playoffs/playoff-bracket";
import type { StatsTabType } from "@/components/stats/season-stats-tabs";
import { createPublicClient } from "@/lib/supabase/public";
import { getSeasonStats } from "@/lib/stats/get-season-stats";
import { getSeasonPlayoffs } from "@/lib/playoffs/get-season-playoffs";
import type { Standing } from "@/types/database";

type StandingItem = Pick<
  Standing,
  | "id"
  | "team_id"
  | "played"
  | "won"
  | "drawn"
  | "lost"
  | "goals_for"
  | "goals_against"
  | "goal_difference"
  | "points"
  | "updated_at"
>;

interface StandingsContentProps {
  leagueId: string;
  leagueSlug: string;
  seasonId: string;
  seasonName: string;
  seasonStatus: string;
  seasonStart: string;
  seasonEnd: string;
  currentTab: StatsTabType;
}

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00`));
}

/**
 * Contenido pesado de standings: se renderiza dentro de <Suspense>
 * para que el shell (header/nav/selector/tabs) llegue al instante
 * mientras la tabla, rachas y stats se transmiten por streaming.
 */
export async function StandingsContent({
  leagueId,
  leagueSlug,
  seasonId,
  seasonName,
  seasonStatus,
  seasonStart,
  seasonEnd,
  currentTab,
}: StandingsContentProps) {
  const supabase = createPublicClient();

  const { data: standingsData, error: standingsError } = await supabase
    .from("standings")
    .select("id, team_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, updated_at")
    .eq("league_id", leagueId)
    .eq("season_id", seasonId)
    .order("points", { ascending: false })
    .order("goal_difference", { ascending: false })
    .order("goals_for", { ascending: false });

  if (standingsError) {
    throw standingsError;
  }

  const standings = (standingsData ?? []) as StandingItem[];
  const teamIds = [...new Set(standings.map((standing) => standing.team_id))];

  let teams: StandingTeamSummary[] = [];
  const formMap = new Map<string, ("W" | "D" | "L")[]>();

  if (teamIds.length > 0) {
    const [
      { data: teamsData, error: teamsError },
      { data: completedMatchesData },
    ] = await Promise.all([
      supabase
        .from("teams")
        .select("id, name, slug, logo_url")
        .eq("league_id", leagueId)
        .in("id", teamIds),
      supabase
        .from("matches")
        .select("home_team_id, away_team_id, home_score, away_score, scheduled_at")
        .eq("league_id", leagueId)
        .eq("season_id", seasonId)
        .eq("status", "completed")
        .order("scheduled_at", { ascending: false })
        .limit(teamIds.length * 5),
    ]);

    if (teamsError) {
      throw teamsError;
    }

    teams = (teamsData ?? []) as StandingTeamSummary[];

    for (const match of completedMatchesData ?? []) {
      const hScore = match.home_score ?? 0;
      const aScore = match.away_score ?? 0;
      let hResult: "W" | "D" | "L" = "D";
      let aResult: "W" | "D" | "L" = "D";
      if (hScore > aScore) {
        hResult = "W";
        aResult = "L";
      } else if (hScore < aScore) {
        hResult = "L";
        aResult = "W";
      }

      const hList = formMap.get(match.home_team_id) || [];
      if (hList.length < 5) {
        hList.push(hResult);
        formMap.set(match.home_team_id, hList);
      }

      const aList = formMap.get(match.away_team_id) || [];
      if (aList.length < 5) {
        aList.push(aResult);
        formMap.set(match.away_team_id, aList);
      }
    }

    for (const [tId, results] of formMap.entries()) {
      formMap.set(tId, [...results].reverse());
    }
  }

  const teamMap = new Map(teams.map((team) => [team.id, team]));

  const sortedStandings: StandingRowViewModel[] = standings
    .map((standing) => ({
      ...standing,
      team: teamMap.get(standing.team_id) ?? null,
      form: formMap.get(standing.team_id) || [],
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
      if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
      const aName = a.team?.name ?? "";
      const bName = b.team?.name ?? "";
      return aName.localeCompare(bName, "es", { sensitivity: "base" });
    });

  const needsStats = currentTab === "scorers" || currentTab === "fair-play";
  const needsPlayoffs = currentTab === "playoffs";

  const [seasonStats, playoffsData] = await Promise.all([
    needsStats
      ? getSeasonStats({ supabase, leagueId, seasonId })
      : Promise.resolve({ topScorers: [], fairPlayTeams: [], fairPlayPlayers: [] }),
    needsPlayoffs
      ? getSeasonPlayoffs({ supabase, leagueId, seasonId })
      : Promise.resolve({
          roundOf16: [],
          quarterFinals: [],
          semiFinals: [],
          thirdPlace: null,
          final: null,
          hasPlayoffs: false,
        }),
  ]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Eyebrow>Temporada seleccionada</Eyebrow>
              <p className="mt-1 text-sm text-gray-900">{seasonName}</p>
            </div>
            <div>
              <Eyebrow>Estado de temporada</Eyebrow>
              <p className="mt-1 text-sm text-gray-900">{formatLabel(seasonStatus)}</p>
            </div>
            <div>
              <Eyebrow>Rango</Eyebrow>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(seasonStart)} - {formatDate(seasonEnd)}
              </p>
            </div>
            <div>
              <Eyebrow>Equipos en tabla</Eyebrow>
              <p className="mt-1 text-sm font-medium text-gray-900">{sortedStandings.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {currentTab === "standings" && (
        sortedStandings.length === 0 ? (
          <EmptyState
            title="Sin tabla para la temporada seleccionada"
            description="Aún no hay tabla de posiciones generada para esta temporada. La tabla se actualiza automáticamente cuando se guardan resultados de partidos finalizados."
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Clasificación General</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:hidden">
                {sortedStandings.map((standing, index) => (
                  <StandingMobileCard
                    key={`${standing.team_id}-${standing.id}`}
                    row={standing}
                    position={index + 1}
                    leagueSlug={leagueSlug}
                    basePath="/liga"
                  />
                ))}
              </div>

              <div className="hidden md:block">
                <StandingsTableView rows={sortedStandings} leagueSlug={leagueSlug} basePath="/liga" />
              </div>
            </CardContent>
          </Card>
        )
      )}

      {currentTab === "playoffs" && (
        <Card>
          <CardHeader>
            <CardTitle>Liguilla y Fases Finales</CardTitle>
          </CardHeader>
          <CardContent>
            <PlayoffBracket
              bracket={playoffsData}
              leagueSlug={leagueSlug}
              basePath="/liga"
            />
          </CardContent>
        </Card>
      )}

      {currentTab === "scorers" && (
        <Card>
          <CardHeader>
            <CardTitle>Tabla de Goleo Individual</CardTitle>
          </CardHeader>
          <CardContent>
            <TopScorersTable
              scorers={seasonStats.topScorers}
              leagueSlug={leagueSlug}
              basePath="/liga"
            />
          </CardContent>
        </Card>
      )}

      {currentTab === "fair-play" && (
        <Card>
          <CardHeader>
            <CardTitle>Fair Play y Amonestaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <FairPlayTable
              teams={seasonStats.fairPlayTeams}
              players={seasonStats.fairPlayPlayers}
              leagueSlug={leagueSlug}
              basePath="/liga"
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}
