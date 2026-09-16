import { notFound } from "next/navigation";
import { Metadata } from "next";
import { MatchSeasonSelector } from "@/components/matches/match-season-selector";
import { PublicMatchCard } from "@/components/public/public-match-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PublicLeagueHeader } from "@/components/public/public-league-header";
import { PublicNav } from "@/components/public/public-nav";
import { createPublicClient } from "@/lib/supabase/public";
import { getPublicLeagueBySlug } from "@/lib/leagues/get-public-league";
import type { Match, Season, Team, Venue } from "@/types/database";

export const revalidate = 60;

type SeasonOption = Pick<Season, "id" | "name" | "start_date">;
type TeamOption = Pick<Team, "id" | "name" | "logo_url">;
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

interface LeagueMatchesPublicPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ seasonId?: string | string[]; status?: string | string[]; teamId?: string | string[]; round?: string | string[] }>;
}

export async function generateMetadata({ params }: LeagueMatchesPublicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicLeagueBySlug(slug);

  if (!data) {
    return { title: "Liga no encontrada | FutPro Manager" };
  }

  const title = `Partidos - ${data.name} | FutPro Manager`;
  const description = `Calendario y resultados públicos de ${data.name}.`;
  return { title, description, openGraph: {
      title,
      description,
      type: "website",
      locale: "es_MX",
      siteName: "FutPro Manager",
      images: [{ url: "/og/futpro-manager.jpg", width: 640, height: 640 }],
    }, twitter: { card: "summary", title, description,
      images: ["/og/futpro-manager.jpg"],
    } };
}

export default async function LeagueMatchesPublicPage({ params, searchParams }: LeagueMatchesPublicPageProps) {
  const { slug } = await params;
  const { seasonId: rawSeasonId, status: rawStatus, teamId: rawTeamId, round: rawRound } = await searchParams;
  const seasonId = Array.isArray(rawSeasonId) ? rawSeasonId[0] : rawSeasonId;
  const statusFilter = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus;
  const teamIdFilter = Array.isArray(rawTeamId) ? rawTeamId[0] : rawTeamId;
  const roundFilter = Array.isArray(rawRound) ? rawRound[0] : rawRound;

  const league = await getPublicLeagueBySlug(slug);

  if (!league) {
    notFound();
  }

  const supabase = createPublicClient();

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
      .select("id, name, logo_url")
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
      <main className="w-full">
        <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <PublicLeagueHeader league={league} />
          <PublicNav leagueSlug={league.slug} />
          <EmptyState
            title="Sin temporadas registradas"
            description="Esta liga aún no tiene temporadas registradas. Los partidos estarán disponibles cuando existan temporadas."
          />
        </section>
      </main>
    );
  }

  const validTeamId = teamIdFilter && teams.some((t) => t.id === teamIdFilter) ? teamIdFilter : null;
  const validRound = roundFilter ? roundFilter.trim() : "";

  let matchesQuery = supabase
    .from("matches")
    .select("id, season_id, home_team_id, away_team_id, venue_id, scheduled_at, status, home_score, away_score, round_name")
    .eq("league_id", league.id)
    .eq("season_id", selectedSeason.id);

  if (statusFilter && ["scheduled", "in_progress", "completed", "postponed", "cancelled"].includes(statusFilter)) {
    matchesQuery = matchesQuery.eq("status", statusFilter);
  }
  if (validTeamId) {
    matchesQuery = matchesQuery.or(`home_team_id.eq.${validTeamId},away_team_id.eq.${validTeamId}`);
  }
  if (validRound) {
    matchesQuery = matchesQuery.eq("round_name", validRound);
  }

  const [
    { data: matchesData, error: matchesError },
    { data: roundsData },
  ] = await Promise.all([
    matchesQuery.order("scheduled_at", { ascending: true }),
    supabase
      .from("matches")
      .select("round_name")
      .eq("league_id", league.id)
      .eq("season_id", selectedSeason.id)
      .not("round_name", "is", null),
  ]);

  if (matchesError) {
    throw matchesError;
  }

  const matches = (matchesData ?? []) as MatchListItem[];
  const availableRounds = [...new Set((roundsData ?? []).map((m) => m.round_name).filter(Boolean))] as string[];

  const teamsMap = new Map(teams.map((team) => [team.id, team]));
  const venuesMap = new Map(venues.map((venue) => [venue.id, venue.name]));

  return (
    <main className="w-full">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <PublicLeagueHeader league={league} />
        <PublicNav leagueSlug={league.slug} />

        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl shadow-xl text-white">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-base font-bold text-white">Temporadas y Filtros</h2>
          </div>
          <div className="space-y-4 pt-4">
            <form method="get" className="space-y-4">
              <MatchSeasonSelector
                leagueSlug={league.slug}
                seasons={seasons.map((season) => ({ id: season.id, name: season.name }))}
                selectedSeasonId={selectedSeason.id}
                basePath="/liga"
              />
              <p className="text-xs text-gray-400">
                Mostrando calendario para <span className="font-semibold text-white">{selectedSeason.name}</span>.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="team-filter" className="text-xs font-medium text-gray-300">
                    Equipo
                  </label>
                  <select
                    id="team-filter"
                    name="teamId"
                    defaultValue={validTeamId ?? ""}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="" className="bg-slate-900 text-white">Todos los equipos</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id} className="bg-slate-900 text-white">
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="round-filter" className="text-xs font-medium text-gray-300">
                    Jornada
                  </label>
                  <select
                    id="round-filter"
                    name="round"
                    defaultValue={validRound}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="" className="bg-slate-900 text-white">Todas las jornadas</option>
                    {availableRounds.map((round) => (
                      <option key={round} value={round} className="bg-slate-900 text-white">
                        {round}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-950/40 transition"
                >
                  Aplicar filtros
                </button>
                <a
                  href={`/liga/${league.slug}/matches?seasonId=${selectedSeason.id}`}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition"
                >
                  Limpiar
                </a>
              </div>
            </form>
          </div>
        </div>

        {matches.length === 0 ? (
          <EmptyState
            title="Sin partidos programados"
            description="Aún no hay partidos para la temporada seleccionada."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {matches.map((match) => (
              <PublicMatchCard
                key={match.id}
                homeTeamName={teamsMap.get(match.home_team_id)?.name ?? "Equipo local"}
                awayTeamName={teamsMap.get(match.away_team_id)?.name ?? "Equipo visitante"}
                homeTeamLogo={teamsMap.get(match.home_team_id)?.logo_url ?? null}
                awayTeamLogo={teamsMap.get(match.away_team_id)?.logo_url ?? null}
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
      </section>
    </main>
  );
}
