import Image from "next/image";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TextLink } from "@/components/ui/text-link";
import { EmptyState } from "@/components/ui/empty-state";
import type { TopAssistItem } from "@/lib/stats/get-season-stats";

interface TopAssistsTableProps {
  assists: TopAssistItem[];
  leagueSlug: string;
  basePath?: string;
  theme?: "light" | "dark";
}

export function TopAssistsTable({
  assists,
  leagueSlug,
  basePath = "/liga",
  theme,
}: TopAssistsTableProps) {
  const isDark = theme === "dark" || (theme === undefined && basePath.startsWith("/liga"));

  if (assists.length === 0) {
    return (
      <EmptyState
        title="Sin asistencias registradas"
        description="Aún no se han registrado pases de gol o asistencias en los partidos de esta temporada."
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Vista Mobile Cards */}
      <div className="space-y-2 md:hidden">
        {assists.map((assist, index) => (
          <div
            key={assist.playerId}
            className={`flex items-center justify-between rounded-xl border p-3 shadow-sm ${
              isDark ? "border-white/10 bg-white/5 text-white" : "border-gray-200 bg-white shadow-xs"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  index === 0
                    ? isDark ? "bg-teal-500/20 text-teal-300" : "bg-blue-100 text-blue-800"
                    : index === 1
                    ? isDark ? "bg-slate-700/50 text-slate-200" : "bg-slate-100 text-slate-700"
                    : index === 2
                    ? isDark ? "bg-sky-500/20 text-sky-300" : "bg-sky-100 text-sky-800"
                    : isDark ? "bg-white/10 text-gray-400" : "bg-gray-50 text-gray-600"
                }`}
              >
                {index + 1}
              </span>
              <div className={`relative h-9 w-9 overflow-hidden rounded-full border shrink-0 ${
                isDark ? "bg-slate-800 border-white/10" : "bg-gray-100 border-gray-200"
              }`}>
                {assist.playerPhoto ? (
                  <Image
                    src={assist.playerPhoto}
                    alt={assist.playerName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className={`flex h-full w-full items-center justify-center text-xs font-semibold ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}>
                    {assist.playerName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <TextLink
                  href={`${basePath}/${leagueSlug}/players/${assist.playerId}`}
                  className={`truncate font-medium block ${isDark ? "text-white hover:text-teal-400" : "text-gray-900"}`}
                >
                  {assist.playerName}
                </TextLink>
                <div className={`flex items-center gap-1.5 text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {assist.teamSlug ? (
                    <TextLink
                      href={`${basePath}/${leagueSlug}/teams/${assist.teamSlug}`}
                      className={isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"}
                    >
                      {assist.teamName}
                    </TextLink>
                  ) : (
                    <span>{assist.teamName}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right pl-2">
              <span className={`text-lg font-black ${isDark ? "text-teal-400" : "text-blue-600"}`}>
                {assist.assists}
              </span>
              <span className={`block text-[10px] uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-400"}`}>
                Asistencias
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
              <th scope="col" className="px-4 py-3 text-center" title="Pases de gol">
                <Eyebrow as="span" className={`font-bold ${isDark ? "text-teal-400" : "text-gray-900"}`}>
                  Total Asistencias
                </Eyebrow>
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? "divide-white/5 text-gray-300" : "divide-gray-100 text-gray-700"}`}>
            {assists.map((assist, index) => (
              <tr key={assist.playerId} className={`transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                <td className="px-4 py-3 text-center font-medium">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      index === 0
                        ? isDark ? "bg-teal-500/20 text-teal-300" : "bg-blue-100 text-blue-800"
                        : index === 1
                        ? isDark ? "bg-slate-700/50 text-slate-200" : "bg-slate-100 text-slate-700"
                        : index === 2
                        ? isDark ? "bg-sky-500/20 text-sky-300" : "bg-sky-100 text-sky-800"
                        : isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`relative h-8 w-8 overflow-hidden rounded-full border shrink-0 ${
                      isDark ? "bg-slate-800 border-white/10" : "bg-gray-100 border-gray-200"
                    }`}>
                      {assist.playerPhoto ? (
                        <Image
                          src={assist.playerPhoto}
                          alt={assist.playerName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className={`flex h-full w-full items-center justify-center text-xs font-semibold ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}>
                          {assist.playerName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <TextLink
                      href={`${basePath}/${leagueSlug}/players/${assist.playerId}`}
                      className={`font-medium ${isDark ? "text-white hover:text-teal-400" : "text-gray-900"}`}
                    >
                      {assist.playerName}
                    </TextLink>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {assist.teamLogo ? (
                      <div className="relative h-5 w-5 overflow-hidden rounded-full shrink-0">
                        <Image
                          src={assist.teamLogo}
                          alt={assist.teamName}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : null}
                    {assist.teamSlug ? (
                      <TextLink
                        href={`${basePath}/${leagueSlug}/teams/${assist.teamSlug}`}
                        className={isDark ? "text-gray-300 hover:text-teal-400" : "text-gray-600 hover:text-gray-900"}
                      >
                        {assist.teamName}
                      </TextLink>
                    ) : (
                      <span className={isDark ? "text-gray-300" : "text-gray-600"}>{assist.teamName}</span>
                    )}
                  </div>
                </td>
                <td className={`px-4 py-3 text-center font-bold text-base ${isDark ? "text-teal-400" : "text-blue-700"}`}>
                  {assist.assists}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
