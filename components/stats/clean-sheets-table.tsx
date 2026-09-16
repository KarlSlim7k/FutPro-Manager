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
}

export function CleanSheetsTable({
  cleanSheets,
  leagueSlug,
  basePath = "/liga",
}: CleanSheetsTableProps) {
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
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  index === 0
                    ? "bg-emerald-100 text-emerald-800"
                    : index === 1
                    ? "bg-slate-100 text-slate-700"
                    : index === 2
                    ? "bg-teal-100 text-teal-800"
                    : "bg-gray-50 text-gray-600"
                }`}
              >
                {index + 1}
              </span>
              <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gray-100 border border-gray-200 shrink-0">
                {item.teamLogo ? (
                  <Image
                    src={item.teamLogo}
                    alt={item.teamName}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-500">
                    {item.teamName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                {item.teamSlug ? (
                  <TextLink
                    href={`${basePath}/${leagueSlug}/teams/${item.teamSlug}`}
                    className="truncate font-medium text-gray-900 block"
                  >
                    {item.teamName}
                  </TextLink>
                ) : (
                  <span className="truncate font-medium text-gray-900 block">
                    {item.teamName}
                  </span>
                )}
                <div className="text-xs text-gray-500">
                  {item.cleanSheets} de {item.matchesPlayed} PJ ({item.cleanSheetPercentage}%)
                </div>
              </div>
            </div>
            <div className="text-right pl-2">
              <span className="inline-flex items-center gap-1 text-lg font-black text-emerald-700">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                {item.cleanSheets}
              </span>
              <span className="block text-[10px] text-gray-400 uppercase tracking-wider">
                A Cero
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
                <Eyebrow as="span">Equipo</Eyebrow>
              </th>
              <th scope="col" className="px-4 py-3 text-center" title="Partidos Jugados">
                <Eyebrow as="span">Partidos Jugados</Eyebrow>
              </th>
              <th scope="col" className="px-4 py-3 text-center" title="Partidos con portería imbatida">
                <Eyebrow as="span" className="font-bold text-gray-900">
                  Vallas Invictas
                </Eyebrow>
              </th>
              <th scope="col" className="px-4 py-3 text-center" title="Efectividad en vallas invictas">
                <Eyebrow as="span">Efectividad %</Eyebrow>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {cleanSheets.map((item, index) => (
              <tr key={item.teamId} className="transition hover:bg-gray-50">
                <td className="px-4 py-3 text-center font-medium text-gray-500">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      index === 0
                        ? "bg-emerald-100 text-emerald-800"
                        : index === 1
                        ? "bg-slate-100 text-slate-700"
                        : index === 2
                        ? "bg-teal-100 text-teal-800"
                        : "text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-7 w-7 overflow-hidden rounded-full bg-gray-100 border border-gray-200 shrink-0">
                      {item.teamLogo ? (
                        <Image
                          src={item.teamLogo}
                          alt={item.teamName}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-500">
                          {item.teamName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {item.teamSlug ? (
                      <TextLink
                        href={`${basePath}/${leagueSlug}/teams/${item.teamSlug}`}
                        className="font-medium text-gray-900"
                      >
                        {item.teamName}
                      </TextLink>
                    ) : (
                      <span className="font-medium text-gray-900">{item.teamName}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center font-medium text-gray-600">
                  {item.matchesPlayed}
                </td>
                <td className="px-4 py-3 text-center font-bold text-emerald-700 text-base">
                  <div className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>{item.cleanSheets}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center font-medium text-gray-700">
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
