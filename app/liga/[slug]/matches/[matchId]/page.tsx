import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TextLink } from "@/components/ui/text-link";
import { PublicLeagueHeader } from "@/components/public/public-league-header";
import { PublicNav } from "@/components/public/public-nav";
import { PublicBreadcrumbs } from "@/components/public/public-breadcrumbs";
import { MatchStatusBadge } from "@/components/matches/match-status-badge";
import { PublicMatchEvents } from "@/components/public/public-match-events";
import { PublicLiveMatchHeader } from "@/components/public/public-live-match-header";
import { MatchShareCard } from "@/components/social/match-share-card";
import { createPublicClient } from "@/lib/supabase/public";
import { getPublicLeagueBySlug } from "@/lib/leagues/get-public-league";
import type { Match, Season, Team, Venue, MatchEvent, Player } from "@/types/database";

export const revalidate = 60;

export async function generateStaticParams() {
  const supabase = createPublicClient();
  const { data: leagues } = await supabase
    .from("leagues")
    .select("id, slug")
    .eq("is_public", true)
    .eq("status", "active");

  if (!leagues || leagues.length === 0) return [];

  const leagueIds = leagues.map((l) => l.id);
  const leagueMap = new Map(leagues.map((l) => [l.id, l.slug]));

  const { data: matches } = await supabase
    .from("matches")
    .select("id, league_id")
    .in("league_id", leagueIds)
    .order("scheduled_at", { ascending: false })
    .limit(50);

  return (matches ?? []).map((m) => ({
    slug: leagueMap.get(m.league_id) ?? "",
    matchId: m.id,
  }));
}

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
  const leagueData = await getPublicLeagueBySlug(slug);

  if (!leagueData) {
    return { title: "Partido no encontrado | FutPro Manager" };
  }

  const supabase = createPublicClient();

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

  const title = `${homeTeamName} vs ${awayTeamName} - ${leagueData.name} | FutPro Manager`;
  const description = `Detalle público del partido ${homeTeamName} vs ${awayTeamName} en ${leagueData.name}.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      locale: "es_MX",
      siteName: "FutPro Manager",
      images: [{ url: "/og/futpro-manager.jpg", width: 640, height: 640 }],
    },
    twitter: { card: "summary", title, description,
      images: ["/og/futpro-manager.jpg"],
    },
  };
}

export default async function PublicMatchDetailPage({ params }: PublicMatchDetailPageProps) {
  const { slug, matchId } = await params;
  const league = await getPublicLeagueBySlug(slug);

  if (!league) {
    notFound();
  }

  const supabase = createPublicClient();

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

  const homeTeamData = {
    id: homeTeam?.id ?? match.home_team_id,
    name: homeTeam?.name ?? "Equipo local",
    slug: homeTeam?.slug ?? "",
    logo_url: homeTeam?.logo_url ?? null,
  };

  const awayTeamData = {
    id: awayTeam?.id ?? match.away_team_id,
    name: awayTeam?.name ?? "Equipo visitante",
    slug: awayTeam?.slug ?? "",
    logo_url: awayTeam?.logo_url ?? null,
  };

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
    <main className="w-full">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <PublicLeagueHeader league={league} />
        <PublicNav leagueSlug={league.slug} />
        <PublicBreadcrumbs
          items={[
            { label: league.name, href: `/liga/${league.slug}` },
            { label: "Partidos", href: `/liga/${league.slug}/matches` },
            { label: `${homeTeamData.name} vs ${awayTeamData.name}` },
          ]}
        />

        <PublicLiveMatchHeader
          initialMatch={match}
          homeTeam={homeTeamData}
          awayTeam={awayTeamData}
        />

        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl shadow-xl text-white">
          <div className="space-y-2 border-b border-white/10 pb-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-xl font-bold text-white">
                {homeTeamData.name} vs {awayTeamData.name}
              </h2>
              <MatchStatusBadge status={match.status} />
            </div>
            <p className="text-xs text-gray-400">
              {match.round_name ? `${match.round_name} · ` : null}
              {season ? season.name : "Temporada no definida"}
            </p>
          </div>

          <div className="space-y-6 pt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Eyebrow className="text-emerald-400">Equipo local</Eyebrow>
                {homeTeam?.slug ? (
                  <TextLink
                    href={`/liga/${league.slug}/teams/${homeTeam.slug}`}
                    className="text-white hover:text-emerald-400 font-medium"
                  >
                    {homeTeam.name}
                  </TextLink>
                ) : (
                  <p className="mt-1 text-sm text-gray-200">
                    {homeTeam?.name ?? "No disponible"}
                  </p>
                )}
              </div>
              <div>
                <Eyebrow className="text-emerald-400">Equipo visitante</Eyebrow>
                {awayTeam?.slug ? (
                  <TextLink
                    href={`/liga/${league.slug}/teams/${awayTeam.slug}`}
                    className="text-white hover:text-emerald-400 font-medium"
                  >
                    {awayTeam.name}
                  </TextLink>
                ) : (
                  <p className="mt-1 text-sm text-gray-200">
                    {awayTeam?.name ?? "No disponible"}
                  </p>
                )}
              </div>
              <div>
                <Eyebrow className="text-emerald-400">Marcador</Eyebrow>
                <p className="mt-1 text-sm font-semibold text-white">
                  {match.status === "completed"
                    ? `${match.home_score} - ${match.away_score}`
                    : "Marcador pendiente"}
                </p>
              </div>
              <div>
                <Eyebrow className="text-emerald-400">Estado</Eyebrow>
                <p className="mt-1 text-sm text-gray-200">{formatStatusLabel(match.status)}</p>
              </div>
              <div>
                <Eyebrow className="text-emerald-400">Fecha y hora</Eyebrow>
                <p className="mt-1 text-sm text-gray-200">{formatDateTime(match.scheduled_at)}</p>
              </div>
              <div>
                <Eyebrow className="text-emerald-400">Sede</Eyebrow>
                <p className="mt-1 text-sm text-gray-200">
                  {venue
                    ? [venue.name, venue.address, venue.city, venue.state]
                        .filter(Boolean)
                        .join(" · ")
                    : "Sin sede asignada"}
                </p>
              </div>
              {match.round_name ? (
                <div>
                  <Eyebrow className="text-emerald-400">Jornada</Eyebrow>
                  <p className="mt-1 text-sm text-gray-200">{match.round_name}</p>
                </div>
              ) : null}
              {season ? (
                <div>
                  <Eyebrow className="text-emerald-400">Temporada</Eyebrow>
                  <p className="mt-1 text-sm text-gray-200">{season.name}</p>
                </div>
              ) : null}
            </div>

            {/* Difusión y Redes */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-white/5 p-4 border border-white/10">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Difusión y Redes
                </span>
                <p className="text-xs text-gray-400">
                  Comparte el marcador por WhatsApp o descarga la imagen oficial para redes sociales.
                </p>
              </div>
              <MatchShareCard
                leagueName={league.name}
                seasonName={season?.name}
                roundName={match.round_name}
                homeTeamName={homeTeamData.name}
                awayTeamName={awayTeamData.name}
                homeScore={match.home_score}
                awayScore={match.away_score}
                matchStatus={match.status}
                matchDate={formatDateTime(match.scheduled_at)}
                theme="dark"
              />
            </div>

            <div className="flex flex-wrap gap-4 border-t border-white/10 pt-4">
              <TextLink
                href={`/liga/${league.slug}/matches`}
                className="text-emerald-400 hover:text-emerald-300 font-medium"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden /> Ver todos los partidos
              </TextLink>
              <TextLink
                href={`/liga/${league.slug}/standings`}
                className="text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Tabla de posiciones
              </TextLink>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl shadow-xl text-white">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-base font-bold text-white">Eventos del partido</h2>
          </div>
          <div className="pt-4">
            <PublicMatchEvents
              events={events}
              teams={teams}
              players={eventPlayers}
              homeTeamId={match.home_team_id}
              awayTeamId={match.away_team_id}
              leagueSlug={league.slug}
              matchId={match.id}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
