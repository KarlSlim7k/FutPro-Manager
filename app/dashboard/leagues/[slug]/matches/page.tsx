import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CreateMatchForm } from "@/components/matches/create-match-form";
import { MatchCard } from "@/components/matches/match-card";
import { MatchSeasonSelector } from "@/components/matches/match-season-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { League, Match, Season, Team, Venue } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;
type SeasonOption = Pick<Season, "id" | "name" | "start_date">;
type TeamOption = Pick<Team, "id" | "name" | "status">;
type VenueOption = Pick<Venue, "id" | "name">;
type MatchListItem = Pick<
  Match,
  | "id"
  | "season_id"
  | "home_team_id"
  | "away_team_id"
  | "venue_id"
  | "scheduled_at"
  | "status"
  | "home_score"
  | "away_score"
  | "round_name"
>;

interface MatchesPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ seasonId?: string | string[] }>;
}

export default async function MatchesPage({ params, searchParams }: MatchesPageProps) {
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

  const [
    { data: seasonsData, error: seasonsError },
    { data: teamsData, error: teamsError },
    { data: venuesData, error: venuesError },
  ] = await Promise.all([
    supabase
      .from("seasons")
      .select("id, name, start_date")
      .eq("league_id", league.id)
      .order("start_date", { ascending: false }),
    supabase
      .from("teams")
      .select("id, name, status")
      .eq("league_id", league.id)
      .order("name", { ascending: true }),
    supabase.from("venues").select("id, name").eq("league_id", league.id).order("name", { ascending: true }),
  ]);

  if (seasonsError) throw seasonsError;
  if (teamsError) throw teamsError;
  if (venuesError) throw venuesError;

  const seasons = (seasonsData ?? []) as SeasonOption[];
  const teams = (teamsData ?? []) as TeamOption[];
  const venues = (venuesData ?? []) as VenueOption[];

  const selectedSeason = seasons.find((season) => season.id === seasonId) ?? seasons[0] ?? null;

  if (!selectedSeason) {
    return (
      <section className="space-y-6">
        <div className="space-y-3">
          <Link
            href={`/dashboard/leagues/${league.slug}`}
            className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
          >
            Volver al detalle de liga
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Partidos</h1>
            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Programa y consulta los partidos de <span className="font-medium text-gray-900">{league.name}</span>.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sin temporadas registradas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Necesitas al menos una temporada para comenzar a programar partidos.
            </p>
            <Link
              href={`/dashboard/leagues/${league.slug}/seasons`}
              className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
            >
              Ir al módulo de temporadas
            </Link>
          </CardContent>
        </Card>
      </section>
    );
  }

  const { data: matchesData, error: matchesError } = await supabase
    .from("matches")
    .select("id, season_id, home_team_id, away_team_id, venue_id, scheduled_at, status, home_score, away_score, round_name")
    .eq("league_id", league.id)
    .eq("season_id", selectedSeason.id)
    .order("scheduled_at", { ascending: true });

  if (matchesError) {
    throw matchesError;
  }

  const matches = (matchesData ?? []) as MatchListItem[];

  const activeTeams = teams.filter((team) => team.status === "active");
  const teamsForScheduling = activeTeams.length >= 2 ? activeTeams : teams;

  const teamsMap = new Map(teams.map((team) => [team.id, team.name]));
  const venuesMap = new Map(venues.map((venue) => [venue.id, venue.name]));

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <Link
          href={`/dashboard/leagues/${league.slug}`}
          className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
        >
          Volver al detalle de liga
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Partidos</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Programa y consulta los partidos de <span className="font-medium text-gray-900">{league.name}</span>.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Temporadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <MatchSeasonSelector
            leagueSlug={league.slug}
            seasons={seasons.map((season) => ({ id: season.id, name: season.name }))}
            selectedSeasonId={selectedSeason.id}
          />
          <p className="text-sm text-gray-600">
            Mostrando calendario para <span className="font-medium text-gray-900">{selectedSeason.name}</span>.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900">Calendario</h2>

          {matches.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Sin partidos programados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Aún no hay partidos para la temporada seleccionada. Programa el primer encuentro usando el formulario.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  matchId={match.id}
                  leagueSlug={league.slug}
                  homeTeamName={teamsMap.get(match.home_team_id) ?? "Equipo local"}
                  awayTeamName={teamsMap.get(match.away_team_id) ?? "Equipo visitante"}
                  venueName={match.venue_id ? (venuesMap.get(match.venue_id) ?? null) : null}
                  scheduledAt={match.scheduled_at}
                  status={match.status}
                  homeScore={match.home_score}
                  awayScore={match.away_score}
                  roundName={match.round_name}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Programar partido</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateMatchForm
                leagueSlug={league.slug}
                seasons={seasons.map((season) => ({ id: season.id, name: season.name }))}
                teams={teamsForScheduling.map((team) => ({ id: team.id, name: team.name }))}
                venues={venues.map((venue) => ({ id: venue.id, name: venue.name }))}
                initialSeasonId={selectedSeason.id}
              />
            </CardContent>
          </Card>

          {activeTeams.length < 2 && teams.length >= 2 ? (
            <Card>
              <CardContent>
                <p className="text-sm text-amber-700">
                  Se muestran todos los equipos porque no hay al menos 2 equipos activos en esta liga.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </section>
  );
}
