import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/status-badge";
import { TextLink } from "@/components/ui/text-link";
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
          <CardTitle className="min-w-0 break-words text-base">
            {showPlayerColumn && player ? player.full_name : showTeamColumn && team ? team.name : "Registro"}
          </CardTitle>
          <StatusBadge
            variant={registrationStatusStyles[registration.status].variant}
            className={`px-3 py-1 ${registrationStatusStyles[registration.status].className ?? ""}`}
          >
            {formatLabel(registration.status)}
          </StatusBadge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 break-words text-sm text-gray-700">
        {showPlayerColumn ? (
          <p>
            Jugador:{" "}
            {player ? (
              <TextLink
                href={`/dashboard/leagues/${leagueSlug}/players/${player.id}`}
              >
                {player.full_name}
              </TextLink>
            ) : (
              "No disponible"
            )}
          </p>
        ) : null}

        {showTeamColumn ? (
          <p>
            Equipo:{" "}
            {team ? (
              <TextLink
                href={`/dashboard/leagues/${leagueSlug}/teams/${team.slug}`}
              >
                {team.name}
              </TextLink>
            ) : (
              "No disponible"
            )}
          </p>
        ) : null}

        <p>
          Temporada:{" "}
          {season ? (
            <TextLink
              href={`/dashboard/leagues/${leagueSlug}/seasons/${season.slug}`}
            >
              {season.name}
            </TextLink>
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
