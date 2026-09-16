import Image from "next/image";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TextLink } from "@/components/ui/text-link";
import { EmptyState } from "@/components/ui/empty-state";
import type { TopAssistItem } from "@/lib/stats/get-season-stats";

interface TopAssistsTableProps {
  assists: TopAssistItem[];
  leagueSlug: string;
  basePath?: string;
}

export function TopAssistsTable({
  assists,
  leagueSlug,
  basePath = "/liga",
}: TopAssistsTableProps) {
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
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  index === 0
                    ? "bg-blue-100 text-blue-800"
                    : index === 1
                    ? "bg-slate-100 text-slate-700"
                    : index === 2
                    ? "bg-sky-100 text-sky-800"
                    : "bg-gray-50 text-gray-600"
                }`}
              >
                {index + 1}
              </span>
              <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gray-100 border border-gray-200 shrink-0">
                {assist.playerPhoto ? (
                  <Image
                    src={assist.playerPhoto}
                    alt={assist.playerName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-500">
                    {assist.playerName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <TextLink
                  href={`${basePath}/${leagueSlug}/players/${assist.playerId}`}
                  className="truncate font-medium text-gray-900 block"
                >
                  {assist.playerName}
                </TextLink>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
                  {assist.teamSlug ? (
                    <TextLink
                      href={`${basePath}/${leagueSlug}/teams/${assist.teamSlug}`}
                      className="text-gray-500 hover:text-gray-700"
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
              <span className="text-lg font-black text-blue-600">
                {assist.assists}
              </span>
              <span className="block text-[10px] text-gray-400 uppercase tracking-wider">
                Asistencias
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
              <th scope="col" className="px-4 py-3 text-center" title="Pases de gol">
                <Eyebrow as="span" className="font-bold text-gray-900">
                  Total Asistencias
                </Eyebrow>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {assists.map((assist, index) => (
              <tr key={assist.playerId} className="transition hover:bg-gray-50">
                <td className="px-4 py-3 text-center font-medium text-gray-500">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      index === 0
                        ? "bg-blue-100 text-blue-800"
                        : index === 1
                        ? "bg-slate-100 text-slate-700"
                        : index === 2
                        ? "bg-sky-100 text-sky-800"
                        : "text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-100 border border-gray-200 shrink-0">
                      {assist.playerPhoto ? (
                        <Image
                          src={assist.playerPhoto}
                          alt={assist.playerName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-500">
                          {assist.playerName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <TextLink
                      href={`${basePath}/${leagueSlug}/players/${assist.playerId}`}
                      className="font-medium text-gray-900"
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
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {assist.teamName}
                      </TextLink>
                    ) : (
                      <span className="text-gray-600">{assist.teamName}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center font-bold text-blue-700 text-base">
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
