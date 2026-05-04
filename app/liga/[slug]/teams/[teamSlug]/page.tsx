import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/status-badge";
import { PublicLeagueHeader } from "@/components/public/public-league-header";
import { PublicNav } from "@/components/public/public-nav";
import { PublicMatchCard } from "@/components/public/public-match-card";
import { createClient } from "@/lib/supabase/server";
import type {
  League,
  Match,
  Player,
  PlayerRegistrationStatus,
  PlayerTeamRegistration,
  Season,
  Team,
} from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug" | "description" | "status">;
type TeamDetail = Pick<
  Team,
  | "id"
  | "name"
  | "slug"
  | "status"
  | "logo_url"
  | "primary_color"
  | "secondary_color"
  | "founded_year"
  | "created_at"
>;
type SeasonItem = Pick<Season, "id" | "name" | "slug" | "status" | "start_date" | "end_date">;
type RegistrationItem = Pick<
  PlayerTeamRegistration,
  "id" | "player_id" | "season_id" | "jersey_number" | "status" | "registered_at" | "created_at"
>;
type PlayerItem = Pick<Player, "id" | "full_name" | "preferred_position" | "status" | "photo_url">;
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
interface PublicTeamDetailPageProps {
  params: Promise<{ slug: string; teamSlug: string }>;
  searchParams: Promise<{ seasonId?: string | string[] }>;
}

type BadgeStyle = {
  variant: StatusBadgeVariant;
  className?: string;
};

const registrationStatusStyles: Record<PlayerRegistrationStatus, BadgeStyle> = {
  active: { variant: "success" },
  inactive: { variant: "neutral", className: "bg-gray-200 text-gray-700" },
  released: { variant: "danger", className: "text-red-700" },
  transferred: { variant: "info", className: "text-blue-700" },
};

const playerStatusStyles: Record<Player["status"], BadgeStyle> = {
  active: { variant: "success" },
  inactive: { variant: "neutral", className: "bg-gray-200 text-gray-700" },
  injured: { variant: "danger" },
  suspended: { variant: "warning" },
  retired: { variant: "neutral", className: "bg-slate-200 text-slate-700" },
};

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export async function generateMetadata({ params }: PublicTeamDetailPageProps): Promise<Metadata> {
  const { slug, teamSlug } = await params;
  const supabase = await createClient();

  const { data: leagueData } = await supabase
    .from("leagues")
    .select("name")
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("status", "active")
    .maybeSingle();

  if (!leagueData) {
    return { title: "Equipo no encontrado | FutPro Manager" };
  }

  const { data: teamData } = await supabase
    .from("teams")
    .select("name")
    .eq("slug", teamSlug)
    .maybeSingle();

  if (!teamData) {
    return { title: "Equipo no encontrado | FutPro Manager" };
  }

  return {
    title: `${teamData.name} - ${leagueData.name} | FutPro Manager`,
  };
}

