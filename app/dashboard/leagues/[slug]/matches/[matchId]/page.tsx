import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MatchStatusBadge } from "@/components/matches/match-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { League, Match, Season, Team, Venue } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;
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
>;
type SeasonSummary = Pick<Season, "id" | "name">;
type TeamSummary = Pick<Team, "id" | "name">;
type VenueSummary = Pick<
  Venue,
  "id" | "name" | "address" | "city" | "state" | "latitude" | "longitude"
>;

interface MatchDetailPageProps {
  params: Promise<{ slug: string; matchId: string }>;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

function getVenueLocation(venue: VenueSummary | null) {
  if (!venue) {
    return "Sin sede asignada";
  }

  return [venue.address, venue.city, venue.state].filter(Boolean).join(", ") || "Ubicación no definida";
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
    .select("id, league_id, season_id, home_team_id, away_team_id, venue_id, scheduled_at, status, home_score, away_score, round_name, created_at")
    .eq("id", matchId)
    .eq("league_id", league.id)
    .maybeSingle();

  if (matchError) {
    throw matchError;
  }

  if (!matchData) {
    notFound();
  }

  const match = matchData as MatchDetail;

  const [seasonResult, homeTeamResult, awayTeamResult, venueResult] = await Promise.all([
    supabase
      .from("seasons")
      .select("id, name")
      .eq("id", match.season_id)
      .eq("league_id", league.id)
      .maybeSingle(),
    supabase
      .from("teams")
      .select("id, name")
      .eq("id", match.home_team_id)
      .eq("league_id", league.id)
      .maybeSingle(),
    supabase
      .from("teams")
      .select("id, name")
      .eq("id", match.away_team_id)
      .eq("league_id", league.id)
      .maybeSingle(),
    match.venue_id
      ? supabase
          .from("venues")
          .select("id, name, address, city, state, latitude, longitude")
          .eq("id", match.venue_id)
          .eq("league_id", league.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (seasonResult.error) throw seasonResult.error;
  if (homeTeamResult.error) throw homeTeamResult.error;
  if (awayTeamResult.error) throw awayTeamResult.error;
  if (venueResult.error) throw venueResult.error;

  const season = seasonResult.data as SeasonSummary | null;
  const homeTeam = homeTeamResult.data as TeamSummary | null;
  const awayTeam = awayTeamResult.data as TeamSummary | null;
  const venue = venueResult.data as VenueSummary | null;

  const hasVenueCoordinates =
    venue !== null && venue.latitude !== null && venue.longitude !== null;
  const googleMapsUrl = hasVenueCoordinates
    ? `https://www.google.com/maps?q=${venue.latitude},${venue.longitude}`
    : null;

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/dashboard/leagues/${league.slug}/matches`}
            className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
          >
            Volver a partidos
          </Link>
          <Link
            href={`/dashboard/leagues/${league.slug}/matches/${match.id}/edit`}
            className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
          >
            Editar partido
          </Link>
          {match.status === "cancelled" ? (
            <span className="inline-flex items-center text-sm font-medium text-gray-500">
              Resultado no disponible para partidos cancelados.
            </span>
          ) : (
            <Link
              href={`/dashboard/leagues/${league.slug}/matches/${match.id}/result`}
              className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
            >
              Capturar resultado
            </Link>
          )}
          {match.status === "cancelled" ? (
            <span className="inline-flex items-center text-sm font-medium text-gray-500">
              Eventos no disponibles para partidos cancelados.
            </span>
          ) : (
            <Link
              href={`/dashboard/leagues/${league.slug}/matches/${match.id}/events`}
              className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
            >
              Eventos
            </Link>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Detalle de partido</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            {homeTeam?.name ?? "Equipo local"} vs {awayTeam?.name ?? "Equipo visitante"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del encuentro</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Liga</p>
            <p className="mt-1 text-sm text-gray-900">{league.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Temporada</p>
            <p className="mt-1 text-sm text-gray-900">{season?.name ?? "No disponible"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Jornada / Ronda</p>
            <p className="mt-1 text-sm text-gray-900">{match.round_name || "No definida"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</p>
            <p className="mt-1">
              <MatchStatusBadge status={match.status} />
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Equipo local</p>
            <p className="mt-1 text-sm text-gray-900">{homeTeam?.name ?? "No disponible"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Equipo visitante</p>
            <p className="mt-1 text-sm text-gray-900">{awayTeam?.name ?? "No disponible"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Marcador actual</p>
            <p className="mt-1 text-sm text-gray-900">
              {match.home_score} - {match.away_score}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Fecha y hora programada</p>
            <p className="mt-1 text-sm text-gray-900">{formatDateTime(match.scheduled_at)}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Sede / Cancha</p>
            <p className="mt-1 text-sm text-gray-900">{venue?.name ?? "Sin sede asignada"}</p>
            <p className="mt-1 text-sm text-gray-600">{getVenueLocation(venue)}</p>
            {googleMapsUrl ? (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
              >
                Ver en Google Maps
              </a>
            ) : null}
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Fecha de creación</p>
            <p className="mt-1 text-sm text-gray-900">{formatDateTime(match.created_at)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximas fases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>Captura de resultado: disponible.</p>
          <p>Eventos del partido: disponible.</p>
          <p>Alineaciones: módulo pendiente.</p>
          <p>Estadísticas: módulo pendiente.</p>
        </CardContent>
      </Card>
    </section>
  );
}
