import { MatchStatusBadge } from "@/components/matches/match-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextLink } from "@/components/ui/text-link";
import type { MatchStatus } from "@/types/database";

type PublicMatchCardProps = {
  homeTeamName: string;
  awayTeamName: string;
  venueName: string | null;
  scheduledAt: string;
  status: MatchStatus;
  homeScore: number;
  awayScore: number;
  roundName: string | null;
  detailHref?: string;
};

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(date));
}

export function PublicMatchCard({
  homeTeamName,
  awayTeamName,
  venueName,
  scheduledAt,
  status,
  homeScore,
  awayScore,
  roundName,
  detailHref,
}: PublicMatchCardProps) {
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
          <span className="font-medium text-gray-900">Marcador:</span>{" "}
          {status === "completed" ? `${homeScore} - ${awayScore}` : "Pendiente"}
        </p>
        {detailHref ? (
          <div className="pt-1">
            <TextLink href={detailHref}>Ver detalle</TextLink>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
