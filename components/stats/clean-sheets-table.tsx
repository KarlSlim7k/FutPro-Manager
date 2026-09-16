import Image from "next/image";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TextLink } from "@/components/ui/text-link";
import { EmptyState } from "@/components/ui/empty-state";
import { ShieldCheck } from "lucide-react";
import type { CleanSheetItem } from "@/lib/stats/get-season-stats";

interface CleanSheetsTableProps {
  cleanSheets: CleanSheetItem[];
  leagueSlug: string;
  basePath?: string;
  theme?: "light" | "dark";
}

export function CleanSheetsTable({
  cleanSheets,
  leagueSlug,
  basePath = "/liga",
  theme,
}: CleanSheetsTableProps) {
  const isDark = theme === "dark" || (theme === undefined && basePath.startsWith("/liga"));

  if (cleanSheets.length === 0) {
    return (
      <EmptyState
        title="Sin partidos finalizados"
        description="Aún no hay partidos terminados en esta temporada para calcular las vallas invictas."
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Vista Mobile Cards */}
      <div className="space-y-2 md:hidden">
        {cleanSheets.map((item, index) => (
          <div
            key={item.teamId}
            className={`flex items-center justify-between rounded-xl border p-3 shadow-sm ${
              isDark ? "border-white/10 bg-white/5 text-white" : "border-gray-200 bg-white shadow-xs"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  index === 0
                    ? isDark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-800"
                    : index === 1
                    ? isDark ? "bg-slate-700/50 text-slate-200" : "bg-slate-100 text-slate-700"
                    : index === 2
                    ? isDark ? "bg-teal-500/20 text-teal-300" : "bg-teal-100 text-teal-800"
                    : isDark ? "bg-white/10 text-gray-400" : "bg-gray-50 text-gray-600"
                }`}
              >
                {index + 1}
              </span>
              <div className={`relative h-9 w-9 overflow-hidden rounded-full border shrink-0 ${
                isDark ? "bg-slate-800 border-white/10" : "bg-gray-100 border-gray-200"
              }`}>
                {item.teamLogo ? (
                  <Image
                    src={item.teamLogo}
                    alt={item.teamName}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className={`flex h-full w-full items-center justify-center text-xs font-semibold ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}>
                    {item.teamName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                {item.teamSlug ? (
                  <TextLink
                    href={`${basePath}/${leagueSlug}/teams/${item.teamSlug}`}
                    className={`truncate font-medium block ${isDark ? "text-white hover:text-emerald-400" : "text-gray-900"}`}
                  >
                    {item.teamName}
                  </TextLink>
                ) : (
                  <span className={`truncate font-medium block ${isDark ? "text-white" : "text-gray-900"}`}>
                    {item.teamName}
                  </span>
                )}
                <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {item.cleanSheets} de {item.matchesPlayed} PJ ({item.cleanSheetPercentage}%)
                </div>
              </div>
            </div>
            <div className="text-right pl-2">
              <span className={`inline-flex items-center gap-1 text-lg font-black ${
                isDark ? "text-emerald-400" : "text-emerald-700"
              }`}>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                {item.cleanSheets}
              </span>
              <span className={`block text-[10px] uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-400"}`}>
                A Cero
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
                <Eyebrow as="span" className={isDark ? "text-gray-400" : undefined}>Equipo</Eyebrow>
              </th>
              <th scope="col" className="px-4 py-3 text-center" title="Partidos Jugados">
                <Eyebrow as="span" className={isDark ? "text-gray-400" : undefined}>Partidos Jugados</Eyebrow>
              </th>
              <th scope="col" className="px-4 py-3 text-center" title="Partidos con portería imbatida">
                <Eyebrow as="span" className={`font-bold ${isDark ? "text-emerald-400" : "text-gray-900"}`}>
                  Vallas Invictas
                </Eyebrow>
              </th>
              <th scope="col" className="px-4 py-3 text-center" title="Efectividad en vallas invictas">
                <Eyebrow as="span" className={isDark ? "text-gray-400" : undefined}>Efectividad %</Eyebrow>
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? "divide-white/5 text-gray-300" : "divide-gray-100 text-gray-700"}`}>
            {cleanSheets.map((item, index) => (
              <tr key={item.teamId} className={`transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                <td className="px-4 py-3 text-center font-medium">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      index === 0
                        ? isDark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-800"
                        : index === 1
                        ? isDark ? "bg-slate-700/50 text-slate-200" : "bg-slate-100 text-slate-700"
                        : index === 2
                        ? isDark ? "bg-teal-500/20 text-teal-300" : "bg-teal-100 text-teal-800"
                        : isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`relative h-7 w-7 overflow-hidden rounded-full border shrink-0 ${
                      isDark ? "bg-slate-800 border-white/10" : "bg-gray-100 border-gray-200"
                    }`}>
                      {item.teamLogo ? (
                        <Image
                          src={item.teamLogo}
                          alt={item.teamName}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className={`flex h-full w-full items-center justify-center text-xs font-semibold ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}>
                          {item.teamName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {item.teamSlug ? (
                      <TextLink
                        href={`${basePath}/${leagueSlug}/teams/${item.teamSlug}`}
                        className={`font-medium ${isDark ? "text-white hover:text-emerald-400" : "text-gray-900"}`}
                      >
                        {item.teamName}
                      </TextLink>
                    ) : (
                      <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{item.teamName}</span>
                    )}
                  </div>
                </td>
                <td className={`px-4 py-3 text-center font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  {item.matchesPlayed}
                </td>
                <td className={`px-4 py-3 text-center font-bold text-base ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                  <div className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>{item.cleanSheets}</span>
                  </div>
                </td>
                <td className={`px-4 py-3 text-center font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {item.cleanSheetPercentage}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
