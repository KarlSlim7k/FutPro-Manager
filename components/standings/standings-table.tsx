import Link from "next/link";
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
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-3 py-3">Pos</th>
            <th className="px-3 py-3">Equipo</th>
            <th className="px-3 py-3 text-center">PJ</th>
            <th className="px-3 py-3 text-center">G</th>
            <th className="px-3 py-3 text-center">E</th>
            <th className="px-3 py-3 text-center">P</th>
            <th className="px-3 py-3 text-center">GF</th>
            <th className="px-3 py-3 text-center">GC</th>
            <th className="px-3 py-3 text-center">DIF</th>
            <th className="px-3 py-3 text-center font-bold text-gray-900">PTS</th>
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
                    <Link
                      href={`/dashboard/leagues/${leagueSlug}/teams/${team.slug}`}
                      className="text-emerald-700 hover:text-emerald-600"
                    >
                      {team.name}
                    </Link>
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