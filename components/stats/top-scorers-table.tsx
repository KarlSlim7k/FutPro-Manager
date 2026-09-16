import Image from "next/image";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TextLink } from "@/components/ui/text-link";
import { EmptyState } from "@/components/ui/empty-state";
import type { TopScorerItem } from "@/lib/stats/get-season-stats";

interface TopScorersTableProps {
  scorers: TopScorerItem[];
  leagueSlug: string;
  basePath?: string;
  theme?: "light" | "dark";
}

export function TopScorersTable({
  scorers,
  leagueSlug,
  basePath = "/liga",
  theme,
}: TopScorersTableProps) {
  const isDark = theme === "dark" || (theme === undefined && basePath.startsWith("/liga"));

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
            className={`flex items-center justify-between rounded-xl border p-3 shadow-sm ${
              isDark ? "border-white/10 bg-white/5 text-white" : "border-gray-200 bg-white shadow-xs"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                index === 0
                  ? isDark ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-800"
                  : index === 1
                  ? isDark ? "bg-slate-700/50 text-slate-200" : "bg-slate-100 text-slate-700"
                  : index === 2
                  ? isDark ? "bg-orange-500/20 text-orange-300" : "bg-orange-100 text-orange-800"
                  : isDark ? "bg-white/10 text-gray-400" : "bg-gray-50 text-gray-600"
              }`}>
                {index + 1}
              </span>
              <div className={`relative h-9 w-9 overflow-hidden rounded-full border shrink-0 ${
                isDark ? "bg-slate-800 border-white/10" : "bg-gray-100 border-gray-200"
              }`}>
                {scorer.playerPhoto ? (
                  <Image
                    src={scorer.playerPhoto}
                    alt={scorer.playerName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className={`flex h-full w-full items-center justify-center text-xs font-semibold ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}>
                    {scorer.playerName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <TextLink
                  href={`${basePath}/${leagueSlug}/players/${scorer.playerId}`}
                  className={`truncate font-medium block ${isDark ? "text-white hover:text-emerald-400" : "text-gray-900"}`}
                >
                  {scorer.playerName}
                </TextLink>
                <div className={`flex items-center gap-1.5 text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {scorer.teamSlug ? (
                    <TextLink
                      href={`${basePath}/${leagueSlug}/teams/${scorer.teamSlug}`}
                      className={isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"}
                    >
                      {scorer.teamName}
                    </TextLink>
                  ) : (
                    <span>{scorer.teamName}</span>
                  )}
                  {scorer.penaltyGoals > 0 && (
                    <span className={isDark ? "text-gray-500" : "text-gray-400"}>({scorer.penaltyGoals} pen.)</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right pl-2">
              <span className={`text-lg font-black ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                {scorer.totalGoals}
              </span>
              <span className={`block text-[10px] uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-400"}`}>
                Goles
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Vista Desktop Table */}
      <div className={`hidden overflow-x-auto rounded-xl border md:block ${
        isDark ? "border-white/10 bg-slate-900/40" : "border-gray-200"
      }`}>
        <table className={`min-w-full divide-y text-sm ${
          isDark ? "divide-white/10 bg-transparent text-gray-200" : "divide-gray-200 bg-white"
        }`}>
          <thead className={isDark ? "bg-white/5 text-gray-400" : "bg-gray-50 text-gray-500"}>
            <tr className="text-left">
              <th scope="col" className="px-4 py-3 w-12 text-center">
                <Eyebrow as="span" className={isDark ? "text-gray-400" : undefined}>#</Eyebrow>
              </th>
              <th scope="col" className="px-4 py-3">
                <Eyebrow as="span" className={isDark ? "text-gray-400" : undefined}>Jugador</Eyebrow>
              </th>
              <th scope="col" className="px-4 py-3">
                <Eyebrow as="span" className={isDark ? "text-gray-400" : undefined}>Equipo</Eyebrow>
              </th>
              <th scope="col" className="px-4 py-3 text-center" title="Goles de jugada">
                <Eyebrow as="span" className={isDark ? "text-gray-400" : undefined}>Jugada</Eyebrow>
              </th>
              <th scope="col" className="px-4 py-3 text-center" title="Goles de penal">
                <Eyebrow as="span" className={isDark ? "text-gray-400" : undefined}>Penal</Eyebrow>
              </th>
              <th scope="col" className="px-4 py-3 text-center" title="Total de goles">
                <Eyebrow as="span" className={`font-bold ${isDark ? "text-emerald-400" : "text-gray-900"}`}>Total Goles</Eyebrow>
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? "divide-white/5 text-gray-300" : "divide-gray-100 text-gray-700"}`}>
            {scorers.map((scorer, index) => (
              <tr key={scorer.playerId} className={`transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                <td className="px-4 py-3 text-center font-medium">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    index === 0
                      ? isDark ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-800"
                      : index === 1
                      ? isDark ? "bg-slate-700/50 text-slate-200" : "bg-slate-100 text-slate-700"
                      : index === 2
                      ? isDark ? "bg-orange-500/20 text-orange-300" : "bg-orange-100 text-orange-800"
                      : isDark ? "text-gray-400" : "text-gray-500"
                  }`}>
                    {index + 1}
                  </span>
                </td>
                <td className={`px-4 py-3 font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`relative h-8 w-8 overflow-hidden rounded-full border shrink-0 ${
                      isDark ? "bg-slate-800 border-white/10" : "bg-gray-100 border-gray-200"
                    }`}>
                      {scorer.playerPhoto ? (
                        <Image
                          src={scorer.playerPhoto}
                          alt={scorer.playerName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className={`flex h-full w-full items-center justify-center text-xs font-semibold ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}>
                          {scorer.playerName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <TextLink
                      href={`${basePath}/${leagueSlug}/players/${scorer.playerId}`}
                      className={isDark ? "text-white hover:text-emerald-400 font-medium" : undefined}
                    >
                      {scorer.playerName}
                    </TextLink>
                  </div>
                </td>
                <td className={`px-4 py-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  {scorer.teamSlug ? (
                    <TextLink
                      href={`${basePath}/${leagueSlug}/teams/${scorer.teamSlug}`}
                      className={isDark ? "text-gray-300 hover:text-emerald-400" : undefined}
                    >
                      {scorer.teamName}
                    </TextLink>
                  ) : (
                    scorer.teamName
                  )}
                </td>
                <td className={`px-4 py-3 text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>{scorer.goals}</td>
                <td className={`px-4 py-3 text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>{scorer.penaltyGoals}</td>
                <td className={`px-4 py-3 text-center font-extrabold text-base ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
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
