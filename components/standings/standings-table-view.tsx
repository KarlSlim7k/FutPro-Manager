import { Eyebrow } from "@/components/ui/eyebrow";
import { TextLink } from "@/components/ui/text-link";

import type { StandingRowViewModel } from "@/components/standings/types";

interface StandingsTableViewProps {
  rows: StandingRowViewModel[];
  leagueSlug: string;
  basePath?: string;
  enableTeamLinks?: boolean;
}

export function StandingsTableView({ rows, leagueSlug, basePath = "/dashboard/leagues", enableTeamLinks = true }: StandingsTableViewProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left text-gray-500">
            <th scope="col" className="px-4 py-3">
              <Eyebrow as="span">#</Eyebrow>
            </th>
            <th scope="col" className="px-4 py-3">
              <Eyebrow as="span">Equipo</Eyebrow>
            </th>
            <th scope="col" className="px-4 py-3 text-center" title="Partidos jugados">
              <Eyebrow as="span">PJ</Eyebrow>
            </th>
            <th scope="col" className="px-4 py-3 text-center" title="Ganados">
              <Eyebrow as="span">G</Eyebrow>
            </th>
            <th scope="col" className="px-4 py-3 text-center" title="Empatados">
              <Eyebrow as="span">E</Eyebrow>
            </th>
            <th scope="col" className="px-4 py-3 text-center" title="Perdidos">
              <Eyebrow as="span">P</Eyebrow>
            </th>
            <th scope="col" className="px-4 py-3 text-center" title="Goles a favor">
              <Eyebrow as="span">GF</Eyebrow>
            </th>
            <th scope="col" className="px-4 py-3 text-center" title="Goles en contra">
              <Eyebrow as="span">GC</Eyebrow>
            </th>
            <th scope="col" className="px-4 py-3 text-center" title="Diferencia de goles">
              <Eyebrow as="span">DG</Eyebrow>
            </th>
            <th scope="col" className="px-4 py-3 text-center" title="Puntos">
              <Eyebrow as="span" className="font-bold text-gray-900">PTS</Eyebrow>
            </th>
            <th scope="col" className="px-4 py-3 text-center" title="Forma en los últimos partidos (V=Victoria, E=Empate, D=Derrota)">
              <Eyebrow as="span">Forma</Eyebrow>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-700">
          {rows.map((row, index) => {
            const teamName = row.team?.name ?? "Equipo desconocido";
            const teamSlug = row.team?.slug ?? null;
            const logoUrl = row.team?.logo_url ?? null;

            return (
              <tr key={`${row.team_id}-${index}`} className="transition hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-emerald-800">{index + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  <div className="flex items-center gap-2.5">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoUrl}
                        alt=""
                        className="h-6 w-6 rounded border border-gray-200 object-contain shrink-0"
                      />
                    ) : null}
                    {teamSlug && enableTeamLinks ? (
                      <TextLink href={`${basePath}/${leagueSlug}/teams/${teamSlug}`}>
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
                <td className="px-4 py-3 text-center font-bold text-gray-900">{row.points}</td>
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
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
