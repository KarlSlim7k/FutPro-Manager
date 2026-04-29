import type { MatchEvent } from "@/types/database";
import { MatchEventCard } from "./match-event-card";

interface MatchEventListProps {
  events: MatchEvent[];
  teamsMap: Record<string, { name: string }>;
  playersMap: Record<string, { full_name: string }>;
}

export function MatchEventList({ events, teamsMap, playersMap }: MatchEventListProps) {
  const sortedEvents = [...events].sort((a, b) => {
    if (a.minute !== b.minute) return a.minute - b.minute;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  if (sortedEvents.length === 0) {
    return (
      <p className="text-sm text-gray-600">Este partido aún no tiene eventos registrados.</p>
    );
  }

  return (
    <div className="space-y-3">
      {sortedEvents.map((event) => (
        <MatchEventCard
          key={event.id}
          event={event}
          teamName={event.team_id ? (teamsMap[event.team_id]?.name ?? null) : null}
          playerName={
            event.player_id ? (playersMap[event.player_id]?.full_name ?? null) : null
          }
        />
      ))}
    </div>
  );
}
