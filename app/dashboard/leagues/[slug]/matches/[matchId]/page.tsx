import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { MatchSummary } from "@/components/matches/match-summary";
import type { League, Match, Season, Team, Venue } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;

interface MatchDetailPageProps {
  params: Promise<{ slug: string; matchId: string }>;
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { slug, matchId } = await params;
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

  const { data: matchData, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .eq("league_id", league.id)
    .maybeSingle();

  if (matchError) {
    throw matchError;
  }

  if (!matchData) {
    notFound();
  }

  const match = matchData as Match;

  // Fetch related names
  const [
    { data: seasonData },
    { data: homeTeamData },
    { data: awayTeamData },
    { data: venueData },
  ] = await Promise.all([
    supabase.from("seasons").select("id, name, slug").eq("id", match.season_id).maybeSingle(),
    supabase.from("teams").select("id, name, slug").eq("id", match.home_team_id).maybeSingle(),
    supabase.from("teams").select("id, name, slug").eq("id", match.away_team_id).maybeSingle(),
    match.venue_id
      ? supabase.from("venues").select("id, name").eq("id", match.venue_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const season = seasonData as Pick<Season, "id" | "name" | "slug"> | null;
  const homeTeam = homeTeamData as Pick<Team, "id" | "name" | "slug"> | null;
  const awayTeam = awayTeamData as Pick<Team, "id" | "name" | "slug"> | null;
  const venue = venueData as Pick<Venue, "id" | "name"> | null;

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <Link
          href={`/dashboard/leagues/${league.slug}/matches`}
          className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
        >
          Volver a partidos
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {homeTeam?.name ?? "Local"} vs {awayTeam?.name ?? "Visitante"}
          </h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Liga: <span className="font-medium text-gray-900">{league.name}</span>
          </p>
        </div>
      </div>

      <MatchSummary
        leagueSlug={league.slug}
        seasonId={season?.id ?? match.season_id}
        seasonName={season?.name ?? "Desconocida"}
        seasonSlug={season?.slug ?? ""}
        homeTeamId={match.home_team_id}
        homeTeamName={homeTeam?.name ?? "Desconocido"}
        homeTeamSlug={homeTeam?.slug ?? ""}
        awayTeamId={match.away_team_id}
        awayTeamName={awayTeam?.name ?? "Desconocido"}
        awayTeamSlug={awayTeam?.slug ?? ""}
        venueId={match.venue_id}
        venueName={venue?.name ?? null}
        scheduledAt={match.scheduled_at}
        status={match.status}
        homeScore={match.home_score}
        awayScore={match.away_score}
        roundName={match.round_name}
        createdAt={match.created_at}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Eventos del partido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Módulo en preparación. Aquí se mostrarán goles, tarjetas y sustituciones.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Captura de resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Módulo en preparación. Aquí se registrará el marcador final.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Módulo en preparación. Aquí se mostrarán estadísticas del partido.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
