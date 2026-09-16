import { MatchStatusBadge } from "@/components/matches/match-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextLink } from "@/components/ui/text-link";
import { ArrowRight } from "lucide-react";
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
  homeTeamLogo?: string | null;
  awayTeamLogo?: string | null;
};

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
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
  homeTeamLogo,
  awayTeamLogo,
}: PublicMatchCardProps) {
  return (
    <Card className="transition hover:shadow-sm">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {roundName || "Jornada"}
          </span>
          <MatchStatusBadge status={status} />
        </div>

        {/* Enfrentamiento con logos */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 pt-1">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {homeTeamLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={homeTeamLogo}
                alt=""
                className="h-7 w-7 sm:h-8 sm:w-8 rounded border border-gray-200 object-contain shrink-0"
              />
            ) : null}
            <CardTitle className="text-xs sm:text-sm font-semibold truncate text-gray-900">
              {homeTeamName}
            </CardTitle>
          </div>

          <div className="shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-center min-w-[50px] sm:min-w-[58px]">
            {status === "completed" || status === "in_progress" ? (
              <span className="text-sm sm:text-base font-bold tracking-tight text-gray-900">
                {homeScore} – {awayScore}
              </span>
            ) : (
              <span className="text-xs font-semibold text-gray-400">vs</span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 flex-1 min-w-0 text-right">
            <CardTitle className="text-xs sm:text-sm font-semibold truncate text-gray-900">
              {awayTeamName}
            </CardTitle>
            {awayTeamLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={awayTeamLogo}
                alt=""
                className="h-7 w-7 sm:h-8 sm:w-8 rounded border border-gray-200 object-contain shrink-0"
              />
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 text-xs sm:text-sm text-gray-600 border-t border-gray-50 pt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate">
            <span className="font-medium text-gray-800">Fecha:</span> {formatDateTime(scheduledAt)}
          </p>
        </div>
        {venueName ? (
          <p className="truncate">
            <span className="font-medium text-gray-800">Sede:</span> {venueName}
          </p>
        ) : null}
        {detailHref ? (
          <div className="pt-2">
            <TextLink href={detailHref} className="inline-flex min-h-[44px] items-center gap-1.5 touch-manipulation">
              Ver detalle del partido <ArrowRight className="h-4 w-4" aria-hidden />
            </TextLink>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
