import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/status-badge";
import { PublicLeagueHeader } from "@/components/public/public-league-header";
import { PublicNav } from "@/components/public/public-nav";
import { PublicBreadcrumbs } from "@/components/public/public-breadcrumbs";
import { PublicMatchCard } from "@/components/public/public-match-card";
import { createPublicClient } from "@/lib/supabase/public";
import { getPublicLeagueBySlug } from "@/lib/leagues/get-public-league";
import type {
  League,
  Match,
  Player,
  PlayerRegistrationStatus,
  PlayerTeamRegistration,
  Season,
  Team,
} from "@/types/database";

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

  const { data: teams } = await supabase
    .from("teams")
    .select("slug, league_id")
    .in("league_id", leagueIds);

  return (teams ?? []).map((t) => ({
    slug: leagueMap.get(t.league_id) ?? "",
    teamSlug: t.slug,
  }));
}

type LeagueSummary = Pick<League, "id" | "name" | "slug" | "description" | "status" | "logo_url">;
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
  const leagueData = await getPublicLeagueBySlug(slug);

  if (!leagueData) {
    return { title: "Equipo no encontrado | FutPro Manager" };
  }

  const supabase = createPublicClient();
  const { data: teamData } = await supabase
    .from("teams")
    .select("name")
    .eq("league_id", leagueData.id)
    .eq("slug", teamSlug)
    .maybeSingle();

  if (!teamData) {
    return { title: "Equipo no encontrado | FutPro Manager" };
  }

  const title = `${teamData.name} - ${leagueData.name} | FutPro Manager`;
  const description = `Ficha pública del equipo ${teamData.name} en ${leagueData.name}.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "es_MX",
      siteName: "FutPro Manager",
      images: [{ url: "/og/futpro-manager.jpg", width: 640, height: 640 }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["/og/futpro-manager.jpg"],
    },
  };
}

export default async function PublicTeamDetailPage({ params, searchParams }: PublicTeamDetailPageProps) {
  const { slug, teamSlug } = await params;
  const { seasonId: rawSeasonId } = await searchParams;
  const seasonId = Array.isArray(rawSeasonId) ? rawSeasonId[0] : rawSeasonId;

  const league = await getPublicLeagueBySlug(slug);

  if (!league) {
    notFound();
  }

  const supabase = createPublicClient();

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
    <main className="w-full">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <PublicLeagueHeader league={league} />
        <PublicNav leagueSlug={league.slug} />
        <PublicBreadcrumbs
          items={[
            { label: league.name, href: `/liga/${league.slug}` },
            { label: "Equipos", href: `/liga/${league.slug}/teams` },
            { label: team.name },
          ]}
        />

        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl shadow-xl text-white">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-xl font-bold text-white">{team.name}</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 pt-4">
            <div>
              <Eyebrow className="text-emerald-400">Estado</Eyebrow>
              <p className="mt-1 text-sm text-gray-200">{formatLabel(team.status)}</p>
            </div>
            <div>
              <Eyebrow className="text-emerald-400">Liga</Eyebrow>
              <p className="mt-1 text-sm text-gray-200">{league.name}</p>
            </div>
            {team.founded_year ? (
              <div>
                <Eyebrow className="text-emerald-400">Año de fundación</Eyebrow>
                <p className="mt-1 text-sm text-gray-200">{String(team.founded_year)}</p>
              </div>
            ) : null}
            {team.logo_url ? (
              <div className="sm:col-span-2">
                <Eyebrow className="text-emerald-400">Logo</Eyebrow>
                <div className="mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={team.logo_url}
                    alt={`Logo de ${team.name}`}
                    className="h-24 w-24 rounded-xl border border-white/10 bg-white/5 object-contain p-2"
                  />
                </div>
              </div>
            ) : null}
            {team.primary_color ? (
              <div>
                <Eyebrow className="text-emerald-400">Color primario</Eyebrow>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-200">
                  <span
                    className="inline-flex h-4 w-4 rounded border border-white/20"
                    style={{ backgroundColor: team.primary_color }}
                  />
                  {team.primary_color}
                </div>
              </div>
            ) : null}
            {team.secondary_color ? (
              <div>
                <Eyebrow className="text-emerald-400">Color secundario</Eyebrow>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-200">
                  <span
                    className="inline-flex h-4 w-4 rounded border border-white/20"
                    style={{ backgroundColor: team.secondary_color }}
                  />
                  {team.secondary_color}
                </div>
              </div>
            ) : null}
          </div>
        </div>

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
  supabase: ReturnType<typeof createPublicClient>;
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
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl shadow-xl text-white">
        <div className="border-b border-white/10 pb-3">
          <h2 className="text-base font-bold text-white">Temporadas</h2>
        </div>
        <div className="space-y-3 pt-4">
          <p className="text-xs text-gray-400">
            Selecciona una temporada para ver la plantilla y los partidos del equipo.
          </p>
          <div className="flex flex-wrap gap-2">
            {seasons.map((seasonItem) => {
              const isActive = seasonItem.id === selectedSeason.id;
              return (
                <Link
                  key={seasonItem.id}
                  href={`/liga/${league.slug}/teams/${team.slug}?seasonId=${seasonItem.id}`}
                  className={`inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                    isActive
                      ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300 font-semibold shadow-sm"
                      : "border-white/10 bg-white/5 text-gray-300 hover:border-emerald-500/30 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {seasonItem.name}
                </Link>
              );
            })}
          </div>
          <p className="text-xs text-gray-400">
            Mostrando información para{" "}
            <span className="font-semibold text-white">{selectedSeason.name}</span>.
          </p>
        </div>
      </div>

      {rosterRegistrations.length === 0 ? (
        <EmptyState
          title="Sin jugadores registrados"
          description="Este equipo aún no tiene jugadores registrados en la temporada seleccionada."
        />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl shadow-xl text-white">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-base font-bold text-white">{rosterRegistrations.length} jugadores registrados</h2>
          </div>
          <div className="pt-4">
            <div className="space-y-3 md:hidden">
              {rosterRegistrations.map((registration) => (
                <div key={registration.id} className="rounded-xl border border-white/10 bg-white/5 p-4 text-white shadow-sm">
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-white">
                        {registration.player ? (
                          <Link href={`/liga/${league.slug}/players/${registration.player.id}`} className="text-emerald-400 hover:text-emerald-300 hover:underline font-medium">
                            {registration.player.full_name}
                          </Link>
                        ) : "Jugador no disponible"}
                      </p>
                      <StatusBadge
                        variant={registrationStatusStyles[registration.status].variant}
                        className={`px-2.5 py-1 ${registrationStatusStyles[registration.status].className ?? ""}`}
                      >
                        {formatLabel(registration.status)}
                      </StatusBadge>
                    </div>
                    <p className="text-xs text-gray-400">Número: <span className="text-white font-medium">{registration.jersey_number ?? "Sin número"}</span></p>
                    <p className="text-xs text-gray-400">Posición: <span className="text-white font-medium">{registration.player?.preferred_position || "No definida"}</span></p>
                    <p className="text-xs text-gray-400">
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
                    <p className="text-xs text-gray-400">Fecha de registro: <span className="text-gray-300">{formatDateTime(registration.registered_at)}</span></p>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-xl border border-white/10 bg-slate-900/40 md:block">
              <table className="min-w-full divide-y divide-white/10 bg-transparent text-sm text-gray-200">
                <thead className="bg-white/5 text-gray-400">
                  <tr className="text-left">
                    <th className="px-4 py-3">
                      <Eyebrow as="span" className="text-gray-400">Jugador</Eyebrow>
                    </th>
                    <th className="px-4 py-3">
                      <Eyebrow as="span" className="text-gray-400">Número</Eyebrow>
                    </th>
                    <th className="px-4 py-3">
                      <Eyebrow as="span" className="text-gray-400">Estado registro</Eyebrow>
                    </th>
                    <th className="px-4 py-3">
                      <Eyebrow as="span" className="text-gray-400">Fecha registro</Eyebrow>
                    </th>
                    <th className="px-4 py-3">
                      <Eyebrow as="span" className="text-gray-400">Posición</Eyebrow>
                    </th>
                    <th className="px-4 py-3">
                      <Eyebrow as="span" className="text-gray-400">Estado jugador</Eyebrow>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {rosterRegistrations.map((registration) => (
                    <tr key={registration.id} className="transition hover:bg-white/5">
                      <td className="px-4 py-3 font-medium text-white">
                        {registration.player ? (
                          <Link href={`/liga/${league.slug}/players/${registration.player.id}`} className="text-emerald-400 hover:text-emerald-300 hover:underline font-medium">
                            {registration.player.full_name}
                          </Link>
                        ) : "No disponible"}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
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
                      <td className="px-4 py-3 text-gray-400">
                        {formatDateTime(registration.registered_at)}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
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
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-bold text-white">Partidos del equipo</h2>
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
                detailHref={`/liga/${league.slug}/matches/${match.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