export default async function PublicTeamDetailPage({ params, searchParams }: PublicTeamDetailPageProps) {
  const { slug, teamSlug } = await params;
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

  const { data: teamData, error: teamError } = await supabase
    .from("teams")
    .select("id, name, slug, status, logo_url, primary_color, secondary_color, founded_year, created_at")
    .eq("league_id", league.id)
    .eq("slug", teamSlug)
    .maybeSingle();

  if (teamError) {
    throw teamError;
  }

  if (!teamData) {
    notFound();
  }

  const team = teamData as TeamDetail;

  const { data: seasonsData, error: seasonsError } = await supabase
    .from("seasons")
    .select("id, name, slug, status, start_date, end_date")
    .eq("league_id", league.id)
    .order("start_date", { ascending: false });

  if (seasonsError) {
    throw seasonsError;
  }

  const seasons = (seasonsData ?? []) as SeasonItem[];

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-100">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <PublicLeagueHeader league={league} />
        <PublicNav leagueSlug={league.slug} />

        <Card>
          <CardHeader>
            <CardTitle>{team.name}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Eyebrow>Estado</Eyebrow>
              <p className="mt-1 text-sm text-gray-900">{formatLabel(team.status)}</p>
            </div>
            <div>
              <Eyebrow>Liga</Eyebrow>
              <p className="mt-1 text-sm text-gray-900">{league.name}</p>
            </div>
            {team.founded_year ? (
              <div>
                <Eyebrow>Año de fundación</Eyebrow>
                <p className="mt-1 text-sm text-gray-900">{String(team.founded_year)}</p>
              </div>
            ) : null}
            {team.logo_url ? (
              <div className="sm:col-span-2">
                <Eyebrow>Logo</Eyebrow>
                <div className="mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={team.logo_url}
                    alt={`Logo de ${team.name}`}
                    className="h-24 w-24 rounded-lg border border-gray-200 object-contain"
                  />
                </div>
              </div>
            ) : null}
            {team.primary_color ? (
              <div>
                <Eyebrow>Color primario</Eyebrow>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-900">
                  <span
                    className="inline-flex h-4 w-4 rounded border border-gray-300"
                    style={{ backgroundColor: team.primary_color }}
                  />
                  {team.primary_color}
                </div>
              </div>
            ) : null}
            {team.secondary_color ? (
              <div>
                <Eyebrow>Color secundario</Eyebrow>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-900">
                  <span
                    className="inline-flex h-4 w-4 rounded border border-gray-300"
                    style={{ backgroundColor: team.secondary_color }}
                  />
                  {team.secondary_color}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {seasons.length === 0 ? (
          <EmptyState
            title="Sin temporadas registradas"
            description="Esta liga aún no tiene temporadas registradas. La plantilla y los partidos del equipo estarán disponibles cuando existan temporadas."
          />
        ) : (
          <PublicTeamSeasonContent
            league={league}
            team={team}
            seasons={seasons}
            seasonId={seasonId}
            supabase={supabase}
          />
        )}
      </section>
    </main>
  );
}

async function PublicTeamSeasonContent({
  league,
  team,
  seasons,
  seasonId,
  supabase,
}: {
  league: LeagueSummary;
  team: TeamDetail;
  seasons: SeasonItem[];
  seasonId: string | undefined;
  supabase: Awaited<ReturnType<typeof createClient>>;
}) {
  const fallbackSeason = seasons[0];

  if (seasonId) {
    const hasSeason = seasons.some((s) => s.id === seasonId);
    if (!hasSeason) {
      redirect(`/liga/${league.slug}/teams/${team.slug}?seasonId=${fallbackSeason.id}`);
    }
  }

  const selectedSeason = seasonId ? seasons.find((s) => s.id === seasonId)! : fallbackSeason;

  const [
    { data: registrationsData, error: registrationsError },
    { data: matchesData, error: matchesError },
    { data: teamsData, error: teamsError },
    { data: venuesData, error: venuesError },
  ] = await Promise.all([
    supabase
      .from("player_team_registrations")
      .select("id, player_id, season_id, jersey_number, status, registered_at, created_at")
      .eq("team_id", team.id)
      .eq("season_id", selectedSeason.id)
      .order("jersey_number", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("matches")
      .select(
        "id, season_id, home_team_id, away_team_id, venue_id, scheduled_at, status, home_score, away_score, round_name"
      )
      .eq("league_id", league.id)
      .eq("season_id", selectedSeason.id)
      .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
      .order("scheduled_at", { ascending: true }),
    supabase.from("teams").select("id, name").eq("league_id", league.id).order("name", { ascending: true }),
    supabase.from("venues").select("id, name").eq("league_id", league.id).order("name", { ascending: true }),
  ]);

  if (registrationsError) throw registrationsError;
  if (matchesError) throw matchesError;
  if (teamsError) throw teamsError;
  if (venuesError) throw venuesError;

  const registrations = (registrationsData ?? []) as RegistrationItem[];
  const playerIds = [...new Set(registrations.map((r) => r.player_id))];

  let players: PlayerItem[] = [];
  if (playerIds.length > 0) {
    const { data: playersData, error: playersError } = await supabase
      .from("players")
      .select("id, full_name, preferred_position, status, photo_url")
      .eq("league_id", league.id)
      .in("id", playerIds);

    if (playersError) throw playersError;
    players = (playersData ?? []) as PlayerItem[];
  }

  const playersById = new Map(players.map((p) => [p.id, p]));

  const rosterRegistrations = registrations.map((registration) => ({
    id: registration.id,
    jersey_number: registration.jersey_number,
    status: registration.status,
    registered_at: registration.registered_at,
    player: playersById.get(registration.player_id) ?? null,
  }));

  const matches = (matchesData ?? []) as MatchListItem[];
  const teamsMap = new Map((teamsData ?? []).map((t) => [t.id, t.name]));
  const venuesMap = new Map((venuesData ?? []).map((v) => [v.id, v.name]));

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Temporadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            Selecciona una temporada para ver la plantilla y los partidos del equipo.
          </p>
          <div className="flex flex-wrap gap-2">
            {seasons.map((seasonItem) => {
              const isActive = seasonItem.id === selectedSeason.id;
              return (
                <Link
                  key={seasonItem.id}
                  href={`/liga/${league.slug}/teams/${team.slug}?seasonId=${seasonItem.id}`}
                  className={`inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 ${
                    isActive
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-emerald-600 hover:text-emerald-700"
                  }`}
                >
                  {seasonItem.name}
                </Link>
              );
            })}
          </div>
          <p className="text-sm text-gray-600">
            Mostrando información para{" "}
            <span className="font-medium text-gray-900">{selectedSeason.name}</span>.
          </p>
        </CardContent>
      </Card>

      {rosterRegistrations.length === 0 ? (
        <EmptyState
          title="Sin jugadores registrados"
          description="Este equipo aún no tiene jugadores registrados en la temporada seleccionada."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{rosterRegistrations.length} jugadores registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:hidden">
              {rosterRegistrations.map((registration) => (
                <Card key={registration.id}>
                  <CardContent className="space-y-2 p-4 text-sm text-gray-700">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-gray-900">
                        {registration.player?.full_name ?? "Jugador no disponible"}
                      </p>
                      <StatusBadge
                        variant={registrationStatusStyles[registration.status].variant}
                        className={`px-2.5 py-1 ${registrationStatusStyles[registration.status].className ?? ""}`}
                      >
                        {formatLabel(registration.status)}
                      </StatusBadge>
                    </div>
                    <p>Número: {registration.jersey_number ?? "Sin número"}</p>
                    <p>Posición: {registration.player?.preferred_position || "No definida"}</p>
                    <p>
                      Estado del jugador:{" "}
                      {registration.player ? (
                        <StatusBadge
                          variant={playerStatusStyles[registration.player.status].variant}
                          className={`px-2.5 py-1 ${playerStatusStyles[registration.player.status].className ?? ""}`}
                        >
                          {formatLabel(registration.player.status)}
                        </StatusBadge>
                      ) : (
                        "No disponible"
                      )}
                    </p>
                    <p>Fecha de registro: {formatDateTime(registration.registered_at)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-lg border border-gray-200 md:block">
              <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-gray-500">
                    <th className="px-4 py-3">
                      <Eyebrow as="span">Jugador</Eyebrow>
                    </th>
                    <th className="px-4 py-3">
                      <Eyebrow as="span">Número</Eyebrow>
                    </th>
                    <th className="px-4 py-3">
                      <Eyebrow as="span">Estado registro</Eyebrow>
                    </th>
                    <th className="px-4 py-3">
                      <Eyebrow as="span">Fecha registro</Eyebrow>
                    </th>
                    <th className="px-4 py-3">
                      <Eyebrow as="span">Posición</Eyebrow>
                    </th>
                    <th className="px-4 py-3">
                      <Eyebrow as="span">Estado jugador</Eyebrow>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {rosterRegistrations.map((registration) => (
                    <tr key={registration.id}>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {registration.player?.full_name ?? "No disponible"}
                      </td>
                      <td className="px-4 py-3">
                        {registration.jersey_number ?? "Sin número"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          variant={registrationStatusStyles[registration.status].variant}
                          className={`px-2.5 py-1 ${registrationStatusStyles[registration.status].className ?? ""}`}
                        >
                          {formatLabel(registration.status)}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3">
                        {formatDateTime(registration.registered_at)}
                      </td>
                      <td className="px-4 py-3">
                        {registration.player?.preferred_position || "No definida"}
                      </td>
                      <td className="px-4 py-3">
                        {registration.player ? (
                          <StatusBadge
                            variant={playerStatusStyles[registration.player.status].variant}
                            className={`px-2.5 py-1 ${playerStatusStyles[registration.player.status].className ?? ""}`}
                          >
                            {formatLabel(registration.player.status)}
                          </StatusBadge>
                        ) : (
                          "No disponible"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Partidos del equipo</h2>
        {matches.length === 0 ? (
          <EmptyState
            title="Sin partidos programados"
            description="Este equipo aún no tiene partidos en la temporada seleccionada."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {matches.map((match) => (
              <PublicMatchCard
                key={match.id}
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
    </>
  );
}
