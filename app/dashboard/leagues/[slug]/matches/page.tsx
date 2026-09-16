import { notFound, redirect } from "next/navigation";
import { CreateMatchForm } from "@/components/matches/create-match-form";
import { MatchCard } from "@/components/matches/match-card";
import { MatchListFilters } from "@/components/matches/match-list-filters";
import { MatchSeasonSelector } from "@/components/matches/match-season-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormSectionCard } from "@/components/ui/form-section-card";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { TextLink } from "@/components/ui/text-link";
import { createClient } from "@/lib/supabase/server";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";
import { MATCH_STATUS_VALUES, type MatchStatus } from "@/types/database";
import type { League, Match, Season, Team, Venue } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;
type SeasonOption = Pick<Season, "id" | "name" | "start_date">;
type TeamOption = Pick<Team, "id" | "name" | "status">;
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
  | "referee_id"
>;

interface MatchesPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    seasonId?: string | string[];
    status?: string | string[];
    teamId?: string | string[];
    round?: string | string[];
    myMatches?: string | string[];
  }>;
}

function getSingleParam(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.trim() !== "" ? v.trim() : undefined;
}

export default async function MatchesPage({ params, searchParams }: MatchesPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const seasonId = getSingleParam(sp.seasonId);
  const rawStatus = getSingleParam(sp.status);
  const filterStatus = rawStatus && (MATCH_STATUS_VALUES as readonly string[]).includes(rawStatus)
    ? (rawStatus as MatchStatus)
    : undefined;
  const filterTeamId = getSingleParam(sp.teamId);
  const filterRound = getSingleParam(sp.round);
  const filterMyMatches = getSingleParam(sp.myMatches) === "1";

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

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: league.id,
  });

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
      .select("id, name, status")
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
      <section className="space-y-6">
        <PageHeader
          backHref={`/dashboard/leagues/${league.slug}`}
          backLabel="Volver al detalle de liga"
          title="Partidos"
          description={
            <>
              Programa y consulta los partidos de{" "}
              <span className="font-medium text-gray-900">{league.name}</span>.
            </>
          }
        />

        <EmptyState
          title="Sin temporadas registradas"
          description="Necesitas al menos una temporada para comenzar a programar partidos."
          action={
            <TextLink href={`/dashboard/leagues/${league.slug}/seasons`}>
              Ir al módulo de temporadas
            </TextLink>
          }
        />
      </section>
    );
  }

  let matchesQuery = supabase
    .from("matches")
    .select("id, season_id, home_team_id, away_team_id, venue_id, scheduled_at, status, home_score, away_score, round_name, referee_id")
    .eq("league_id", league.id)
    .eq("season_id", selectedSeason.id)
    .order("scheduled_at", { ascending: true });

  if (filterStatus) matchesQuery = matchesQuery.eq("status", filterStatus);
  if (filterTeamId) matchesQuery = matchesQuery.or(`home_team_id.eq.${filterTeamId},away_team_id.eq.${filterTeamId}`);
  if (filterRound) matchesQuery = matchesQuery.ilike("round_name", `%${filterRound}%`);
  if (filterMyMatches) matchesQuery = matchesQuery.eq("referee_id", user.id);

  const { data: matchesData, error: matchesError } = await matchesQuery;

  if (matchesError) {
    throw matchesError;
  }

  const matches = (matchesData ?? []) as MatchListItem[];

  const activeTeams = teams.filter((team) => team.status === "active");
  const teamsForScheduling = activeTeams.length >= 2 ? activeTeams : teams;

  const teamsMap = new Map(teams.map((team) => [team.id, team.name]));
  const venuesMap = new Map(venues.map((venue) => [venue.id, venue.name]));

  // Fetch referee profiles for matches that have a referee assigned
  const uniqueRefereeIds = [
    ...new Set(matches.map((m) => m.referee_id).filter(Boolean)),
  ] as string[];

  let refereesMap = new Map<string, string>();
  if (uniqueRefereeIds.length > 0) {
    const { data: refereeProfiles } = await supabase
      .from("profiles")
      .select("id, full_name, display_name")
      .in("id", uniqueRefereeIds);

    if (refereeProfiles) {
      refereesMap = new Map(
        refereeProfiles.map((p) => [
          p.id,
          p.display_name || p.full_name || `Usuario ${p.id.slice(0, 8)}...`,
        ])
      );
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        backHref={`/dashboard/leagues/${league.slug}`}
        backLabel="Volver al detalle de liga"
        title="Partidos"
        description={
          <>
            Programa y consulta los partidos de{" "}
            <span className="font-medium text-gray-900">{league.name}</span>.
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Temporadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <MatchSeasonSelector
            leagueSlug={league.slug}
            seasons={seasons.map((season) => ({ id: season.id, name: season.name }))}
            selectedSeasonId={selectedSeason.id}
          />
          <p className="text-sm text-gray-600">
            Mostrando calendario para <span className="font-medium text-gray-900">{selectedSeason.name}</span>.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <SectionHeader
            title="Calendario"
            className="gap-0"
            titleClassName="text-lg font-semibold"
          />

          <MatchListFilters
            teams={teams.map((team) => ({ id: team.id, name: team.name }))}
            currentStatus={filterStatus}
            currentTeamId={filterTeamId}
            currentRound={filterRound}
            showMyMatchesFilter={
              permissions.assignedMatchIds.length > 0 ||
              permissions.leagueRole === "referee" ||
              permissions.canManageLeague
            }
            onlyMyMatches={filterMyMatches}
          />
          {matches.length === 0 ? (
            <EmptyState
              title="Sin partidos programados"
              description={
                filterStatus || filterTeamId || filterRound || filterMyMatches
                  ? "Ningún partido coincide con los filtros seleccionados."
                  : permissions.canManageMatches
                    ? "Aún no hay partidos para la temporada seleccionada. Programa el primer encuentro usando el formulario."
                    : "Aún no hay partidos para la temporada seleccionada."
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {matches.map((match) => {
                const isRefereeOfThisMatch = match.referee_id === user.id;
                const canUpdateThisResult =
                  permissions.canManageLeague || isRefereeOfThisMatch;
                const isStaffForMatch = permissions.staffTeamIds.some(
                  (teamId) => teamId === match.home_team_id || teamId === match.away_team_id
                );
                return (
                  <MatchCard
                    key={match.id}
                    matchId={match.id}
                    leagueSlug={league.slug}
                    homeTeamName={teamsMap.get(match.home_team_id) ?? "Equipo local"}
                    awayTeamName={teamsMap.get(match.away_team_id) ?? "Equipo visitante"}
                    venueName={match.venue_id ? (venuesMap.get(match.venue_id) ?? null) : null}
                    scheduledAt={match.scheduled_at}
                    status={match.status}
                    homeScore={match.home_score}
                    awayScore={match.away_score}
                    roundName={match.round_name}
                    refereeName={match.referee_id ? (refereesMap.get(match.referee_id) ?? null) : null}
                    isAssignedReferee={isRefereeOfThisMatch}
                    canEdit={permissions.canManageMatches}
                    canUpdateResult={canUpdateThisResult}
                    canManageEvents={
                      permissions.canManageLeague || isRefereeOfThisMatch || isStaffForMatch
                    }
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {permissions.canManageMatches ? (
            <FormSectionCard title="Programar partido">
              <CreateMatchForm
                leagueSlug={league.slug}
                seasons={seasons.map((season) => ({ id: season.id, name: season.name }))}
                teams={teamsForScheduling.map((team) => ({ id: team.id, name: team.name }))}
                venues={venues.map((venue) => ({ id: venue.id, name: venue.name }))}
                initialSeasonId={selectedSeason.id}
              />
            </FormSectionCard>
          ) : (
            <Card>
              <CardContent className="py-6">
                <p className="text-sm text-gray-600">
                  Tienes acceso de consulta a los partidos de esta liga. Las acciones administrativas están disponibles para administradores de liga.
                </p>
              </CardContent>
            </Card>
          )}

          {activeTeams.length < 2 && teams.length >= 2 ? (
            <Card>
              <CardContent>
                <p className="text-sm text-amber-700">
                  Se muestran todos los equipos porque no hay al menos 2 equipos activos en esta liga.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </section>
  );
}
