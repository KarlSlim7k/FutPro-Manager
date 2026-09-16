import { Eyebrow } from "@/components/ui/eyebrow";
import { TextLink } from "@/components/ui/text-link";
import { StandingMobileCard } from "@/components/standings/standing-mobile-card";

import type { StandingRowViewModel } from "@/components/standings/types";

interface StandingsTableViewProps {
  rows: StandingRowViewModel[];
  leagueSlug: string;
  basePath?: string;
  enableTeamLinks?: boolean;
  theme?: "light" | "dark";
}

export function StandingsTableView({
  rows,
  leagueSlug,
  basePath = "/dashboard/leagues",
  enableTeamLinks = true,
  theme,
}: StandingsTableViewProps) {
  const isDark = theme === "dark" || (theme === undefined && basePath.startsWith("/liga"));

  return (
    <>
      {/* Vista Mobile Cards (< md) */}
      <div className="space-y-3 md:hidden">
        {rows.map((row, index) => (
          <StandingMobileCard
            key={`${row.team_id}-${index}`}
            row={row}
            position={index + 1}
            leagueSlug={leagueSlug}
            basePath={basePath}
            enableTeamLinks={enableTeamLinks}
            theme={theme}
          />
        ))}
      </div>

      {/* Vista Desktop / Tablet (md+) */}
      <div className={`hidden overflow-x-auto rounded-xl border md:block ${
        isDark ? "border-white/10 bg-slate-900/40" : "border-gray-200"
      }`}>
      <table className={`min-w-full divide-y text-sm ${
        isDark ? "divide-white/10 bg-transparent text-gray-200" : "divide-gray-200 bg-white"
      }`}>
        <thead className={isDark ? "bg-white/5 text-gray-400" : "bg-gray-50 text-gray-500"}>
          <tr className="text-left">
            <th scope="col" className="px-4 py-3">
              <Eyebrow as="span" className={isDark ? "text-gray-400" : undefined}>#</Eyebrow>
            </th>
            <th scope="col" className="px-4 py-3">
              <Eyebrow as="span" className={isDark ? "text-gray-400" : undefined}>Equipo</Eyebrow>
            </th>
            <th scope="col" className="px-4 py-3 text-center" title="Partidos jugados">
              <Eyebrow as="span" className={isDark ? "text-gray-400" : undefined}>PJ</Eyebrow>
            </th>
            <th scope="col" className="px-4 py-3 text-center" title="Ganados">
              <Eyebrow as="span" className={isDark ? "text-gray-400" : undefined}>G</Eyebrow>
            </th>
            <th scope="col" className="px-4 py-3 text-center" title="Empatados">
              <Eyebrow as="span" className={isDark ? "text-gray-400" : undefined}>E</Eyebrow>
            </th>
            <th scope="col" className="px-4 py-3 text-center" title="Perdidos">
              <Eyebrow as="span" className={isDark ? "text-gray-400" : undefined}>P</Eyebrow>
            </th>
            <th scope="col" className="px-4 py-3 text-center" title="Goles a favor">
              <Eyebrow as="span" className={isDark ? "text-gray-400" : undefined}>GF</Eyebrow>
            </th>
            <th scope="col" className="px-4 py-3 text-center" title="Goles en contra">
              <Eyebrow as="span" className={isDark ? "text-gray-400" : undefined}>GC</Eyebrow>
            </th>
            <th scope="col" className="px-4 py-3 text-center" title="Diferencia de goles">
              <Eyebrow as="span" className={isDark ? "text-gray-400" : undefined}>DG</Eyebrow>
            </th>
            <th scope="col" className="px-4 py-3 text-center" title="Puntos">
              <Eyebrow as="span" className={`font-bold ${isDark ? "text-emerald-400" : "text-gray-900"}`}>PTS</Eyebrow>
            </th>
            <th scope="col" className="px-4 py-3 text-center" title="Forma en los últimos partidos (V=Victoria, E=Empate, D=Derrota)">
              <Eyebrow as="span" className={isDark ? "text-gray-400" : undefined}>Forma</Eyebrow>
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y ${isDark ? "divide-white/5 text-gray-300" : "divide-gray-100 text-gray-700"}`}>
          {rows.map((row, index) => {
            const teamName = row.team?.name ?? "Equipo desconocido";
            const teamSlug = row.team?.slug ?? null;
            const logoUrl = row.team?.logo_url ?? null;

            return (
              <tr key={`${row.team_id}-${index}`} className={`transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                <td className={`px-4 py-3 font-semibold ${isDark ? "text-emerald-400" : "text-emerald-800"}`}>{index + 1}</td>
                <td className={`px-4 py-3 font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                  <div className="flex items-center gap-2.5">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoUrl}
                        alt=""
                        className={`h-6 w-6 rounded border object-contain shrink-0 ${isDark ? "border-white/10" : "border-gray-200"}`}
                      />
                    ) : null}
                    {teamSlug && enableTeamLinks ? (
                      <TextLink
                        href={`${basePath}/${leagueSlug}/teams/${teamSlug}`}
                        className={isDark ? "text-white hover:text-emerald-400 font-medium" : undefined}
                      >
                        {teamName}
                      </TextLink>
                    ) : (
                      <span>{teamName}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">{row.played}</td>
                <td className="px-4 py-3 text-center">{row.won}</td>
                <td className="px-4 py-3 text-center">{row.drawn}</td>
                <td className="px-4 py-3 text-center">{row.lost}</td>
                <td className="px-4 py-3 text-center">{row.goals_for}</td>
                <td className="px-4 py-3 text-center">{row.goals_against}</td>
                <td className="px-4 py-3 text-center">{row.goal_difference}</td>
                <td className={`px-4 py-3 text-center font-bold ${isDark ? "text-emerald-300" : "text-gray-900"}`}>{row.points}</td>
                <td className="px-4 py-3 text-center">
                  {row.form && row.form.length > 0 ? (
                    <div className="flex items-center justify-center gap-1">
                      {row.form.map((res, i) => (
                        <span
                          key={i}
                          className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-xs ${
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
                  ) : (
                    <span className="text-gray-500 text-xs">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </>
  );
}
