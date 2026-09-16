import { Eyebrow } from "@/components/ui/eyebrow";
import { TextLink } from "@/components/ui/text-link";
import { EmptyState } from "@/components/ui/empty-state";
import type { FairPlayTeamItem, FairPlayPlayerItem } from "@/lib/stats/get-season-stats";

interface FairPlayTableProps {
  teams: FairPlayTeamItem[];
  players: FairPlayPlayerItem[];
  leagueSlug: string;
  basePath?: string;
  theme?: "light" | "dark";
}

export function FairPlayTable({
  teams,
  players,
  leagueSlug,
  basePath = "/liga",
  theme,
}: FairPlayTableProps) {
  const isDark = theme === "dark" || (theme === undefined && basePath.startsWith("/liga"));

  if (teams.length === 0 && players.length === 0) {
    return (
      <EmptyState
        title="Sin tarjetas registradas"
        description="Aún no se han registrado tarjetas amarillas ni rojas en esta temporada."
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Sección 1: Fair Play por Equipos */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div>
            <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Juego Limpio por Equipos</h3>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              El equipo con menor puntuación encabeza la tabla (Amarilla: 1 pt, Roja: 3 pts).
            </p>
          </div>
        </div>

        <div className={`overflow-x-auto rounded-xl border ${isDark ? "border-white/10 bg-slate-900/40" : "border-gray-200"}`}>
          <table className={`min-w-full divide-y text-sm ${isDark ? "divide-white/10 bg-transparent text-gray-200" : "divide-gray-200 bg-white"}`}>
            <thead className={isDark ? "bg-white/5 text-gray-400" : "bg-gray-50 text-gray-500"}>
              <tr className="text-left">
                <th scope="col" className="px-4 py-3 w-12 text-center">
                  <Eyebrow as="span" className={isDark ? "text-gray-400" : undefined}>#</Eyebrow>
                </th>
                <th scope="col" className="px-4 py-3">
                  <Eyebrow as="span" className={isDark ? "text-gray-400" : undefined}>Equipo</Eyebrow>
                </th>
                <th scope="col" className="px-4 py-3 text-center" title="Tarjetas amarillas">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-3 w-2.5 rounded-xs bg-amber-400 border border-amber-500 inline-block" />
                    <Eyebrow as="span" className={isDark ? "text-amber-400" : undefined}>Amarillas</Eyebrow>
                  </span>
                </th>
                <th scope="col" className="px-4 py-3 text-center" title="Tarjetas rojas">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-3 w-2.5 rounded-xs bg-rose-600 border border-rose-700 inline-block" />
                    <Eyebrow as="span" className={isDark ? "text-rose-400" : undefined}>Rojas</Eyebrow>
                  </span>
                </th>
                <th scope="col" className="px-4 py-3 text-center" title="Puntos de penalización">
                  <Eyebrow as="span" className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Puntos</Eyebrow>
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-white/5 text-gray-300" : "divide-gray-100 text-gray-700"}`}>
              {teams.map((team, index) => (
                <tr key={team.teamId} className={`transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                  <td className="px-4 py-3 text-center font-medium">
                    <span className={isDark ? "text-gray-400" : "text-gray-500"}>{index + 1}</span>
                  </td>
                  <td className={`px-4 py-3 font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                    {team.teamSlug ? (
                      <TextLink
                        href={`${basePath}/${leagueSlug}/teams/${team.teamSlug}`}
                        className={isDark ? "text-white hover:text-emerald-400 font-medium" : undefined}
                      >
                        {team.teamName}
                      </TextLink>
                    ) : (
                      team.teamName
                    )}
                  </td>
                  <td className={`px-4 py-3 text-center font-medium ${isDark ? "text-amber-400" : "text-amber-700"}`}>
                    {team.yellowCards}
                  </td>
                  <td className={`px-4 py-3 text-center font-medium ${isDark ? "text-rose-400" : "text-rose-700"}`}>
                    {team.redCards}
                  </td>
                  <td className={`px-4 py-3 text-center font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {team.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sección 2: Jugadores con más amonestaciones */}
      {players.length > 0 && (
        <div className="space-y-3">
          <div>
            <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Jugadores con Amonestaciones</h3>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Acumulación individual de tarjetas en la temporada.
            </p>
          </div>

          <div className={`overflow-x-auto rounded-xl border ${isDark ? "border-white/10 bg-slate-900/40" : "border-gray-200"}`}>
            <table className={`min-w-full divide-y text-sm ${isDark ? "divide-white/10 bg-transparent text-gray-200" : "divide-gray-200 bg-white"}`}>
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
                  <th scope="col" className="px-4 py-3 text-center" title="Tarjetas amarillas">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-3 w-2.5 rounded-xs bg-amber-400 border border-amber-500 inline-block" />
                      <Eyebrow as="span" className={isDark ? "text-amber-400" : undefined}>TA</Eyebrow>
                    </span>
                  </th>
                  <th scope="col" className="px-4 py-3 text-center" title="Tarjetas rojas">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-3 w-2.5 rounded-xs bg-rose-600 border border-rose-700 inline-block" />
                      <Eyebrow as="span" className={isDark ? "text-rose-400" : undefined}>TR</Eyebrow>
                    </span>
                  </th>
                  <th scope="col" className="px-4 py-3 text-center" title="Puntos de sanción">
                    <Eyebrow as="span" className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Puntos</Eyebrow>
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-white/5 text-gray-300" : "divide-gray-100 text-gray-700"}`}>
                {players.slice(0, 20).map((player, index) => (
                  <tr key={player.playerId} className={`transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                    <td className="px-4 py-3 text-center font-medium">
                      <span className={isDark ? "text-gray-400" : "text-gray-500"}>{index + 1}</span>
                    </td>
                    <td className={`px-4 py-3 font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                      <TextLink
                        href={`${basePath}/${leagueSlug}/players/${player.playerId}`}
                        className={isDark ? "text-white hover:text-emerald-400 font-medium" : undefined}
                      >
                        {player.playerName}
                      </TextLink>
                    </td>
                    <td className={`px-4 py-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                      {player.teamName}
                    </td>
                    <td className={`px-4 py-3 text-center font-semibold ${isDark ? "text-amber-400" : "text-amber-700"}`}>
                      {player.yellowCards}
                    </td>
                    <td className={`px-4 py-3 text-center font-semibold ${isDark ? "text-rose-400" : "text-rose-700"}`}>
                      {player.redCards}
                    </td>
                    <td className={`px-4 py-3 text-center font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {player.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
