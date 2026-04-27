import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MatchStatus } from "@/types/database";

type MatchCardProps = {
  matchId: string;
  leagueSlug: string;
  seasonName: string;
  homeTeamName: string;
  awayTeamName: string;
  venueName: string | null;
  scheduledAt: string;
  status: MatchStatus;
  homeScore: number;
  awayScore: number;
  roundName: string | null;
};

function formatStatusLabel(status: MatchStatus) {
  const labels: Record<MatchStatus, string> = {
    scheduled: "Programado",
    in_progress: "En juego",
    completed: "Finalizado",
    postponed: "Pospuesto",
    cancelled: "Cancelado",
  };
  return labels[status];
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function MatchCard({
  matchId,
  leagueSlug,
  seasonName,
  homeTeamName,
  awayTeamName,
  venueName,
  scheduledAt,
  status,
  homeScore,
  awayScore,
  roundName,
}: MatchCardProps) {
  const scoreDisplay = status === "scheduled" || status === "postponed" || status === "cancelled"
    ? "vs"
    : `${homeScore} - ${awayScore}`;

  return (
    <Card className="transition hover:shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900">
            {homeTeamName} {scoreDisplay} {awayTeamName}
          </CardTitle>
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              status === "completed"
                ? "bg-emerald-100 text-emerald-800"
                : status === "in_progress"
                ? "bg-blue-100 text-blue-800"
                : status === "cancelled"
                ? "bg-red-100 text-red-800"
                : status === "postponed"
                ? "bg-amber-100 text-amber-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {formatStatusLabel(status)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-gray-600">
          <p>
            <span className="font-medium text-gray-700">Temporada:</span> {seasonName}
          </p>
          {roundName ? (
            <p>
              <span className="font-medium text-gray-700">Jornada:</span> {roundName}
            </p>
          ) : null}
          <p>
            <span className="font-medium text-gray-700">Fecha:</span> {formatDateTime(scheduledAt)}
          </p>
          {venueName ? (
            <p>
              <span className="font-medium text-gray-700">Sede:</span> {venueName}
            </p>
          ) : null}
        </div>
        <Link
          href={`/dashboard/leagues/${leagueSlug}/matches/${matchId}`}
          className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
        >
          Ver detalle
        </Link>
      </CardContent>
    </Card>
  );
}
