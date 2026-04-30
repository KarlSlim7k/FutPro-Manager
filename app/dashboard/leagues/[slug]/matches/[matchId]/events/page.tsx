import { notFound, redirect } from "next/navigation";
import { CreateMatchEventForm } from "@/components/matches/create-match-event-form";
import { MatchEventCard } from "@/components/matches/match-event-card";
import { MatchStatusBadge } from "@/components/matches/match-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TextLink } from "@/components/ui/text-link";
import { createClient } from "@/lib/supabase/server";
import type { League, Match, MatchEvent, Player, PlayerTeamRegistration, Season, Team, Venue } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;
type MatchSummary = Pick<
  Match,
  | "id"
  | "league_id"
  | "season_id"
  | "home_team_id"
  | "away_team_id"
  | "venue_id"
  | "status"
  | "home_score"
  | "away_score"
  | "round_name"
>;
type SeasonSummary = Pick<Season, "id" | "name">;
type TeamSummary = Pick<Team, "id" | "name">;
type VenueSummary = Pick<Venue, "id" | "name">;
type RegistrationSummary = Pick<PlayerTeamRegistration, "id" | "player_id" | "team_id" | "status">;
type PlayerSummary = Pick<Player, "id" | "full_name" | "preferred_position">;
type EventSummary = Pick<
  MatchEvent,
  "id" | "match_id" | "team_id" | "player_id" | "event_type" | "minute" | "notes" | "created_by" | "created_at" | "updated_at"
>;
type FormPlayerOption = {
  id: string;
  full_name: string;
  preferred_position: string | null;
  team_id: string;
};

interface MatchEventsPageProps {
  params: Promise<{ slug: string; matchId: string }>;
}

export default async function MatchEventsPage({ params }: MatchEventsPageProps) {
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
    .select("id, league_id, season_id, home_team_id, away_team_id, venue_id, status, home_score, away_score, round_name")
    .eq("id", matchId)
    .eq("league_id", league.id)
    .maybeSingle();

  if (matchError) {
    throw matchError;
  }

  if (!matchData) {
    notFound();
  }

  const match = matchData as MatchSummary;
  const participatingTeamIds = [match.home_team_id, match.away_team_id];

  const [seasonResult, teamsResult, venueResult, registrationsResult, eventsResult] = await Promise.all([
    supabase.from("seasons").select("id, name").eq("id", match.season_id).eq("league_id", league.id).maybeSingle(),
    supabase.from("teams").select("id, name").in("id", participatingTeamIds).eq("league_id", league.id),
    match.venue_id
      ? supabase.from("venues").select("id, name").eq("id", match.venue_id).eq("league_id", league.id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from("player_team_registrations")
      .select("id, player_id, team_id, status")
      .eq("season_id", match.season_id)
      .in("team_id", participatingTeamIds)
      .eq("status", "active"),
    supabase
      .from("match_events")
      .select("id, match_id, team_id, player_id, event_type, minute, notes, created_by, created_at, updated_at")
      .eq("match_id", match.id)
      .order("minute", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (seasonResult.error) throw seasonResult.error;
  if (teamsResult.error) throw teamsResult.error;
  if (venueResult.error) throw venueResult.error;
  if (registrationsResult.error) throw registrationsResult.error;
  if (eventsResult.error) throw eventsResult.error;

  const season = seasonResult.data as SeasonSummary | null;
  const teams = (teamsResult.data ?? []) as TeamSummary[];
  const venue = venueResult.data as VenueSummary | null;
  const registrations = (registrationsResult.data ?? []) as RegistrationSummary[];
  const events = (eventsResult.data ?? []) as EventSummary[];

  const teamsById = new Map(teams.map((team) => [team.id, team]));
  const homeTeam = teamsById.get(match.home_team_id) ?? { id: match.home_team_id, name: "Equipo local" };
  const awayTeam = teamsById.get(match.away_team_id) ?? { id: match.away_team_id, name: "Equipo visitante" };

  const playerIds = [...new Set(registrations.map((registration) => registration.player_id))];
  let players: PlayerSummary[] = [];

  if (playerIds.length > 0) {
    const { data: playersData, error: playersError } = await supabase
      .from("players")
      .select("id, full_name, preferred_position")
      .eq("league_id", league.id)
      .in("id", playerIds);

    if (playersError) {
      throw playersError;
    }

    players = (playersData ?? []) as PlayerSummary[];
  }

  const playersById = new Map(players.map((player) => [player.id, player]));
  const formPlayers = registrations
    .map((registration): FormPlayerOption | null => {
      const player = playersById.get(registration.player_id);
      if (!player) return null;

      return {
        id: player.id,
        full_name: player.full_name,
        preferred_position: player.preferred_position,
        team_id: registration.team_id,
      };
    })
    .filter((player): player is FormPlayerOption => player !== null)
    .filter(
      (player, index, allPlayers) =>
        allPlayers.findIndex(
          (candidate) => candidate.id === player.id && candidate.team_id === player.team_id
        ) === index
    )
    .sort((a, b) => {
      const teamPositionA = a.team_id === homeTeam.id ? 0 : 1;
      const teamPositionB = b.team_id === homeTeam.id ? 0 : 1;

      if (teamPositionA !== teamPositionB) {
        return teamPositionA - teamPositionB;
      }

      return a.full_name.localeCompare(b.full_name, "es-MX");
    });

  const playerNameById = new Map(players.map((player) => [player.id, player.full_name]));

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <TextLink
          href={`/dashboard/leagues/${league.slug}/matches/${match.id}`}
        >
          Volver al detalle del partido
        </TextLink>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Eventos del partido</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            {homeTeam.name} vs {awayTeam.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen del partido</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Eyebrow>Temporada</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{season?.name ?? "No disponible"}</p>
          </div>
          <div>
            <Eyebrow>Jornada / Ronda</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{match.round_name || "No definida"}</p>
          </div>
          <div>
            <Eyebrow>Marcador actual</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">
              {match.home_score} - {match.away_score}
            </p>
          </div>
          <div>
            <Eyebrow>Estado</Eyebrow>
            <p className="mt-1">
              <MatchStatusBadge status={match.status} />
            </p>
          </div>
          <div className="sm:col-span-2">
            <Eyebrow>Sede / Cancha</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{venue?.name ?? "Sin sede asignada"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registrar evento</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateMatchEventForm
            leagueSlug={league.slug}
            matchId={match.id}
            isMatchCancelled={match.status === "cancelled"}
            homeTeam={{ id: homeTeam.id, name: homeTeam.name }}
            awayTeam={{ id: awayTeam.id, name: awayTeam.name }}
            players={formPlayers}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cronología de eventos</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-gray-600">Este partido aún no tiene eventos registrados.</p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <MatchEventCard
                  key={event.id}
                  event={event}
                  teamName={event.team_id ? (teamsById.get(event.team_id)?.name ?? null) : null}
                  playerName={event.player_id ? (playerNameById.get(event.player_id) ?? null) : null}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
