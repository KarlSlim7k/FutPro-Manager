import { Eyebrow } from "@/components/ui/eyebrow";
import { TextLink } from "@/components/ui/text-link";
import { EmptyState } from "@/components/ui/empty-state";
import type { FairPlayTeamItem, FairPlayPlayerItem } from "@/lib/stats/get-season-stats";

interface FairPlayTableProps {
  teams: FairPlayTeamItem[];
  players: FairPlayPlayerItem[];
  leagueSlug: string;
  basePath?: string;
}

export function FairPlayTable({
  teams,
  players,
  leagueSlug,
  basePath = "/liga",
}: FairPlayTableProps) {
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
            <h3 className="text-base font-semibold text-gray-900">Juego Limpio por Equipos</h3>
            <p className="text-xs text-gray-500">
              El equipo con menor puntuación encabeza la tabla (Amarilla: 1 pt, Roja: 3 pts).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th scope="col" className="px-4 py-3 w-12 text-center">
                  <Eyebrow as="span">#</Eyebrow>
                </th>
                <th scope="col" className="px-4 py-3">
                  <Eyebrow as="span">Equipo</Eyebrow>
                </th>
                <th scope="col" className="px-4 py-3 text-center" title="Tarjetas amarillas">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-3 w-2.5 rounded-xs bg-amber-400 border border-amber-500 inline-block" />
                    <Eyebrow as="span">Amarillas</Eyebrow>
                  </span>
                </th>
                <th scope="col" className="px-4 py-3 text-center" title="Tarjetas rojas">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-3 w-2.5 rounded-xs bg-rose-600 border border-rose-700 inline-block" />
                    <Eyebrow as="span">Rojas</Eyebrow>
                  </span>
                </th>
                <th scope="col" className="px-4 py-3 text-center" title="Puntos de penalización">
                  <Eyebrow as="span" className="font-bold text-gray-900">Puntos</Eyebrow>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {teams.map((team, index) => (
                <tr key={team.teamId} className="transition hover:bg-gray-50">
                  <td className="px-4 py-3 text-center font-medium text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {team.teamSlug ? (
                      <TextLink href={`${basePath}/${leagueSlug}/teams/${team.teamSlug}`}>
                        {team.teamName}
                      </TextLink>
                    ) : (
                      team.teamName
                    )}
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-amber-700">
                    {team.yellowCards}
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-rose-700">
                    {team.redCards}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-gray-900">
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
            <h3 className="text-base font-semibold text-gray-900">Jugadores con Amonestaciones</h3>
            <p className="text-xs text-gray-500">
              Acumulación individual de tarjetas en la temporada.
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
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
                  <th scope="col" className="px-4 py-3 text-center" title="Tarjetas amarillas">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-3 w-2.5 rounded-xs bg-amber-400 border border-amber-500 inline-block" />
                      <Eyebrow as="span">TA</Eyebrow>
                    </span>
                  </th>
                  <th scope="col" className="px-4 py-3 text-center" title="Tarjetas rojas">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-3 w-2.5 rounded-xs bg-rose-600 border border-rose-700 inline-block" />
                      <Eyebrow as="span">TR</Eyebrow>
                    </span>
                  </th>
                  <th scope="col" className="px-4 py-3 text-center" title="Puntos de sanción">
                    <Eyebrow as="span" className="font-bold text-gray-900">Puntos</Eyebrow>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {players.slice(0, 20).map((player, index) => (
                  <tr key={player.playerId} className="transition hover:bg-gray-50">
                    <td className="px-4 py-3 text-center font-medium text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <TextLink href={`${basePath}/${leagueSlug}/players/${player.playerId}`}>
                        {player.playerName}
                      </TextLink>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {player.teamName}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-amber-700">
                      {player.yellowCards}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-rose-700">
                      {player.redCards}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-gray-900">
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
