import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { MatchEvent, Player, Team } from "@/types/database";

type MatchEventItem = Pick<
  MatchEvent,
  "id" | "team_id" | "player_id" | "event_type" | "minute" | "notes" | "created_at"
>;
type TeamItem = Pick<Team, "id" | "name" | "slug">;
type PlayerItem = Pick<Player, "id" | "full_name">;

type PublicMatchEventsProps = {
  events: MatchEventItem[];
  teams: TeamItem[];
  players: PlayerItem[];
};

function formatEventType(eventType: MatchEventItem["event_type"]) {
  const labels: Record<MatchEventItem["event_type"], string> = {
    goal: "Gol",
    own_goal: "Autogol",
    assist: "Asistencia",
    yellow_card: "Tarjeta amarilla",
    red_card: "Tarjeta roja",
    substitution: "Sustitución",
    penalty_goal: "Gol de penal",
    penalty_miss: "Penal fallado",
  };
  return labels[eventType];
}

export function PublicMatchEvents({ events, teams, players }: PublicMatchEventsProps) {
  const teamsMap = new Map(teams.map((t) => [t.id, t]));
  const playersMap = new Map(players.map((p) => [p.id, p]));

  if (events.length === 0) {
    return (
      <EmptyState
        title="Sin eventos registrados"
        description="Sin eventos registrados para este partido."
      />
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const team = event.team_id ? teamsMap.get(event.team_id) : null;
        const player = event.player_id ? playersMap.get(event.player_id) : null;

        return (
          <div
            key={event.id}
            className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-4 text-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-2">
              <Eyebrow as="span" tone="brand">
                {event.minute}&apos;
              </Eyebrow>
              <span className="font-medium text-gray-900">
                {formatEventType(event.event_type)}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 text-gray-600">
              {team ? <span>{team.name}</span> : null}
              {player ? <span>{player.full_name}</span> : null}
              {event.notes ? <span className="text-gray-500">{event.notes}</span> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
