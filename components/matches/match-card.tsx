import { MatchStatusBadge } from "@/components/matches/match-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextLink } from "@/components/ui/text-link";
import { ToolbarActions } from "@/components/ui/toolbar-actions";
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
  canEdit?: boolean;
  canUpdateResult?: boolean;
  canManageEvents?: boolean;
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
  canEdit = true,
  canUpdateResult = true,
  canManageEvents = true,
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

        <ToolbarActions className="pt-1">
          <TextLink href={`/dashboard/leagues/${leagueSlug}/matches/${matchId}`}>
            Ver detalle
          </TextLink>
          {canEdit ? (
            <TextLink href={`/dashboard/leagues/${leagueSlug}/matches/${matchId}/edit`}>Editar</TextLink>
          ) : null}
          {status === "cancelled" ? (
            canUpdateResult ? (
              <span className="inline-flex items-center text-sm font-medium text-gray-500">
                Resultado no disponible
              </span>
            ) : null
          ) : canUpdateResult ? (
            <TextLink href={`/dashboard/leagues/${leagueSlug}/matches/${matchId}/result`}>Resultado</TextLink>
          ) : null}
          {status === "cancelled" ? (
            canManageEvents ? (
              <span className="inline-flex items-center text-sm font-medium text-gray-500">
                Eventos no disponibles
              </span>
            ) : null
          ) : canManageEvents ? (
            <TextLink href={`/dashboard/leagues/${leagueSlug}/matches/${matchId}/events`}>Eventos</TextLink>
          ) : null}
        </ToolbarActions>
      </CardContent>
    </Card>
  );
}
