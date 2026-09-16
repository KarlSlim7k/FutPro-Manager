import { MatchStatusBadge } from "@/components/matches/match-status-badge";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
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
  className?: string;
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
  className,
}: PublicMatchCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-slate-900/70 p-4 sm:p-5 backdrop-blur-md shadow-xl text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/30",
        className
      )}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            {roundName || "Jornada"}
          </span>
          <MatchStatusBadge status={status} />
        </div>

        {/* Enfrentamiento con logos */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 pt-1">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {homeTeamLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={homeTeamLogo}
                alt=""
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg border border-white/10 object-contain shrink-0 bg-white/5 p-0.5"
              />
            ) : null}
            <span className="text-xs sm:text-sm font-bold truncate text-white">
              {homeTeamName}
            </span>
          </div>

          <div className="shrink-0 rounded-xl border border-white/15 bg-black/50 px-3 py-1 text-center min-w-[54px] sm:min-w-[62px]">
            {status === "completed" || status === "in_progress" ? (
              <span className="text-sm sm:text-base font-mono font-bold tracking-tight text-emerald-400">
                {homeScore} – {awayScore}
              </span>
            ) : (
              <span className="text-xs font-mono font-semibold text-gray-400">vs</span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 flex-1 min-w-0 text-right">
            <span className="text-xs sm:text-sm font-bold truncate text-white">
              {awayTeamName}
            </span>
            {awayTeamLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={awayTeamLogo}
                alt=""
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg border border-white/10 object-contain shrink-0 bg-white/5 p-0.5"
              />
            ) : null}
          </div>
        </div>

        <div className="border-t border-white/10 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300">
          <p className="truncate">
            <span className="text-gray-400 font-medium">Fecha:</span> {formatDateTime(scheduledAt)}
            {venueName ? ` · Sede: ${venueName}` : ""}
          </p>

          {detailHref ? (
            <Link
              href={detailHref}
              className="inline-flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
            >
              <span>Ver cédula</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
