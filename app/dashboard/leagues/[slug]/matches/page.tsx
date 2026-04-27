import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { CreateMatchForm } from "@/components/matches/create-match-form";
import { MatchCard } from "@/components/matches/match-card";
import type { League, Match, Season, Team, Venue } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;

type SeasonOption = Pick<Season, "id" | "name">;
type TeamOption = Pick<Team, "id" | "name">;
type VenueOption = Pick<Venue, "id" | "name">;

interface MatchesPageProps {
  params: Promise<{ slug: string }>;
}

export default async function MatchesPage({ params }: MatchesPageProps) {
  const { slug } = await params;
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
    { data: matchesData, error: matchesError },
  ] = await Promise.all([
    supabase.from("seasons").select("id, name").eq("league_id", league.id).order("created_at", { ascending: true }),
    supabase.from("teams").select("id, name").eq("league_id", league.id).order("name", { ascending: true }),
    supabase.from("venues").select("id, name").eq("league_id", league.id).order("name", { ascending: true }),
    supabase.from("matches").select("*").eq("league_id", league.id).order("scheduled_at", { ascending: true }),
  ]);

  if (seasonsError) throw seasonsError;
  if (teamsError) throw teamsError;
  if (venuesError) throw venuesError;
  if (matchesError) throw matchesError;

  const seasons = (seasonsData ?? []) as SeasonOption[];
  const teams = (teamsData ?? []) as TeamOption[];
  const venues = (venuesData ?? []) as VenueOption[];
  const matches = (matchesData ?? []) as Match[];

  // Build lookup maps
  const seasonMap = new Map(seasons.map((s) => [s.id, s.name]));
  const teamMap = new Map(teams.map((t) => [t.id, t.name]));
  const venueMap = new Map(venues.map((v) => [v.id, v.name]));

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <Link
          href={`/dashboard/leagues/${league.slug}`}
          className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
        >
          Volver a la liga
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Partidos</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Liga: <span className="font-medium text-gray-900">{league.name}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Calendario</h2>
          {matches.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-sm text-gray-600">
                  No hay partidos programados todavía. Usa el formulario para crear el primer partido.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  matchId={match.id}
                  leagueSlug={league.slug}
                  seasonName={seasonMap.get(match.season_id) ?? "Desconocida"}
                  homeTeamName={teamMap.get(match.home_team_id) ?? "Desconocido"}
                  awayTeamName={teamMap.get(match.away_team_id) ?? "Desconocido"}
                  venueName={match.venue_id ? (venueMap.get(match.venue_id) ?? null) : null}
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

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Programar partido</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateMatchForm leagueSlug={league.slug} seasons={seasons} teams={teams} venues={venues} />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
