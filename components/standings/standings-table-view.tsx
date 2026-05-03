import { Eyebrow } from "@/components/ui/eyebrow";
import { TextLink } from "@/components/ui/text-link";

import type { StandingRowViewModel } from "@/components/standings/types";

interface StandingsTableViewProps {
  rows: StandingRowViewModel[];
  leagueSlug: string;
}

export function StandingsTableView({ rows, leagueSlug }: StandingsTableViewProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left text-gray-500">
            <th className="px-4 py-3">
              <Eyebrow as="span">#</Eyebrow>
            </th>
            <th className="px-4 py-3">
              <Eyebrow as="span">Equipo</Eyebrow>
            </th>
            <th className="px-4 py-3 text-center">
              <Eyebrow as="span">PJ</Eyebrow>
            </th>
            <th className="px-4 py-3 text-center">
              <Eyebrow as="span">G</Eyebrow>
            </th>
            <th className="px-4 py-3 text-center">
              <Eyebrow as="span">E</Eyebrow>
            </th>
            <th className="px-4 py-3 text-center">
              <Eyebrow as="span">P</Eyebrow>
            </th>
            <th className="px-4 py-3 text-center">
              <Eyebrow as="span">GF</Eyebrow>
            </th>
            <th className="px-4 py-3 text-center">
              <Eyebrow as="span">GC</Eyebrow>
            </th>
            <th className="px-4 py-3 text-center">
              <Eyebrow as="span">DG</Eyebrow>
            </th>
            <th className="px-4 py-3 text-center">
              <Eyebrow as="span" className="font-bold text-gray-900">PTS</Eyebrow>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-700">
          {rows.map((row, index) => {
            const teamName = row.team?.name ?? "Equipo desconocido";
            const teamSlug = row.team?.slug ?? null;

            return (
              <tr key={`${row.team_id}-${index}`} className="transition hover:bg-gray-50">
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {teamSlug ? (
                    <TextLink href={`/dashboard/leagues/${leagueSlug}/teams/${teamSlug}`}>
                      {teamName}
                    </TextLink>
                  ) : (
                    teamName
                  )}
                </td>
                <td className="px-4 py-3 text-center">{row.played}</td>
                <td className="px-4 py-3 text-center">{row.won}</td>
                <td className="px-4 py-3 text-center">{row.drawn}</td>
                <td className="px-4 py-3 text-center">{row.lost}</td>
                <td className="px-4 py-3 text-center">{row.goals_for}</td>
                <td className="px-4 py-3 text-center">{row.goals_against}</td>
                <td className="px-4 py-3 text-center">{row.goal_difference}</td>
                <td className="px-4 py-3 text-center font-bold text-gray-900">{row.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
