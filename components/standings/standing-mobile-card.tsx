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
  const logoUrl = row.team?.logo_url ?? null;

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 font-bold text-xs text-emerald-800">
              #{position}
            </span>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt=""
                className="h-8 w-8 rounded border border-gray-200 object-contain shrink-0"
              />
            ) : null}
            <div className="min-w-0 space-y-0.5">
              <p className="break-words text-sm font-semibold text-gray-900">
                {teamSlug && enableTeamLinks ? (
                  <TextLink href={`${basePath}/${leagueSlug}/teams/${teamSlug}`}>{teamName}</TextLink>
                ) : (
                  teamName
                )}
              </p>
              {row.form && row.form.length > 0 ? (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-500 mr-0.5">Racha:</span>
                  {row.form.map((res, i) => (
                    <span
                      key={i}
                      className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold text-white ${
                        res === "W"
                          ? "bg-emerald-600"
                          : res === "D"
                          ? "bg-amber-500"
                          : "bg-red-600"
                      }`}
                      title={res === "W" ? "Victoria" : res === "D" ? "Empate" : "Derrota"}
                    >
                      {res === "W" ? "V" : res === "D" ? "E" : "D"}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <div className="rounded-lg bg-emerald-50 px-3 py-1.5 text-right shrink-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-700">PTS</p>
            <p className="text-base font-bold text-emerald-800">{row.points}</p>
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
