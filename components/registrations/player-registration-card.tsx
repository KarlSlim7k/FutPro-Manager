import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  PlayerRegistrationStatus,
  PlayerStatus,
  SeasonStatus,
  TeamStatus,
} from "@/types/database";

export type PlayerRegistrationRow = {
  id: string;
  jersey_number: number | null;
  status: PlayerRegistrationStatus;
  registered_at: string;
  player: {
    id: string;
    full_name: string;
    preferred_position: string | null;
    status: PlayerStatus;
  } | null;
  season: {
    id: string;
    name: string;
    slug: string;
    status: SeasonStatus;
  } | null;
  team: {
    id: string;
    name: string;
    slug: string;
    status: TeamStatus;
  } | null;
};

interface PlayerRegistrationCardProps {
  leagueSlug: string;
  registration: PlayerRegistrationRow;
  showPlayerColumn?: boolean;
  showTeamColumn?: boolean;
  showPositionColumn?: boolean;
}

const registrationStatusStyles: Record<PlayerRegistrationStatus, string> = {
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-gray-200 text-gray-700",
  released: "bg-red-100 text-red-700",
  transferred: "bg-blue-100 text-blue-700",
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

export function PlayerRegistrationCard({
  leagueSlug,
  registration,
  showPlayerColumn = false,
  showTeamColumn = false,
  showPositionColumn = false,
}: PlayerRegistrationCardProps) {
  const season = registration.season;
  const player = registration.player;
  const team = registration.team;

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base">
            {showPlayerColumn && player ? player.full_name : showTeamColumn && team ? team.name : "Registro"}
          </CardTitle>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${registrationStatusStyles[registration.status]}`}
          >
            {formatLabel(registration.status)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-gray-700">
        {showPlayerColumn ? (
          <p>
            Jugador:{" "}
            {player ? (
              <Link
                href={`/dashboard/leagues/${leagueSlug}/players/${player.id}`}
                className="font-medium text-emerald-700 hover:text-emerald-600"
              >
                {player.full_name}
              </Link>
            ) : (
              "No disponible"
            )}
          </p>
        ) : null}

        {showTeamColumn ? (
          <p>
            Equipo:{" "}
            {team ? (
              <Link
                href={`/dashboard/leagues/${leagueSlug}/teams/${team.slug}`}
                className="font-medium text-emerald-700 hover:text-emerald-600"
              >
                {team.name}
              </Link>
            ) : (
              "No disponible"
            )}
          </p>
        ) : null}

        <p>
          Temporada:{" "}
          {season ? (
            <Link
              href={`/dashboard/leagues/${leagueSlug}/seasons/${season.slug}`}
              className="font-medium text-emerald-700 hover:text-emerald-600"
            >
              {season.name}
            </Link>
          ) : (
            "No disponible"
          )}
        </p>

        {showPositionColumn ? <p>Posición: {player?.preferred_position || "No definida"}</p> : null}

        <p>Número: {registration.jersey_number ?? "Sin número"}</p>
        <p>Registrado: {formatDateTime(registration.registered_at)}</p>
      </CardContent>
    </Card>
  );
}
