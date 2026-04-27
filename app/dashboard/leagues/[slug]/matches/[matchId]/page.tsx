import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { MatchSummary } from "@/components/matches/match-summary";
import { UpdateMatchResultForm } from "@/components/matches/update-match-result-form";
import { CreateMatchEventForm } from "@/components/matches/create-match-event-form";
import { MatchEventList } from "@/components/matches/match-event-list";
import type { League, Match, Season, Team, Venue, MatchEvent, Player, PlayerTeamRegistration } from "@/types/database";

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

  // Fetch related names, events and active player registrations
  const [
    { data: seasonData },
    { data: homeTeamData },
    { data: awayTeamData },
    { data: venueData },
    { data: eventsData },
    { data: registrationsData },
  ] = await Promise.all([
    supabase.from("seasons").select("id, name, slug").eq("id", match.season_id).maybeSingle(),
    supabase.from("teams").select("id, name, slug").eq("id", match.home_team_id).maybeSingle(),
    supabase.from("teams").select("id, name, slug").eq("id", match.away_team_id).maybeSingle(),
    match.venue_id
      ? supabase.from("venues").select("id, name").eq("id", match.venue_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("match_events")
      .select("*")
      .eq("match_id", matchId)
      .order("minute", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("player_team_registrations")
      .select("id, player_id, team_id, jersey_number")
      .eq("season_id", match.season_id)
      .in("team_id", [match.home_team_id, match.away_team_id])
      .eq("status", "active"),
  ]);

  const season = seasonData as Pick<Season, "id" | "name" | "slug"> | null;
  const homeTeam = homeTeamData as Pick<Team, "id" | "name" | "slug"> | null;
  const awayTeam = awayTeamData as Pick<Team, "id" | "name" | "slug"> | null;
  const venue = venueData as Pick<Venue, "id" | "name"> | null;
  const events = (eventsData ?? []) as MatchEvent[];

  type RegistrationRow = { id: string; player_id: string; team_id: string; jersey_number: number | null };
  const registrations = (registrationsData ?? []) as RegistrationRow[];
  const playerIds = [...new Set(registrations.map((r) => r.player_id))];
  const { data: playersData } =
    playerIds.length > 0
      ? await supabase.from("players").select("id, full_name, preferred_position").in("id", playerIds)
      : { data: [] };

  type PlayerRow = { id: string; full_name: string; preferred_position: string | null };
  const playersFromDb = (playersData ?? []) as PlayerRow[];
  const playersMap = new Map(playersFromDb.map((p) => [p.id, p]));
  const playersForForm = registrations.map((reg) => {
    const player = playersMap.get(reg.player_id);
    return {
      id: reg.player_id,
      team_id: reg.team_id,
      full_name: player?.full_name ?? "Jugador desconocido",
      preferred_position: player?.preferred_position ?? null,
    };
  });

  const teamsMap: Record<string, { name: string }> = {};
  if (homeTeam) teamsMap[homeTeam.id] = homeTeam;
  if (awayTeam) teamsMap[awayTeam.id] = awayTeam;

  const playersMapForList: Record<string, { full_name: string }> = {};
  playersFromDb.forEach((p) => {
    playersMapForList[p.id] = p;
  });

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
          <CardContent className="space-y-6">
            <CreateMatchEventForm
              leagueSlug={league.slug}
              matchId={match.id}
              homeTeam={{ id: match.home_team_id, name: homeTeam?.name ?? "Local" }}
              awayTeam={{ id: match.away_team_id, name: awayTeam?.name ?? "Visitante" }}
              players={playersForForm}
            />
            <div className="border-t border-gray-100 pt-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Registro</h3>
              <MatchEventList
                events={events}
                teamsMap={teamsMap}
                playersMap={playersMapForList}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Captura de resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <UpdateMatchResultForm
              leagueSlug={league.slug}
              matchId={match.id}
              initialHomeScore={match.home_score}
              initialAwayScore={match.away_score}
              initialStatus={match.status}
            />
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
