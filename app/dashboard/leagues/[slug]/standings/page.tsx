import { notFound, redirect } from "next/navigation";
import { StandingMobileCard } from "@/components/standings/standing-mobile-card";
import { StandingsRecalcHistory, type StandingsRecalcEntry } from "@/components/standings/standings-recalc-history";
import { StandingsSeasonSelector } from "@/components/standings/standings-season-selector";
import { StandingsTableView } from "@/components/standings/standings-table-view";
import type { StandingRowViewModel, StandingTeamSummary } from "@/components/standings/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { ToolbarActions } from "@/components/ui/toolbar-actions";
import { createClient } from "@/lib/supabase/server";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";
import type { League, Season, Standing } from "@/types/database";

import { SeasonStatsTabs, type StatsTabType } from "@/components/stats/season-stats-tabs";
import { TopScorersTable } from "@/components/stats/top-scorers-table";
import { FairPlayTable } from "@/components/stats/fair-play-table";
import { PlayoffBracket } from "@/components/playoffs/playoff-bracket";
import { getSeasonStats } from "@/lib/stats/get-season-stats";
import { getSeasonPlayoffs } from "@/lib/playoffs/get-season-playoffs";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;
type SeasonItem = Pick<Season, "id" | "name" | "slug" | "status" | "start_date" | "end_date">;
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

