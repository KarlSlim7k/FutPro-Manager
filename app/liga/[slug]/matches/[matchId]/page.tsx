import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TextLink } from "@/components/ui/text-link";
import { PublicLeagueHeader } from "@/components/public/public-league-header";
import { PublicNav } from "@/components/public/public-nav";
import { MatchStatusBadge } from "@/components/matches/match-status-badge";
import { PublicMatchEvents } from "@/components/public/public-match-events";
import { createClient } from "@/lib/supabase/server";
import type { League, Match, Season, Team, Venue, MatchEvent, Player } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug" | "description" | "status">;
type MatchDetail = Pick<
  Match,
  | "id"
  | "league_id"
  | "season_id"
  | "home_team_id"
  | "away_team_id"
  | "venue_id"
  | "scheduled_at"
  | "status"
  | "home_score"
  | "away_score"
  | "round_name"
  | "created_at"
  | "updated_at"
>;
type SeasonDetail = Pick<Season, "id" | "name" | "slug" | "status" | "start_date" | "end_date">;
type TeamDetail = Pick<Team, "id" | "name" | "slug" | "status" | "logo_url">;
type VenueDetail = Pick<Venue, "id" | "name" | "address" | "city" | "state">;
type MatchEventItem = Pick<
  MatchEvent,
  "id" | "team_id" | "player_id" | "event_type" | "minute" | "notes" | "created_at"
>;
type PlayerItem = Pick<Player, "id" | "full_name">;

