import type { MatchEventType } from "@/types/database";

const eventTypeLabels: Record<MatchEventType, string> = {
  goal: "Gol",
  own_goal: "Autogol",
  assist: "Asistencia",
  yellow_card: "Tarjeta amarilla",
  red_card: "Tarjeta roja",
  substitution: "Sustitución",
  penalty_goal: "Gol de penal",
  penalty_miss: "Penal fallado",
};

const eventTypeStyles: Record<MatchEventType, string> = {
  goal: "bg-emerald-100 text-emerald-800",
  own_goal: "bg-orange-100 text-orange-800",
  assist: "bg-slate-100 text-slate-700",
  yellow_card: "bg-yellow-100 text-yellow-800",
  red_card: "bg-red-100 text-red-800",
  substitution: "bg-blue-100 text-blue-800",
  penalty_goal: "bg-emerald-100 text-emerald-800",
  penalty_miss: "bg-amber-100 text-amber-800",
};

export function getMatchEventTypeLabel(type: MatchEventType) {
  return eventTypeLabels[type];
}

interface MatchEventTypeBadgeProps {
  type: MatchEventType;
}

export function MatchEventTypeBadge({ type }: MatchEventTypeBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${eventTypeStyles[type]}`}>
      {eventTypeLabels[type]}
    </span>
  );
}