interface LeagueStandingsPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ seasonId?: string | string[]; tab?: string | string[] }>;
}

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function LeagueStandingsPage({ params, searchParams }: LeagueStandingsPageProps) {
  const { slug } = await params;
  const { seasonId: rawSeasonId, tab: rawTab } = await searchParams;
  const seasonId = Array.isArray(rawSeasonId) ? rawSeasonId[0] : rawSeasonId;
  const tabValue = Array.isArray(rawTab) ? rawTab[0] : rawTab;
  const currentTab: StatsTabType =
    tabValue === "scorers" || tabValue === "fair-play" || tabValue === "playoffs"
      ? tabValue
      : "standings";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: leagueData, error: leagueError } = await supabase
    .from("leagues")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (leagueError) {
    throw leagueError;
  }

  if (!leagueData) {
    notFound();
  }

  const league = leagueData as LeagueSummary;

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: league.id,
  });

  const { data: seasonsData, error: seasonsError } = await supabase
    .from("seasons")
    .select("id, name, slug, status, start_date, end_date")
    .eq("league_id", league.id)
    .order("start_date", { ascending: false });

  if (seasonsError) {
    throw seasonsError;
  }

  const seasons = (seasonsData ?? []) as SeasonItem[];

  if (seasons.length === 0) {
    return (
      <section className="space-y-6">
        <PageHeader
          backHref={`/dashboard/leagues/${league.slug}`}
          backLabel="Volver al detalle de liga"
          title="Tabla de posiciones"
          description={
            <>
              Consulta la clasificación de equipos de{" "}
              <span className="font-medium text-gray-900">{league.name}</span> por temporada.
            </>
          }
        />

        <EmptyState
          title="Sin temporadas registradas"
          description="Esta liga aún no tiene temporadas registradas. Crea una temporada antes de consultar la tabla de posiciones."
          action={
            <TextLink href={`/dashboard/leagues/${league.slug}/seasons`}>
              Ir al módulo de temporadas
            </TextLink>
          }
        />
      </section>
    );
  }

  const fallbackSeason = seasons[0];

  if (seasonId) {
    const hasSeason = seasons.some((seasonItem) => seasonItem.id === seasonId);
    if (!hasSeason) {
      redirect(`/dashboard/leagues/${league.slug}/standings?seasonId=${fallbackSeason.id}`);
    }
  }

  const selectedSeason = seasonId ? seasons.find((seasonItem) => seasonItem.id === seasonId)! : fallbackSeason;

  const { data: standingsData, error: standingsError } = await supabase
    .from("standings")
    .select("id, team_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, updated_at")
    .eq("league_id", league.id)
    .eq("season_id", selectedSeason.id)
    .order("points", { ascending: false })
    .order("goal_difference", { ascending: false })
    .order("goals_for", { ascending: false });

  if (standingsError) {
    throw standingsError;
  }

  const standings = (standingsData ?? []) as StandingItem[];
  const teamIds = [...new Set(standings.map((standing) => standing.team_id))];

  let teams: StandingTeamSummary[] = [];
  if (teamIds.length > 0) {
    const { data: teamsData, error: teamsError } = await supabase
      .from("teams")
      .select("id, name, slug")
      .eq("league_id", league.id)
      .in("id", teamIds);

    if (teamsError) {
      throw teamsError;
    }

    teams = (teamsData ?? []) as StandingTeamSummary[];
  }

  const teamMap = new Map(teams.map((team) => [team.id, team]));

  const sortedStandings: StandingRowViewModel[] = standings
    .map((standing) => ({
      ...standing,
      team: teamMap.get(standing.team_id) ?? null,
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
      if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
      const aName = a.team?.name ?? "";
      const bName = b.team?.name ?? "";
      return aName.localeCompare(bName, "es", { sensitivity: "base" });
    });

  const latestUpdatedAt = sortedStandings.reduce<Date | null>((latest, row) => {
    if (!row.updated_at) return latest;
    const parsed = new Date(row.updated_at);
    if (Number.isNaN(parsed.getTime())) return latest;
    if (!latest || parsed.getTime() > latest.getTime()) {
      return parsed;
    }
    return latest;
  }, null);

  const [seasonStats, playoffsData] = await Promise.all([
    getSeasonStats({
      supabase,
      leagueId: league.id,
      seasonId: selectedSeason.id,
    }),
    getSeasonPlayoffs({
      supabase,
      leagueId: league.id,
      seasonId: selectedSeason.id,
    }),
  ]);

  // Historial de recálculos desde auditoría (visible para admins de liga)
  let recalcHistory: StandingsRecalcEntry[] = [];
  if (permissions.canViewAuditLogs) {
    const { data: recalcData } = await supabase
      .from("audit_logs")
      .select("id, action, actor_id, metadata, created_at")
      .eq("league_id", league.id)
      .eq("entity_type", "season")
      .eq("entity_id", selectedSeason.id)
      .in("action", ["standings.recalculated_manual", "standings.recalculated_auto", "standings.recalculate_failed"])
      .order("created_at", { ascending: false })
      .limit(10);

    const recalcRows = recalcData ?? [];
    if (recalcRows.length > 0) {
      const actorIds = [...new Set(recalcRows.map((r) => r.actor_id).filter((id): id is string => id !== null))];
      let namesMap = new Map<string, string>();
      if (actorIds.length > 0) {
        const { data: recalcProfiles } = await supabase
          .from("profiles")
          .select("id, full_name, display_name")
          .in("id", actorIds);
        if (recalcProfiles) {
          namesMap = new Map(
            recalcProfiles.map((p) => [p.id, p.display_name || p.full_name || `Usuario ${p.id.slice(0, 8)}...`])
          );
        }
      }
      recalcHistory = recalcRows.map((row) => {
        const meta = (row.metadata ?? {}) as Record<string, unknown>;
        const rowsCount = typeof meta.rows_count === "number" ? meta.rows_count : null;
        const trigger = typeof meta.trigger === "string" ? meta.trigger : null;
        const summary =
          rowsCount !== null
            ? `${rowsCount} fila(s)${trigger ? ` · origen: ${trigger}` : ""}`
            : trigger
              ? `Origen: ${trigger}`
              : null;
        return {
          id: row.id as string,
          action: row.action as string,
          createdAt: row.created_at as string,
          actorName: row.actor_id ? (namesMap.get(row.actor_id as string) ?? null) : null,
          summary,
        };
      });
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        backHref={`/dashboard/leagues/${league.slug}`}
        backLabel="Volver al detalle de liga"
        title="Tabla de posiciones y estadísticas"
        description={
          <>
            Consulta la clasificación de equipos y estadísticas de{" "}
            <span className="font-medium text-gray-900">{league.name}</span> por temporada.
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Temporadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">Selecciona una temporada para consultar sus estadísticas.</p>
          <StandingsSeasonSelector
            leagueSlug={league.slug}
            seasons={seasons.map((seasonItem) => ({ id: seasonItem.id, name: seasonItem.name }))}
            selectedSeasonId={selectedSeason.id}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Eyebrow>Temporada seleccionada</Eyebrow>
              <p className="mt-1 text-sm text-gray-900">{selectedSeason.name}</p>
            </div>
            <div>
              <Eyebrow>Estado de temporada</Eyebrow>
              <p className="mt-1 text-sm text-gray-900">{formatLabel(selectedSeason.status)}</p>
            </div>
            <div>
              <Eyebrow>Rango</Eyebrow>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(selectedSeason.start_date)} - {formatDate(selectedSeason.end_date)}
              </p>
            </div>
            <div>
              <Eyebrow>Equipos en tabla</Eyebrow>
              <p className="mt-1 text-sm font-medium text-gray-900">{sortedStandings.length}</p>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <Eyebrow>Última actualización</Eyebrow>
              <p className="mt-1 text-sm text-gray-900">
                {latestUpdatedAt ? formatDateTime(latestUpdatedAt.toISOString()) : "Sin registros"}
              </p>
            </div>
          </div>

          {permissions.canRecalculateStandings ? (
            <ToolbarActions>
              <TextLink href={`/dashboard/leagues/${league.slug}/seasons/${selectedSeason.slug}/standings`}>
                Recalcular tabla
              </TextLink>
            </ToolbarActions>
          ) : null}
        </CardContent>
      </Card>

      <SeasonStatsTabs
        currentTab={currentTab}
        basePath={`/dashboard/leagues/${league.slug}/standings`}
      />

      {currentTab === "standings" && (
        sortedStandings.length === 0 ? (
          <EmptyState
            title="Sin tabla para la temporada seleccionada"
            description={
              <>
                <p>Aún no hay tabla de posiciones generada para esta temporada.</p>
                <p className="mt-2">
                  La tabla se actualiza automáticamente cuando se guardan resultados de partidos
                  finalizados.
                  {permissions.canRecalculateStandings
                    ? " También puedes recalcularla manualmente desde la temporada."
                    : " El recálculo manual está disponible para administradores de liga."}
                </p>
              </>
            }
            action={
              <ToolbarActions>
                <TextLink href={`/dashboard/leagues/${league.slug}/matches`}>Ver partidos</TextLink>
                <TextLink href={`/dashboard/leagues/${league.slug}/teams`}>Ver equipos</TextLink>
                {permissions.canRecalculateStandings ? (
                  <TextLink href={`/dashboard/leagues/${league.slug}/seasons/${selectedSeason.slug}/standings`}>
                    Recalcular tabla
                  </TextLink>
                ) : null}
              </ToolbarActions>
            }
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
                    leagueSlug={league.slug}
                  />
                ))}
              </div>

              <div className="hidden md:block">
                <StandingsTableView rows={sortedStandings} leagueSlug={league.slug} />
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
              leagueSlug={league.slug}
              basePath="/dashboard/leagues"
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
              leagueSlug={league.slug}
              basePath="/dashboard/leagues"
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
              leagueSlug={league.slug}
              basePath="/dashboard/leagues"
            />
          </CardContent>
        </Card>
      )}

      {permissions.canViewAuditLogs ? <StandingsRecalcHistory entries={recalcHistory} /> : null}
    </section>
  );
}
