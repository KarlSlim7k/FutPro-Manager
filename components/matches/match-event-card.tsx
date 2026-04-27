import type { MatchEvent, MatchEventType } from "@/types/database";

function getEventTypeLabel(type: MatchEventType): string {
  const labels: Record<MatchEventType, string> = {
    goal: "Gol",
    own_goal: "Autogol",
    assist: "Asistencia",
    yellow_card: "Tarjeta amarilla",
    red_card: "Tarjeta roja",
    substitution: "Sustitución",
    penalty_goal: "Gol de penal",
    penalty_miss: "Penal fallado",
  };
  return labels[type];
}

function getEventTypeBadgeColor(type: MatchEventType): string {
  switch (type) {
    case "goal":
    case "penalty_goal":
      return "bg-emerald-100 text-emerald-800";
    case "own_goal":
      return "bg-orange-100 text-orange-800";
    case "yellow_card":
      return "bg-yellow-100 text-yellow-800";
    case "red_card":
      return "bg-red-100 text-red-800";
    case "substitution":
      return "bg-blue-100 text-blue-800";
    case "assist":
      return "bg-gray-100 text-gray-800";
    case "penalty_miss":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

interface MatchEventCardProps {
  event: MatchEvent;
  teamName: string | null;
  playerName: string | null;
}

export function MatchEventCard({ event, teamName, playerName }: MatchEventCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700">
        {event.minute}&apos;
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getEventTypeBadgeColor(
              event.event_type
            )}`}
          >
            {getEventTypeLabel(event.event_type)}
          </span>
          {teamName ? (
            <span className="text-xs font-medium text-gray-600">{teamName}</span>
          ) : null}
        </div>
        {playerName ? (
          <p className="mt-1 text-sm font-medium text-gray-900">{playerName}</p>
        ) : null}
        {event.notes ? (
          <p className="mt-1 text-sm text-gray-600">{event.notes}</p>
        ) : null}
      </div>
    </div>
  );
}
