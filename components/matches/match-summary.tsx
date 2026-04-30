import { Eyebrow } from "@/components/ui/eyebrow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/status-badge";
import { TextLink } from "@/components/ui/text-link";
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

type BadgeStyle = {
  variant: StatusBadgeVariant;
  className?: string;
};

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
  void seasonId;
  void homeTeamId;
  void awayTeamId;

  const scoreDisplay = status === "scheduled" || status === "postponed" || status === "cancelled"
    ? "vs"
    : `${homeScore} - ${awayScore}`;
  const statusStyles: Record<MatchStatus, BadgeStyle> = {
    completed: { variant: "success" },
    in_progress: { variant: "info" },
    cancelled: { variant: "danger" },
    postponed: { variant: "warning" },
    scheduled: { variant: "neutral", className: "text-gray-800" },
  };
  const statusStyle = statusStyles[status];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg font-bold text-gray-900">
            {homeTeamName} <span className="text-emerald-700">{scoreDisplay}</span> {awayTeamName}
          </CardTitle>
          <StatusBadge
            variant={statusStyle.variant}
            className={`self-start px-3 py-1 sm:self-auto ${statusStyle.className ?? ""}`}
          >
            {formatStatusLabel(status)}
          </StatusBadge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div>
          <Eyebrow>Temporada</Eyebrow>
          <p className="mt-1 text-sm text-gray-900">
            <TextLink
              href={`/dashboard/leagues/${leagueSlug}/seasons/${seasonSlug}`}
            >
              {seasonName}
            </TextLink>
          </p>
        </div>
        <div>
          <Eyebrow>Jornada</Eyebrow>
          <p className="mt-1 text-sm text-gray-900">{roundName ?? "No definida"}</p>
        </div>
        <div>
          <Eyebrow>Equipo local</Eyebrow>
          <p className="mt-1 text-sm text-gray-900">
            <TextLink
              href={`/dashboard/leagues/${leagueSlug}/teams/${homeTeamSlug}`}
            >
              {homeTeamName}
            </TextLink>
          </p>
        </div>
        <div>
          <Eyebrow>Equipo visitante</Eyebrow>
          <p className="mt-1 text-sm text-gray-900">
            <TextLink
              href={`/dashboard/leagues/${leagueSlug}/teams/${awayTeamSlug}`}
            >
              {awayTeamName}
            </TextLink>
          </p>
        </div>
        <div>
          <Eyebrow>Fecha y hora</Eyebrow>
          <p className="mt-1 text-sm text-gray-900">{formatDateTime(scheduledAt)}</p>
        </div>
        <div>
          <Eyebrow>Sede</Eyebrow>
          <p className="mt-1 text-sm text-gray-900">
            {venueId && venueName ? (
              <TextLink
                href={`/dashboard/leagues/${leagueSlug}/venues/${venueId}`}
              >
                {venueName}
              </TextLink>
            ) : (
              "No definida"
            )}
          </p>
        </div>
        <div>
          <Eyebrow>Marcador</Eyebrow>
          <p className="mt-1 text-sm text-gray-900">
            {status === "scheduled" || status === "postponed" || status === "cancelled"
              ? "Por definir"
              : `${homeScore} - ${awayScore}`}
          </p>
        </div>
        <div>
          <Eyebrow>Fecha de creación</Eyebrow>
          <p className="mt-1 text-sm text-gray-900">{formatDateTime(createdAt)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
