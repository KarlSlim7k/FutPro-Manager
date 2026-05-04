import { Card, CardContent } from "@/components/ui/card";
import { TextLink } from "@/components/ui/text-link";

import type { StandingRowViewModel } from "@/components/standings/types";

interface StandingMobileCardProps {
  row: StandingRowViewModel;
  position: number;
  leagueSlug: string;
  basePath?: string;
  enableTeamLinks?: boolean;
}

export function StandingMobileCard({
  row,
  position,
  leagueSlug,
  basePath = "/dashboard/leagues",
  enableTeamLinks = true,
}: StandingMobileCardProps) {
  const teamName = row.team?.name ?? "Equipo desconocido";
  const teamSlug = row.team?.slug ?? null;

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">#{position}</p>
            <p className="break-words text-sm font-semibold text-gray-900">
              {teamSlug && enableTeamLinks ? (
                <TextLink href={`${basePath}/${leagueSlug}/teams/${teamSlug}`}>{teamName}</TextLink>
              ) : (
                teamName
              )}
            </p>
          </div>
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-right">
            <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-700">PTS</p>
            <p className="text-lg font-bold text-emerald-800">{row.points}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-xs text-gray-600">
          <p>PJ: {row.played}</p>
          <p>G: {row.won}</p>
          <p>E: {row.drawn}</p>
          <p>P: {row.lost}</p>
          <p>GF: {row.goals_for}</p>
          <p>GC: {row.goals_against}</p>
          <p>DG: {row.goal_difference}</p>
        </div>
      </CardContent>
    </Card>
  );
}
