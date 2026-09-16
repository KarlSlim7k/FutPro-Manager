import { Card, CardContent } from "@/components/ui/card";
import { TextLink } from "@/components/ui/text-link";

import type { StandingRowViewModel } from "@/components/standings/types";

interface StandingMobileCardProps {
  row: StandingRowViewModel;
  position: number;
  leagueSlug: string;
  basePath?: string;
  enableTeamLinks?: boolean;
  theme?: "light" | "dark";
}

export function StandingMobileCard({
  row,
  position,
  leagueSlug,
  basePath = "/dashboard/leagues",
  enableTeamLinks = true,
  theme,
}: StandingMobileCardProps) {
  const isDark = theme === "dark" || (theme === undefined && basePath.startsWith("/liga"));
  const teamName = row.team?.name ?? "Equipo desconocido";
  const teamSlug = row.team?.slug ?? null;
  const logoUrl = row.team?.logo_url ?? null;

  return (
    <Card className={isDark ? "rounded-xl border border-white/10 bg-slate-900/60 p-0 text-white backdrop-blur-md shadow-md" : undefined}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
              isDark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-800"
            }`}>
              #{position}
            </span>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt=""
                className={`h-8 w-8 rounded border object-contain shrink-0 ${isDark ? "border-white/10" : "border-gray-200"}`}
              />
            ) : null}
            <div className="min-w-0 space-y-0.5">
              <p className={`break-words text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                {teamSlug && enableTeamLinks ? (
                  <TextLink
                    href={`${basePath}/${leagueSlug}/teams/${teamSlug}`}
                    className={isDark ? "text-white hover:text-emerald-400" : undefined}
                  >
                    {teamName}
                  </TextLink>
                ) : (
                  teamName
                )}
              </p>
              {row.form && row.form.length > 0 ? (
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] mr-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Racha:</span>
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
          <div className={`rounded-lg px-3 py-1.5 text-right shrink-0 ${isDark ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-emerald-50"}`}>
            <p className={`text-[10px] font-medium uppercase tracking-wide ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>PTS</p>
            <p className={`text-base font-bold ${isDark ? "text-emerald-300" : "text-emerald-800"}`}>{row.points}</p>
          </div>
        </div>

        <div className={`grid grid-cols-4 gap-1.5 rounded-lg p-2.5 text-center text-xs ${isDark ? "bg-white/5 text-gray-300" : "bg-gray-50 text-gray-600"}`}>
          <div>
            <span className={`block text-[10px] uppercase ${isDark ? "text-gray-400" : "text-gray-400"}`}>PJ</span>
            <span className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>{row.played}</span>
          </div>
          <div>
            <span className={`block text-[10px] uppercase ${isDark ? "text-gray-400" : "text-gray-400"}`}>G</span>
            <span className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>{row.won}</span>
          </div>
          <div>
            <span className={`block text-[10px] uppercase ${isDark ? "text-gray-400" : "text-gray-400"}`}>E</span>
            <span className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>{row.drawn}</span>
          </div>
          <div>
            <span className={`block text-[10px] uppercase ${isDark ? "text-gray-400" : "text-gray-400"}`}>P</span>
            <span className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>{row.lost}</span>
          </div>
          <div>
            <span className={`block text-[10px] uppercase ${isDark ? "text-gray-400" : "text-gray-400"}`}>GF</span>
            <span className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>{row.goals_for}</span>
          </div>
          <div>
            <span className={`block text-[10px] uppercase ${isDark ? "text-gray-400" : "text-gray-400"}`}>GC</span>
            <span className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>{row.goals_against}</span>
          </div>
          <div>
            <span className={`block text-[10px] uppercase ${isDark ? "text-gray-400" : "text-gray-400"}`}>DG</span>
            <span className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>{row.goal_difference}</span>
          </div>
          <div className={`rounded font-bold ${isDark ? "bg-emerald-500/30 text-emerald-300" : "bg-emerald-100/60 text-emerald-800"}`}>
            <span className={`block text-[10px] uppercase ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>PTS</span>
            <span className="font-bold">{row.points}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