interface PublicMatchDetailPageProps {
  params: Promise<{ slug: string; matchId: string }>;
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatStatusLabel(status: MatchDetail["status"]) {
  const labels: Record<MatchDetail["status"], string> = {
    scheduled: "Programado",
    in_progress: "En juego",
    completed: "Finalizado",
    postponed: "Pospuesto",
    cancelled: "Cancelado",
  };
  return labels[status];
}

export async function generateMetadata({ params }: PublicMatchDetailPageProps): Promise<Metadata> {
  const { slug, matchId } = await params;
  const supabase = await createClient();

  const { data: leagueData } = await supabase
    .from("leagues")
    .select("id, name")
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("status", "active")
    .maybeSingle();

  if (!leagueData) {
    return { title: "Partido no encontrado | FutPro Manager" };
  }

  const { data: matchData } = await supabase
    .from("matches")
    .select("home_team_id, away_team_id")
    .eq("league_id", leagueData.id)
    .eq("id", matchId)
    .maybeSingle();

  if (!matchData) {
    return { title: "Partido no encontrado | FutPro Manager" };
  }

  const { data: teamsData } = await supabase
    .from("teams")
    .select("id, name")
    .eq("league_id", leagueData.id)
    .in("id", [matchData.home_team_id, matchData.away_team_id]);

  const teamsMap = new Map((teamsData ?? []).map((t) => [t.id, t.name]));
  const homeTeamName = teamsMap.get(matchData.home_team_id) ?? "Equipo local";
  const awayTeamName = teamsMap.get(matchData.away_team_id) ?? "Equipo visitante";

  return {
    title: `${homeTeamName} vs ${awayTeamName} - ${leagueData.name} | FutPro Manager`,
  };
}

export default async function PublicMatchDetailPage({ params }: PublicMatchDetailPageProps) {
  const { slug, matchId } = await params;
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

  const { data: matchData, error: matchError } = await supabase
    .from("matches")
    .select(
      "id, league_id, season_id, home_team_id, away_team_id, venue_id, scheduled_at, status, home_score, away_score, round_name, created_at, updated_at"
    )
    .eq("league_id", league.id)
    .eq("id", matchId)
    .maybeSingle();

  if (matchError) {
    throw matchError;
  }

  if (!matchData) {
    notFound();
  }

  const match = matchData as MatchDetail;

  const [
    { data: seasonData, error: seasonError },
    { data: teamsData, error: teamsError },
  ] = await Promise.all([
    supabase
      .from("seasons")
      .select("id, name, slug, status, start_date, end_date")
      .eq("id", match.season_id)
      .eq("league_id", league.id)
      .maybeSingle(),
    supabase
      .from("teams")
      .select("id, name, slug, status, logo_url")
      .eq("league_id", league.id)
      .in("id", [match.home_team_id, match.away_team_id]),
  ]);

  if (seasonError) throw seasonError;
  if (teamsError) throw teamsError;

  const season = seasonData as SeasonDetail | null;
  const teams = (teamsData ?? []) as TeamDetail[];
  const teamsMap = new Map(teams.map((t) => [t.id, t]));

  const homeTeam = teamsMap.get(match.home_team_id);
  const awayTeam = teamsMap.get(match.away_team_id);

  let venue: VenueDetail | null = null;
  if (match.venue_id) {
    const { data: venueData, error: venueError } = await supabase
      .from("venues")
      .select("id, name, address, city, state")
      .eq("id", match.venue_id)
      .eq("league_id", league.id)
      .maybeSingle();

    if (venueError) throw venueError;
    venue = venueData as VenueDetail | null;
  }

  let events: MatchEventItem[] = [];
  let eventPlayers: PlayerItem[] = [];

  const { data: eventsData, error: eventsError } = await supabase
    .from("match_events")
    .select("id, team_id, player_id, event_type, minute, notes, created_at")
    .eq("match_id", match.id)
    .order("minute", { ascending: true })
    .order("created_at", { ascending: true });

  if (!eventsError && eventsData) {
    events = eventsData as MatchEventItem[];

    const playerIds = [...new Set(events.filter((e) => e.player_id).map((e) => e.player_id!))];
    if (playerIds.length > 0) {
      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select("id, full_name")
        .eq("league_id", league.id)
        .in("id", playerIds);

      if (!playersError && playersData) {
        eventPlayers = playersData as PlayerItem[];
      }
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-100">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <PublicLeagueHeader league={league} />
        <PublicNav leagueSlug={league.slug} />

        <Card>
          <CardHeader className="space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <CardTitle className="text-xl">
                {homeTeam?.name ?? "Equipo local"} vs {awayTeam?.name ?? "Equipo visitante"}
              </CardTitle>
              <MatchStatusBadge status={match.status} />
            </div>
            <p className="text-sm text-gray-600">
              {match.round_name ? `${match.round_name} · ` : null}
              {season ? season.name : "Temporada no definida"}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Eyebrow>Equipo local</Eyebrow>
                {homeTeam?.slug ? (
                  <TextLink href={`/liga/${league.slug}/teams/${homeTeam.slug}`}>
                    {homeTeam.name}
                  </TextLink>
                ) : (
                  <p className="mt-1 text-sm text-gray-900">
                    {homeTeam?.name ?? "No disponible"}
                  </p>
                )}
              </div>
              <div>
                <Eyebrow>Equipo visitante</Eyebrow>
                {awayTeam?.slug ? (
                  <TextLink href={`/liga/${league.slug}/teams/${awayTeam.slug}`}>
                    {awayTeam.name}
                  </TextLink>
                ) : (
                  <p className="mt-1 text-sm text-gray-900">
                    {awayTeam?.name ?? "No disponible"}
                  </p>
                )}
              </div>
              <div>
                <Eyebrow>Marcador</Eyebrow>
                <p className="mt-1 text-sm text-gray-900">
                  {match.status === "completed"
                    ? `${match.home_score} - ${match.away_score}`
                    : "Marcador pendiente"}
                </p>
              </div>
              <div>
                <Eyebrow>Estado</Eyebrow>
                <p className="mt-1 text-sm text-gray-900">{formatStatusLabel(match.status)}</p>
              </div>
              <div>
                <Eyebrow>Fecha y hora</Eyebrow>
                <p className="mt-1 text-sm text-gray-900">{formatDateTime(match.scheduled_at)}</p>
              </div>
              <div>
                <Eyebrow>Sede</Eyebrow>
                <p className="mt-1 text-sm text-gray-900">
                  {venue
                    ? [venue.name, venue.address, venue.city, venue.state]
                        .filter(Boolean)
                        .join(" · ")
                    : "Sin sede asignada"}
                </p>
              </div>
              {match.round_name ? (
                <div>
                  <Eyebrow>Jornada</Eyebrow>
                  <p className="mt-1 text-sm text-gray-900">{match.round_name}</p>
                </div>
              ) : null}
              {season ? (
                <div>
                  <Eyebrow>Temporada</Eyebrow>
                  <p className="mt-1 text-sm text-gray-900">{season.name}</p>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-4 border-t border-gray-100 pt-4">
              <TextLink href={`/liga/${league.slug}/matches`}>← Ver todos los partidos</TextLink>
              <TextLink href={`/liga/${league.slug}/standings`}>Tabla de posiciones</TextLink>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eventos del partido</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <EmptyState
                title="Sin eventos registrados"
                description="Sin eventos registrados para este partido."
              />
            ) : (
              <PublicMatchEvents events={events} teams={teams} players={eventPlayers} />
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
