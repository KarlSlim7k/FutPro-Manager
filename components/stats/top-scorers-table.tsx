import Image from "next/image";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TextLink } from "@/components/ui/text-link";
import { EmptyState } from "@/components/ui/empty-state";
import type { TopScorerItem } from "@/lib/stats/get-season-stats";

interface TopScorersTableProps {
  scorers: TopScorerItem[];
  leagueSlug: string;
  basePath?: string;
}

export function TopScorersTable({
  scorers,
  leagueSlug,
  basePath = "/liga",
}: TopScorersTableProps) {
  if (scorers.length === 0) {
    return (
      <EmptyState
        title="Sin goles registrados"
        description="Aún no se han registrado goles en los partidos de esta temporada."
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Vista Mobile Cards */}
      <div className="space-y-2 md:hidden">
        {scorers.map((scorer, index) => (
          <div
            key={scorer.playerId}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                index === 0
                  ? "bg-amber-100 text-amber-800"
                  : index === 1
                  ? "bg-slate-100 text-slate-700"
                  : index === 2
                  ? "bg-orange-100 text-orange-800"
                  : "bg-gray-50 text-gray-600"
              }`}>
                {index + 1}
              </span>
              <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gray-100 border border-gray-200 shrink-0">
                {scorer.playerPhoto ? (
                  <Image
                    src={scorer.playerPhoto}
                    alt={scorer.playerName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-500">
                    {scorer.playerName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <TextLink
                  href={`${basePath}/${leagueSlug}/players/${scorer.playerId}`}
                  className="truncate font-medium text-gray-900 block"
                >
                  {scorer.playerName}
                </TextLink>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
                  {scorer.teamSlug ? (
                    <TextLink
                      href={`${basePath}/${leagueSlug}/teams/${scorer.teamSlug}`}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {scorer.teamName}
                    </TextLink>
                  ) : (
                    <span>{scorer.teamName}</span>
                  )}
                  {scorer.penaltyGoals > 0 && (
                    <span className="text-gray-400">({scorer.penaltyGoals} pen.)</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right pl-2">
              <span className="text-lg font-black text-emerald-600">
                {scorer.totalGoals}
              </span>
              <span className="block text-[10px] text-gray-400 uppercase tracking-wider">
                Goles
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Vista Desktop Table */}
      <div className="hidden overflow-x-auto rounded-lg border border-gray-200 md:block">
        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th scope="col" className="px-4 py-3 w-12 text-center">
                <Eyebrow as="span">#</Eyebrow>
              </th>
              <th scope="col" className="px-4 py-3">
                <Eyebrow as="span">Jugador</Eyebrow>
              </th>
              <th scope="col" className="px-4 py-3">
                <Eyebrow as="span">Equipo</Eyebrow>
              </th>
              <th scope="col" className="px-4 py-3 text-center" title="Goles de jugada">
                <Eyebrow as="span">Jugada</Eyebrow>
              </th>
              <th scope="col" className="px-4 py-3 text-center" title="Goles de penal">
                <Eyebrow as="span">Penal</Eyebrow>
              </th>
              <th scope="col" className="px-4 py-3 text-center" title="Total de goles">
                <Eyebrow as="span" className="font-bold text-gray-900">Total Goles</Eyebrow>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {scorers.map((scorer, index) => (
              <tr key={scorer.playerId} className="transition hover:bg-gray-50">
                <td className="px-4 py-3 text-center font-medium text-gray-500">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    index === 0
                      ? "bg-amber-100 text-amber-800"
                      : index === 1
                      ? "bg-slate-100 text-slate-700"
                      : index === 2
                      ? "bg-orange-100 text-orange-800"
                      : ""
                  }`}>
                    {index + 1}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-100 border border-gray-200 shrink-0">
                      {scorer.playerPhoto ? (
                        <Image
                          src={scorer.playerPhoto}
                          alt={scorer.playerName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-500">
                          {scorer.playerName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <TextLink href={`${basePath}/${leagueSlug}/players/${scorer.playerId}`}>
                      {scorer.playerName}
                    </TextLink>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {scorer.teamSlug ? (
                    <TextLink href={`${basePath}/${leagueSlug}/teams/${scorer.teamSlug}`}>
                      {scorer.teamName}
                    </TextLink>
                  ) : (
                    scorer.teamName
                  )}
                </td>
                <td className="px-4 py-3 text-center text-gray-500">{scorer.goals}</td>
                <td className="px-4 py-3 text-center text-gray-500">{scorer.penaltyGoals}</td>
                <td className="px-4 py-3 text-center font-extrabold text-emerald-600 text-base">
                  {scorer.totalGoals}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
