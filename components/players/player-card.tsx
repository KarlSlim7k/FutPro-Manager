import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DominantFoot, Player, PlayerStatus } from "@/types/database";

type PlayerCardData = Pick<
  Player,
  "id" | "full_name" | "status" | "birth_date" | "photo_url" | "preferred_position" | "dominant_foot"
>;

interface PlayerCardProps {
  leagueSlug: string;
  player: PlayerCardData;
}

const statusStyles: Record<PlayerStatus, string> = {
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-gray-200 text-gray-700",
  injured: "bg-red-100 text-red-800",
  suspended: "bg-amber-100 text-amber-800",
  retired: "bg-slate-200 text-slate-700",
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
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[player.status]}`}
            >
              {formatStatus(player.status)}
            </span>
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
          <Link
            href={`/dashboard/leagues/${leagueSlug}/players/${player.id}`}
            className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
          >
            Ver detalle
          </Link>
          <Link
            href={`/dashboard/leagues/${leagueSlug}/players/${player.id}/edit`}
            className="inline-flex items-center text-sm font-medium text-gray-600 transition hover:text-gray-800"
          >
            Editar
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
