import Link from "next/link";
import { MatchStatusBadge } from "@/components/matches/match-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MatchStatus } from "@/types/database";

type MatchCardProps = {
  matchId: string;
  leagueSlug: string;
  homeTeamName: string;
  awayTeamName: string;
  venueName: string | null;
  scheduledAt: string;
  status: MatchStatus;
  homeScore: number;
  awayScore: number;
  roundName: string | null;
};

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(date));
}

export function MatchCard({
  matchId,
  leagueSlug,
  homeTeamName,
  awayTeamName,
  venueName,
  scheduledAt,
  status,
  homeScore,
  awayScore,
  roundName,
}: MatchCardProps) {
  return (
    <Card className="transition hover:shadow-sm">
      <CardHeader className="space-y-3 pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="text-lg">
            {homeTeamName} vs {awayTeamName}
          </CardTitle>
          <MatchStatusBadge status={status} />
        </div>
        <p className="text-sm text-gray-600">{roundName || "Jornada no definida"}</p>
      </CardHeader>

      <CardContent className="space-y-2 text-sm text-gray-700">
        <p>
          <span className="font-medium text-gray-900">Fecha y hora:</span> {formatDateTime(scheduledAt)}
        </p>
        <p>
          <span className="font-medium text-gray-900">Sede:</span> {venueName || "Sin sede asignada"}
        </p>
        <p>
          <span className="font-medium text-gray-900">Marcador actual:</span> {homeScore} - {awayScore}
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-1">
          <Link
            href={`/dashboard/leagues/${leagueSlug}/matches/${matchId}`}
            className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
          >
            Ver detalle
          </Link>
          <Link
            href={`/dashboard/leagues/${leagueSlug}/matches/${matchId}/edit`}
            className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
          >
            Editar
          </Link>
          {status === "cancelled" ? (
            <span className="inline-flex items-center text-sm font-medium text-gray-500">
              Resultado no disponible
            </span>
          ) : (
            <Link
              href={`/dashboard/leagues/${leagueSlug}/matches/${matchId}/result`}
              className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
            >
              Resultado
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
