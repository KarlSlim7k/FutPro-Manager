import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/status-badge";
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

type BadgeStyle = {
  variant: StatusBadgeVariant;
  className?: string;
};

const eventTypeStyles: Record<MatchEventType, BadgeStyle> = {
  goal: { variant: "success" },
  own_goal: { variant: "warning", className: "bg-orange-100 text-orange-800" },
  assist: { variant: "neutral", className: "bg-slate-100 text-slate-700" },
  yellow_card: { variant: "warning", className: "bg-yellow-100 text-yellow-800" },
  red_card: { variant: "danger" },
  substitution: { variant: "info" },
  penalty_goal: { variant: "success" },
  penalty_miss: { variant: "warning" },
};

export function getMatchEventTypeLabel(type: MatchEventType) {
  return eventTypeLabels[type];
}

interface MatchEventTypeBadgeProps {
  type: MatchEventType;
}

export function MatchEventTypeBadge({ type }: MatchEventTypeBadgeProps) {
  const badgeStyle = eventTypeStyles[type];

  return (
    <StatusBadge
      variant={badgeStyle.variant}
      className={`px-2 py-0.5 ${badgeStyle.className ?? ""}`}
    >
      {eventTypeLabels[type]}
    </StatusBadge>
  );
}
