import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/status-badge";
import { TextLink } from "@/components/ui/text-link";
import { createClient } from "@/lib/supabase/server";
import type {
  League,
  Player,
  PlayerRegistrationStatus,
  PlayerTeamRegistration,
  Season,
  Team,
} from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;
type TeamSummary = Pick<Team, "id" | "name" | "slug" | "status">;
type SeasonItem = Pick<Season, "id" | "name" | "slug" | "status" | "start_date" | "end_date">;
type RegistrationItem = Pick<
  PlayerTeamRegistration,
  "id" | "player_id" | "season_id" | "jersey_number" | "status" | "registered_at" | "created_at"
>;
type PlayerItem = Pick<Player, "id" | "full_name" | "preferred_position" | "status" | "photo_url">;
type RosterRegistration = Pick<
  PlayerTeamRegistration,
  "id" | "jersey_number" | "status" | "registered_at"
> & {
  player: PlayerItem | null;
};

interface TeamRosterPageProps {
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function TeamRosterPage({ params, searchParams }: TeamRosterPageProps) {
  const { slug, teamSlug } = await params;
  const { seasonId: rawSeasonId } = await searchParams;
  const seasonId = Array.isArray(rawSeasonId) ? rawSeasonId[0] : rawSeasonId;

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

  const { data: seasonsData, error: seasonsError } = await supabase
    .from("seasons")
    .select("id, name, slug, status, start_date, end_date")
    .eq("league_id", league.id)
    .order("start_date", { ascending: false });

  if (seasonsError) {
    throw seasonsError;
  }

  const seasons = (seasonsData ?? []) as SeasonItem[];
  const selectedSeason =
    seasons.find((seasonItem) => seasonItem.id === seasonId) ??
    seasons[0] ??
    null;

  const rosterBasePath = `/dashboard/leagues/${league.slug}/teams/${team.slug}/roster`;

  if (!selectedSeason) {
    return (
      <section className="space-y-6">
        <PageHeader
          backHref={`/dashboard/leagues/${league.slug}/teams/${team.slug}`}
          backLabel="Volver al detalle del equipo"
          title="Plantilla"
          description={
            <>
              Consulta los jugadores registrados de{" "}
              <span className="font-medium text-gray-900">{team.name}</span> por temporada.
            </>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>Contexto</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Eyebrow>Liga</Eyebrow>
              <p className="mt-1 text-sm text-gray-900">{league.name}</p>
            </div>
            <div>
              <Eyebrow>Equipo</Eyebrow>
              <p className="mt-1 text-sm text-gray-900">{team.name}</p>
            </div>
          </CardContent>
        </Card>

        <EmptyState
          title="Sin temporadas registradas"
          description="Esta liga aún no tiene temporadas registradas. Crea una temporada antes de consultar plantillas."
          action={
            <TextLink href={`/dashboard/leagues/${league.slug}/seasons`}>
              Ir al módulo de temporadas
            </TextLink>
          }
        />
      </section>
    );
  }

  const { data: registrationsData, error: registrationsError } = await supabase
    .from("player_team_registrations")
    .select("id, player_id, season_id, jersey_number, status, registered_at, created_at")
    .eq("team_id", team.id)
    .eq("season_id", selectedSeason.id)
    .order("jersey_number", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (registrationsError) {
    throw registrationsError;
  }

  const registrations = (registrationsData ?? []) as RegistrationItem[];
  const playerIds = [...new Set(registrations.map((registration) => registration.player_id))];

  let players: PlayerItem[] = [];
  if (playerIds.length > 0) {
    const { data: playersData, error: playersError } = await supabase
      .from("players")
      .select("id, full_name, preferred_position, status, photo_url")
      .eq("league_id", league.id)
      .in("id", playerIds);

    if (playersError) {
      throw playersError;
    }

    players = (playersData ?? []) as PlayerItem[];
  }

  const playersById = new Map(players.map((player) => [player.id, player]));

  const rosterRegistrations: RosterRegistration[] = registrations.map((registration) => ({
    id: registration.id,
    jersey_number: registration.jersey_number,
    status: registration.status,
    registered_at: registration.registered_at,
    player: playersById.get(registration.player_id) ?? null,
  }));

  return (
    <section className="space-y-6">
      <PageHeader
        backHref={`/dashboard/leagues/${league.slug}/teams/${team.slug}`}
        backLabel="Volver al detalle del equipo"
        title="Plantilla"
        description={
          <>
            Consulta los jugadores registrados de{" "}
            <span className="font-medium text-gray-900">{team.name}</span> por temporada.
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Contexto de plantilla</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Eyebrow>Liga</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{league.name}</p>
          </div>
          <div>
            <Eyebrow>Equipo</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{team.name}</p>
          </div>
          <div>
            <Eyebrow>Temporada seleccionada</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{selectedSeason.name}</p>
          </div>
          <div>
            <Eyebrow>Estado de temporada</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{formatLabel(selectedSeason.status)}</p>
          </div>
          <div>
            <Eyebrow>Rango</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(selectedSeason.start_date)} - {formatDate(selectedSeason.end_date)}
            </p>
          </div>
          <div>
            <Eyebrow>seasonId activo</Eyebrow>
            <p className="mt-1 break-all text-sm text-gray-900">{selectedSeason.id}</p>
          </div>
          <div>
            <Eyebrow>Jugadores registrados</Eyebrow>
            <p className="mt-1 text-sm font-medium text-gray-900">{rosterRegistrations.length}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Temporadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">Selecciona una temporada para ver la plantilla del equipo.</p>
          <div className="flex flex-wrap gap-2">
            {seasons.map((seasonItem) => {
              const isActiveSeason = seasonItem.id === selectedSeason.id;

              return (
                <Link
                  key={seasonItem.id}
                  href={`${rosterBasePath}?seasonId=${seasonItem.id}`}
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition ${
                    isActiveSeason
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-emerald-600 hover:text-emerald-700"
                  }`}
                >
                  {seasonItem.name}
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {rosterRegistrations.length === 0 ? (
        <EmptyState
          title="Sin jugadores registrados"
          description={
            <>
              <p>Este equipo aún no tiene jugadores registrados en la temporada seleccionada.</p>
              <p className="mt-2">Ve al módulo de jugadores para registrar jugadores en equipos y temporadas.</p>
            </>
          }
          action={
            <TextLink href={`/dashboard/leagues/${league.slug}/players`}>
              Ir al módulo de jugadores
            </TextLink>
          }
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
                        {registration.player ? (
                          <TextLink
                            href={`/dashboard/leagues/${league.slug}/players/${registration.player.id}`}
                          >
                            {registration.player.full_name}
                          </TextLink>
                        ) : (
                          "Jugador no disponible"
                        )}
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
                      <td className="px-4 py-3">
                        {registration.player ? (
                          <TextLink
                            href={`/dashboard/leagues/${league.slug}/players/${registration.player.id}`}
                          >
                            {registration.player.full_name}
                          </TextLink>
                        ) : (
                          "No disponible"
                        )}
                      </td>
                      <td className="px-4 py-3">{registration.jersey_number ?? "Sin número"}</td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          variant={registrationStatusStyles[registration.status].variant}
                          className={`px-2.5 py-1 ${registrationStatusStyles[registration.status].className ?? ""}`}
                        >
                          {formatLabel(registration.status)}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3">{formatDateTime(registration.registered_at)}</td>
                      <td className="px-4 py-3">{registration.player?.preferred_position || "No definida"}</td>
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
    </section>
  );
}
