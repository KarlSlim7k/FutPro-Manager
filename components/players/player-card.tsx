import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/status-badge";
import { TextLink } from "@/components/ui/text-link";
import type { DominantFoot, Player, PlayerStatus } from "@/types/database";

type PlayerCardData = Pick<
  Player,
  "id" | "full_name" | "status" | "birth_date" | "photo_url" | "preferred_position" | "dominant_foot"
>;

interface PlayerCardProps {
  leagueSlug: string;
  player: PlayerCardData;
}

const statusVariants: Record<PlayerStatus, StatusBadgeVariant> = {
  active: "success",
  inactive: "neutral",
  injured: "danger",
  suspended: "warning",
  retired: "neutral",
};

const dominantFootLabels: Record<DominantFoot, string> = {
  left: "Izquierdo",
  right: "Derecho",
  both: "Ambos",
};

function formatStatus(status: PlayerStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatBirthDate(date: string | null) {
  if (!date) {
    return "No definida";
  }

  return new Intl.DateTimeFormat("es-MX", { dateStyle: "long" }).format(new Date(`${date}T00:00:00`));
}

export function PlayerCard({ leagueSlug, player }: PlayerCardProps) {
  return (
    <Card className="flex h-full flex-col justify-between">
      <div>
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="line-clamp-2 text-lg">{player.full_name}</CardTitle>
            <StatusBadge variant={statusVariants[player.status]}>
              {formatStatus(player.status)}
            </StatusBadge>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          <p className="text-sm text-gray-600">Nacimiento: {formatBirthDate(player.birth_date)}</p>
          <p className="text-sm text-gray-600">Posición: {player.preferred_position || "No definida"}</p>
          <p className="text-sm text-gray-600">
            Perfil dominante: {player.dominant_foot ? dominantFootLabels[player.dominant_foot] : "No definido"}
          </p>
          <p className="text-sm text-gray-600">
            Foto:{" "}
            {player.photo_url ? (
              <a
                href={player.photo_url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-emerald-700 hover:text-emerald-600"
              >
                Disponible
              </a>
            ) : (
              "No definida"
            )}
          </p>
        </CardContent>
      </div>

      <CardContent className="pt-2">
        <div className="flex items-center gap-4">
          <TextLink
            href={`/dashboard/leagues/${leagueSlug}/players/${player.id}`}
          >
            Ver detalle
          </TextLink>
          <TextLink
            href={`/dashboard/leagues/${leagueSlug}/players/${player.id}/edit`}
            variant="muted"
          >
            Editar
          </TextLink>
        </div>
      </CardContent>
    </Card>
  );
}
