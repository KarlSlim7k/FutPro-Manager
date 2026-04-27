import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PlayerRegistrationTable } from "@/components/registrations/player-registration-table";
import type { PlayerRegistrationRow } from "@/components/registrations/player-registration-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type {
  League,
  Player,
  PlayerTeamRegistration,
  Season,
  Team,
} from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;
type PlayerSummary = Pick<Player, "id" | "full_name" | "status" | "preferred_position">;
type RegistrationItem = Pick<
  PlayerTeamRegistration,
  "id" | "player_id" | "team_id" | "season_id" | "jersey_number" | "status" | "registered_at"
>;
type TeamItem = Pick<Team, "id" | "name" | "slug" | "status">;
type SeasonItem = Pick<Season, "id" | "name" | "slug" | "status">;

interface PlayerRegistrationsPageProps {
  params: Promise<{ slug: string; playerId: string }>;
}

function formatStatus(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function PlayerRegistrationsPage({ params }: PlayerRegistrationsPageProps) {
  const { slug, playerId } = await params;
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

  const { data: playerData, error: playerError } = await supabase
    .from("players")
    .select("id, full_name, status, preferred_position")
    .eq("league_id", league.id)
    .eq("id", playerId)
    .maybeSingle();

  if (playerError) {
    throw playerError;
  }

  if (!playerData) {
    notFound();
  }

  const player = playerData as PlayerSummary;

  const { data: registrationsData, error: registrationsError } = await supabase
    .from("player_team_registrations")
    .select("id, player_id, team_id, season_id, jersey_number, status, registered_at")
    .eq("player_id", player.id)
    .order("registered_at", { ascending: false });

  if (registrationsError) {
    throw registrationsError;
  }

  const registrations = (registrationsData ?? []) as RegistrationItem[];

  const uniqueTeamIds = [...new Set(registrations.map((registration) => registration.team_id))];
  const uniqueSeasonIds = [...new Set(registrations.map((registration) => registration.season_id))];

  let teams: TeamItem[] = [];
  if (uniqueTeamIds.length > 0) {
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .select("id, name, slug, status")
      .eq("league_id", league.id)
      .in("id", uniqueTeamIds);

    if (teamError) {
      throw teamError;
    }

    teams = (teamData ?? []) as TeamItem[];
  }

  let seasons: SeasonItem[] = [];
  if (uniqueSeasonIds.length > 0) {
    const { data: seasonData, error: seasonError } = await supabase
      .from("seasons")
      .select("id, name, slug, status")
      .eq("league_id", league.id)
      .in("id", uniqueSeasonIds);

    if (seasonError) {
      throw seasonError;
    }

    seasons = (seasonData ?? []) as SeasonItem[];
  }

  const teamsById = new Map(teams.map((team) => [team.id, team]));
  const seasonsById = new Map(seasons.map((season) => [season.id, season]));

  const registrationRows: PlayerRegistrationRow[] = registrations.map((registration) => ({
    id: registration.id,
    jersey_number: registration.jersey_number,
    status: registration.status,
    registered_at: registration.registered_at,
    player,
    team: teamsById.get(registration.team_id) ?? null,
    season: seasonsById.get(registration.season_id) ?? null,
  }));

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <Link
          href={`/dashboard/leagues/${league.slug}/players/${player.id}`}
          className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
        >
          Volver al detalle del jugador
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Historial de registros</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Movimientos de <span className="font-medium text-gray-900">{player.full_name}</span> en{" "}
            <span className="font-medium text-gray-900">{league.name}</span>.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del jugador</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Nombre</p>
            <p className="mt-1 text-sm text-gray-900">{player.full_name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Estatus</p>
            <p className="mt-1 text-sm text-gray-900">{formatStatus(player.status)}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Posición preferida
            </p>
            <p className="mt-1 text-sm text-gray-900">{player.preferred_position || "No definida"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equipos y temporadas registradas</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerRegistrationTable
            leagueSlug={league.slug}
            registrations={registrationRows}
            showTeamColumn
            emptyTitle="Sin historial de registros"
            emptyDescription="Este jugador aún no tiene registros en equipos por temporada."
          />
        </CardContent>
      </Card>
    </section>
  );
}
