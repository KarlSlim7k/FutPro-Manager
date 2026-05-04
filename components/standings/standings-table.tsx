import { Eyebrow } from "@/components/ui/eyebrow";
import { TextLink } from "@/components/ui/text-link";
import type { Standing } from "@/types/database";

type StandingsTableProps = {
  standings: Standing[];
  teamMap: Map<string, { name: string; slug: string }>;
  leagueSlug: string;
};

export function StandingsTable({ standings, teamMap, leagueSlug }: StandingsTableProps) {
  const sorted = [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
    if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
    const aName = teamMap.get(a.team_id)?.name ?? "";
    const bName = teamMap.get(b.team_id)?.name ?? "";
    return aName.localeCompare(bName);
  });

  return (
    <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="px-3 py-3">
                <Eyebrow as="span">Pos</Eyebrow>
              </th>
              <th className="px-3 py-3">
                <Eyebrow as="span">Equipo</Eyebrow>
              </th>
              <th className="px-3 py-3 text-center">
                <Eyebrow as="span">PJ</Eyebrow>
              </th>
              <th className="px-3 py-3 text-center">
                <Eyebrow as="span">G</Eyebrow>
              </th>
              <th className="px-3 py-3 text-center">
                <Eyebrow as="span">E</Eyebrow>
              </th>
              <th className="px-3 py-3 text-center">
                <Eyebrow as="span">P</Eyebrow>
              </th>
              <th className="px-3 py-3 text-center">
                <Eyebrow as="span">GF</Eyebrow>
              </th>
              <th className="px-3 py-3 text-center">
                <Eyebrow as="span">GC</Eyebrow>
              </th>
              <th className="px-3 py-3 text-center">
                <Eyebrow as="span">DIF</Eyebrow>
              </th>
              <th className="px-3 py-3 text-center">
                <Eyebrow as="span" className="font-bold text-gray-900">PTS</Eyebrow>
              </th>
            </tr>
          </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.map((row, index) => {
            const team = teamMap.get(row.team_id);
            return (
              <tr
                key={row.team_id}
                className="transition hover:bg-gray-50"
              >
                <td className="px-3 py-3 text-gray-600">{index + 1}</td>
                <td className="px-3 py-3 font-medium text-gray-900">
                  {team ? (
                    <TextLink
                      href={`/dashboard/leagues/${leagueSlug}/teams/${team.slug}`}
                    >
                      {team.name}
                    </TextLink>
                  ) : (
                    "Equipo desconocido"
                  )}
                </td>
                <td className="px-3 py-3 text-center text-gray-600">{row.played}</td>
                <td className="px-3 py-3 text-center text-gray-600">{row.won}</td>
                <td className="px-3 py-3 text-center text-gray-600">{row.drawn}</td>
                <td className="px-3 py-3 text-center text-gray-600">{row.lost}</td>
                <td className="px-3 py-3 text-center text-gray-600">{row.goals_for}</td>
                <td className="px-3 py-3 text-center text-gray-600">{row.goals_against}</td>
                <td className="px-3 py-3 text-center text-gray-600">{row.goal_difference}</td>
                <td className="px-3 py-3 text-center font-bold text-gray-900">{row.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
