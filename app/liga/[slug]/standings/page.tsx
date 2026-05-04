import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { StandingMobileCard } from "@/components/standings/standing-mobile-card";
import { StandingsSeasonSelector } from "@/components/standings/standings-season-selector";
import { StandingsTableView } from "@/components/standings/standings-table-view";
import type { StandingRowViewModel, StandingTeamSummary } from "@/components/standings/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PublicLeagueHeader } from "@/components/public/public-league-header";
import { PublicNav } from "@/components/public/public-nav";
import { createClient } from "@/lib/supabase/server";
import type { League, Season, Standing } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug" | "description" | "status">;
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

interface LeagueStandingsPublicPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ seasonId?: string | string[] }>;
}

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00`));
}

export async function generateMetadata({ params }: LeagueStandingsPublicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("leagues")
    .select("name")
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("status", "active")
    .maybeSingle();

  if (!data) {
    return { title: "Liga no encontrada | FutPro Manager" };
  }

  return {
    title: `Tabla de posiciones - ${data.name} | FutPro Manager`,
  };
}

export default async function LeagueStandingsPublicPage({ params, searchParams }: LeagueStandingsPublicPageProps) {
  const { slug } = await params;
  const { seasonId: rawSeasonId } = await searchParams;
  const seasonId = Array.isArray(rawSeasonId) ? rawSeasonId[0] : rawSeasonId;

  const supabase = await createClient();

  const { data: leagueData, error: leagueError } = await supabase
    .from("leagues")
    .select("id, name, slug, description, status")
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("status", "active")
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

  if (seasons.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-100">
        <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <PublicLeagueHeader league={league} />
          <PublicNav leagueSlug={league.slug} />
          <EmptyState
            title="Sin temporadas registradas"
            description="Esta liga aún no tiene temporadas registradas. La tabla de posiciones estará disponible cuando existan temporadas."
          />
        </section>
      </main>
    );
  }

  const fallbackSeason = seasons[0];

  if (seasonId) {
    const hasSeason = seasons.some((seasonItem) => seasonItem.id === seasonId);
    if (!hasSeason) {
      redirect(`/liga/${league.slug}/standings?seasonId=${fallbackSeason.id}`);
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-100">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <PublicLeagueHeader league={league} />
        <PublicNav leagueSlug={league.slug} />

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
              basePath="/liga"
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
            </div>
          </CardContent>
        </Card>

        {sortedStandings.length === 0 ? (
          <EmptyState
            title="Sin tabla para la temporada seleccionada"
            description="Aún no hay tabla de posiciones generada para esta temporada. La tabla se actualiza automáticamente cuando se guardan resultados de partidos finalizados."
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
                    basePath="/liga"
                  />
                ))}
              </div>

              <div className="hidden md:block">
                <StandingsTableView rows={sortedStandings} leagueSlug={league.slug} basePath="/liga" />
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}
