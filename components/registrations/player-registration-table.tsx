import { PlayerRegistrationCard, type PlayerRegistrationRow } from "@/components/registrations/player-registration-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TextLink } from "@/components/ui/text-link";

interface PlayerRegistrationTableProps {
  leagueSlug: string;
  registrations: PlayerRegistrationRow[];
  showPlayerColumn?: boolean;
  showTeamColumn?: boolean;
  showPositionColumn?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function PlayerRegistrationTable({
  leagueSlug,
  registrations,
  showPlayerColumn = false,
  showTeamColumn = false,
  showPositionColumn = false,
  emptyTitle = "Sin registros",
  emptyDescription = "Aún no hay registros disponibles para mostrar.",
}: PlayerRegistrationTableProps) {
  if (registrations.length === 0) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} />
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {registrations.map((registration) => (
          <PlayerRegistrationCard
            key={registration.id}
            leagueSlug={leagueSlug}
            registration={registration}
            showPlayerColumn={showPlayerColumn}
            showTeamColumn={showTeamColumn}
            showPositionColumn={showPositionColumn}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-gray-200 md:block">
        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              {showPlayerColumn ? (
                <th className="px-4 py-3">
                  <Eyebrow as="span">Jugador</Eyebrow>
                </th>
              ) : null}
              {showTeamColumn ? (
                <th className="px-4 py-3">
                  <Eyebrow as="span">Equipo</Eyebrow>
                </th>
              ) : null}
              <th className="px-4 py-3">
                <Eyebrow as="span">Temporada</Eyebrow>
              </th>
              {showPositionColumn ? (
                <th className="px-4 py-3">
                  <Eyebrow as="span">Posición</Eyebrow>
                </th>
              ) : null}
              <th className="px-4 py-3">
                <Eyebrow as="span">Número</Eyebrow>
              </th>
              <th className="px-4 py-3">
                <Eyebrow as="span">Estatus</Eyebrow>
              </th>
              <th className="px-4 py-3">
                <Eyebrow as="span">Registrado</Eyebrow>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {registrations.map((registration) => (
              <tr key={registration.id}>
                {showPlayerColumn ? (
                  <td className="px-4 py-3">
                    {registration.player ? (
                      <TextLink
                        href={`/dashboard/leagues/${leagueSlug}/players/${registration.player.id}`}
                      >
                        {registration.player.full_name}
                      </TextLink>
                    ) : (
                      "No disponible"
                    )}
                  </td>
                ) : null}
                {showTeamColumn ? (
                  <td className="px-4 py-3">
                    {registration.team ? (
                      <TextLink
                        href={`/dashboard/leagues/${leagueSlug}/teams/${registration.team.slug}`}
                      >
                        {registration.team.name}
                      </TextLink>
                    ) : (
                      "No disponible"
                    )}
                  </td>
                ) : null}
                <td className="px-4 py-3">
                  {registration.season ? (
                    <TextLink
                      href={`/dashboard/leagues/${leagueSlug}/seasons/${registration.season.slug}`}
                    >
                      {registration.season.name}
                    </TextLink>
                  ) : (
                    "No disponible"
                  )}
                </td>
                {showPositionColumn ? (
                  <td className="px-4 py-3">{registration.player?.preferred_position || "No definida"}</td>
                ) : null}
                <td className="px-4 py-3">{registration.jersey_number ?? "Sin número"}</td>
                <td className="px-4 py-3">{formatLabel(registration.status)}</td>
                <td className="px-4 py-3">{formatDateTime(registration.registered_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
