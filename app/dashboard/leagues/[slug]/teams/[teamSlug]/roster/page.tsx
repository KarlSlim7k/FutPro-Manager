import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CreatePlayerRegistrationForm } from "@/components/registrations/create-player-registration-form";
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
type TeamSummary = Pick<Team, "id" | "name" | "slug" | "status">;
type SeasonItem = Pick<Season, "id" | "name" | "slug" | "status" | "start_date">;
type PlayerItem = Pick<Player, "id" | "full_name" | "status" | "preferred_position">;
type RegistrationItem = Pick<
  PlayerTeamRegistration,
  "id" | "player_id" | "team_id" | "season_id" | "jersey_number" | "status" | "registered_at"
>;

interface TeamRosterPageProps {
  params: Promise<{ slug: string; teamSlug: string }>;
}

function formatStatus(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function TeamRosterPage({ params }: TeamRosterPageProps) {
  const { slug, teamSlug } = await params;
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

  const { data: teamData, error: teamError } = await supabase
    .from("teams")
    .select("id, name, slug, status")
    .eq("league_id", league.id)
    .eq("slug", teamSlug)
    .maybeSingle();

  if (teamError) {
    throw teamError;
  }

  if (!teamData) {
    notFound();
  }

  const team = teamData as TeamSummary;

  const [seasonsResult, playersResult, registrationsResult] = await Promise.all([
    supabase
      .from("seasons")
      .select("id, name, slug, status, start_date")
      .eq("league_id", league.id)
      .order("start_date", { ascending: false }),
    supabase
      .from("players")
      .select("id, full_name, status, preferred_position")
      .eq("league_id", league.id)
      .order("full_name", { ascending: true }),
    supabase
      .from("player_team_registrations")
      .select("id, player_id, team_id, season_id, jersey_number, status, registered_at")
      .eq("team_id", team.id)
      .order("registered_at", { ascending: false }),
  ]);

  if (seasonsResult.error) {
    throw seasonsResult.error;
  }

  if (playersResult.error) {
    throw playersResult.error;
  }

  if (registrationsResult.error) {
    throw registrationsResult.error;
  }

  const seasons = (seasonsResult.data ?? []) as SeasonItem[];
  const players = (playersResult.data ?? []) as PlayerItem[];
  const registrations = (registrationsResult.data ?? []) as RegistrationItem[];

  const seasonsById = new Map(seasons.map((season) => [season.id, season]));
  const playersById = new Map(players.map((player) => [player.id, player]));

  const registrationRows: PlayerRegistrationRow[] = registrations.map((registration) => ({
    id: registration.id,
    jersey_number: registration.jersey_number,
    status: registration.status,
    registered_at: registration.registered_at,
    player: playersById.get(registration.player_id) ?? null,
    season: seasonsById.get(registration.season_id) ?? null,
    team,
  }));

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <Link
          href={`/dashboard/leagues/${league.slug}/teams/${team.slug}`}
          className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
        >
          Volver al detalle del equipo
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Plantilla por temporada</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Gestiona registros de jugadores para <span className="font-medium text-gray-900">{team.name}</span> en{" "}
            <span className="font-medium text-gray-900">{league.name}</span>.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del equipo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Equipo</p>
            <p className="mt-1 text-sm text-gray-900">{team.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Estatus</p>
            <p className="mt-1 text-sm text-gray-900">{formatStatus(team.status)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Temporadas disponibles</p>
            <p className="mt-1 text-sm text-gray-900">{seasons.length}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Jugadores disponibles</p>
            <p className="mt-1 text-sm text-gray-900">{players.length}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registrar jugador en el equipo</CardTitle>
        </CardHeader>
        <CardContent>
          <CreatePlayerRegistrationForm
            leagueSlug={league.slug}
            teamSlug={team.slug}
            seasons={seasons}
            players={players}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registros de plantilla</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerRegistrationTable
            leagueSlug={league.slug}
            registrations={registrationRows}
            showPlayerColumn
            showPositionColumn
            emptyTitle="Sin registros en este equipo"
            emptyDescription="Cuando registres jugadores para una temporada, aparecerán aquí."
          />
        </CardContent>
      </Card>
    </section>
  );
}
