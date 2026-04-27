import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MatchStatus } from "@/types/database";

type MatchSummaryProps = {
  leagueSlug: string;
  seasonId: string;
  seasonName: string;
  seasonSlug: string;
  homeTeamId: string;
  homeTeamName: string;
  homeTeamSlug: string;
  awayTeamId: string;
  awayTeamName: string;
  awayTeamSlug: string;
  venueId: string | null;
  venueName: string | null;
  scheduledAt: string;
  status: MatchStatus;
  homeScore: number;
  awayScore: number;
  roundName: string | null;
  createdAt: string;
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
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(date));
}

export function MatchSummary({
  leagueSlug,
  seasonId,
  seasonName,
  seasonSlug,
  homeTeamId,
  homeTeamName,
  homeTeamSlug,
  awayTeamId,
  awayTeamName,
  awayTeamSlug,
  venueId,
  venueName,
  scheduledAt,
  status,
  homeScore,
  awayScore,
  roundName,
  createdAt,
}: MatchSummaryProps) {
  const scoreDisplay = status === "scheduled" || status === "postponed" || status === "cancelled"
    ? "vs"
    : `${homeScore} - ${awayScore}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg font-bold text-gray-900">
            {homeTeamName} <span className="text-emerald-700">{scoreDisplay}</span> {awayTeamName}
          </CardTitle>
          <span
            className={`inline-flex self-start rounded-full px-3 py-1 text-xs font-medium sm:self-auto ${
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
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Temporada</p>
          <p className="mt-1 text-sm text-gray-900">
            <Link
              href={`/dashboard/leagues/${leagueSlug}/seasons/${seasonSlug}`}
              className="font-medium text-emerald-700 hover:text-emerald-600"
            >
              {seasonName}
            </Link>
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Jornada</p>
          <p className="mt-1 text-sm text-gray-900">{roundName ?? "No definida"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Equipo local</p>
          <p className="mt-1 text-sm text-gray-900">
            <Link
              href={`/dashboard/leagues/${leagueSlug}/teams/${homeTeamSlug}`}
              className="font-medium text-emerald-700 hover:text-emerald-600"
            >
              {homeTeamName}
            </Link>
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Equipo visitante</p>
          <p className="mt-1 text-sm text-gray-900">
            <Link
              href={`/dashboard/leagues/${leagueSlug}/teams/${awayTeamSlug}`}
              className="font-medium text-emerald-700 hover:text-emerald-600"
            >
              {awayTeamName}
            </Link>
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Fecha y hora</p>
          <p className="mt-1 text-sm text-gray-900">{formatDateTime(scheduledAt)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Sede</p>
          <p className="mt-1 text-sm text-gray-900">
            {venueId && venueName ? (
              <Link
                href={`/dashboard/leagues/${leagueSlug}/venues/${venueId}`}
                className="font-medium text-emerald-700 hover:text-emerald-600"
              >
                {venueName}
              </Link>
            ) : (
              "No definida"
            )}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Marcador</p>
          <p className="mt-1 text-sm text-gray-900">
            {status === "scheduled" || status === "postponed" || status === "cancelled"
              ? "Por definir"
              : `${homeScore} - ${awayScore}`}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Fecha de creación</p>
          <p className="mt-1 text-sm text-gray-900">{formatDateTime(createdAt)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
