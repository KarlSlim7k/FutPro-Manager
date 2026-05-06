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
  homeTeamId?: string;
  awayTeamId?: string;
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

function eventIcon(eventType: MatchEventItem["event_type"]) {
  const icons: Record<MatchEventItem["event_type"], string> = {
    goal: "⚽",
    own_goal: "⚽",
    assist: "🎯",
    yellow_card: "🟨",
    red_card: "🟥",
    substitution: "🔁",
    penalty_goal: "⚽",
    penalty_miss: "❌",
  };
  return icons[eventType];
}

function teamLabel(
  teamId: string | null,
  homeTeamId?: string,
  awayTeamId?: string
): string | null {
  if (!teamId || !homeTeamId || !awayTeamId) return null;
  if (teamId === homeTeamId) return "Local";
  if (teamId === awayTeamId) return "Visitante";
  return null;
}

export function PublicMatchEvents({
  events,
  teams,
  players,
  homeTeamId,
  awayTeamId,
}: PublicMatchEventsProps) {
  const teamsMap = new Map(teams.map((t) => [t.id, t]));
  const playersMap = new Map(players.map((p) => [p.id, p]));

  if (events.length === 0) {
    return (
      <EmptyState
        title="Sin eventos registrados"
        description="Cuando se registren goles, tarjetas o sustituciones, aparecerán aquí."
      />
    );
  }

  return (
    <div className="relative">
      {/* Timeline vertical line */}
      <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-200" />

      <div className="space-y-4">
        {events.map((event) => {
          const team = event.team_id ? teamsMap.get(event.team_id) : null;
          const player = event.player_id ? playersMap.get(event.player_id) : null;
          const label = teamLabel(event.team_id, homeTeamId, awayTeamId);

          return (
            <div key={event.id} className="relative flex items-start gap-4">
              {/* Timeline dot / icon */}
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-sm shadow-sm">
                {eventIcon(event.event_type)}
              </div>

              {/* Event card */}
              <div className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Eyebrow as="span" tone="brand">
                    {event.minute}&apos;
                  </Eyebrow>
                  <span className="text-sm font-medium text-gray-900">
                    {formatEventType(event.event_type)}
                  </span>
                  {label ? (
                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {label}
                    </span>
                  ) : null}
                </div>

                <div className="mt-1 flex flex-wrap gap-x-3 text-sm text-gray-600">
                  {team ? (
                    <span className="break-words">{team.name}</span>
                  ) : null}
                  {player ? (
                    <span className="break-words font-medium text-gray-800">
                      {player.full_name}
                    </span>
                  ) : null}
                </div>

                {event.notes ? (
                  <p className="mt-1 text-xs text-gray-500 break-words">
                    {event.notes}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
