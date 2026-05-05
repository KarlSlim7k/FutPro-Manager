import { notFound } from "next/navigation";
import { Metadata } from "next";
import { MatchSeasonSelector } from "@/components/matches/match-season-selector";
import { PublicMatchCard } from "@/components/public/public-match-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PublicLeagueHeader } from "@/components/public/public-league-header";
import { PublicNav } from "@/components/public/public-nav";
import { createClient } from "@/lib/supabase/server";
import type { League, Match, Season, Team, Venue } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug" | "description" | "status">;
type SeasonOption = Pick<Season, "id" | "name" | "start_date">;
type TeamOption = Pick<Team, "id" | "name">;
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
  searchParams: Promise<{ seasonId?: string | string[]; status?: string | string[] }>;
}

export async function generateMetadata({ params }: LeagueMatchesPublicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("leagues")
    .select("name")
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("status", "active")
    .maybeSingle();

  if (!data) {
    return { title: "Liga no encontrada | FutPro Manager" };
  }

  return {
    title: `Partidos - ${data.name} | FutPro Manager`,
  };
}

export default async function LeagueMatchesPublicPage({ params, searchParams }: LeagueMatchesPublicPageProps) {
  const { slug } = await params;
  const { seasonId: rawSeasonId, status: rawStatus } = await searchParams;
  const seasonId = Array.isArray(rawSeasonId) ? rawSeasonId[0] : rawSeasonId;
  const statusFilter = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus;

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
      .select("id, name")
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
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-100">
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

  let matchesQuery = supabase
    .from("matches")
    .select("id, season_id, home_team_id, away_team_id, venue_id, scheduled_at, status, home_score, away_score, round_name")
    .eq("league_id", league.id)
    .eq("season_id", selectedSeason.id);

  if (statusFilter && ["scheduled", "in_progress", "completed", "postponed", "cancelled"].includes(statusFilter)) {
    matchesQuery = matchesQuery.eq("status", statusFilter);
  }

  const { data: matchesData, error: matchesError } = await matchesQuery.order("scheduled_at", { ascending: true });

  if (matchesError) {
    throw matchesError;
  }

  const matches = (matchesData ?? []) as MatchListItem[];

  const teamsMap = new Map(teams.map((team) => [team.id, team.name]));
  const venuesMap = new Map(venues.map((venue) => [venue.id, venue.name]));

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-100">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <PublicLeagueHeader league={league} />
        <PublicNav leagueSlug={league.slug} />

        <Card>
          <CardHeader>
            <CardTitle>Temporadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <MatchSeasonSelector
              leagueSlug={league.slug}
              seasons={seasons.map((season) => ({ id: season.id, name: season.name }))}
              selectedSeasonId={selectedSeason.id}
              basePath="/liga"
            />
            <p className="text-sm text-gray-600">
              Mostrando calendario para <span className="font-medium text-gray-900">{selectedSeason.name}</span>.
            </p>
          </CardContent>
        </Card>

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
      </section>
    </main>
  );
}
