import { notFound, redirect } from "next/navigation";
import { StandingMobileCard } from "@/components/standings/standing-mobile-card";
import { StandingsSeasonSelector } from "@/components/standings/standings-season-selector";
import { StandingsTableView } from "@/components/standings/standings-table-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { ToolbarActions } from "@/components/ui/toolbar-actions";
import { createClient } from "@/lib/supabase/server";
import type { League, Season, Standing } from "@/types/database";

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

type TeamSummary = {
  id: string;
  name: string;
  slug: string | null;
};

type StandingRow = StandingItem & {
  team: TeamSummary | null;
};

interface LeagueStandingsPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ seasonId?: string | string[] }>;
}

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00`));
}

export default async function LeagueStandingsPage({ params, searchParams }: LeagueStandingsPageProps) {
  const { slug } = await params;
  const { seasonId: rawSeasonId } = await searchParams;
  const seasonId = Array.isArray(rawSeasonId) ? rawSeasonId[0] : rawSeasonId;

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

  const { data: seasonsData, error: seasonsError } = await supabase
    .from("seasons")
    .select("id, name, slug, status, start_date, end_date")
    .eq("league_id", league.id)
    .order("start_date", { ascending: false });

  if (seasonsError) {
    throw seasonsError;
  }

  const seasons = (seasonsData ?? []) as SeasonItem[];
  const selectedSeason = seasons.find((seasonItem) => seasonItem.id === seasonId) ?? seasons[0] ?? null;

  if (!selectedSeason) {
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

  let teams: TeamSummary[] = [];
  if (teamIds.length > 0) {
    const { data: teamsData, error: teamsError } = await supabase
      .from("teams")
      .select("id, name, slug")
      .eq("league_id", league.id)
      .in("id", teamIds);

    if (teamsError) {
      throw teamsError;
    }

    teams = (teamsData ?? []) as TeamSummary[];
  }

  const teamMap = new Map(teams.map((team) => [team.id, team]));

  const sortedStandings: StandingRow[] = standings
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

  const standingsBasePath = `/dashboard/leagues/${league.slug}/standings`;

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

      <Card>
        <CardHeader>
          <CardTitle>Temporadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">Selecciona una temporada para consultar su clasificación.</p>
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
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <Eyebrow>URL activa</Eyebrow>
            <p className="mt-1 break-all text-sm text-gray-900">
              {standingsBasePath}?seasonId={selectedSeason.id}
            </p>
          </div>
        </CardContent>
      </Card>

      {sortedStandings.length === 0 ? (
        <EmptyState
          title="Sin tabla para la temporada seleccionada"
          description={
            <>
              <p>Aún no hay tabla de posiciones generada para esta temporada.</p>
              <p className="mt-2">La generación automática de standings se implementará en una fase posterior.</p>
            </>
          }
          action={
            <ToolbarActions>
              <TextLink href={`/dashboard/leagues/${league.slug}/matches`}>Ver partidos</TextLink>
              <TextLink href={`/dashboard/leagues/${league.slug}/teams`}>Ver equipos</TextLink>
            </ToolbarActions>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Clasificación</CardTitle>
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
      )}
    </section>
  );
}
