import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/status-badge";
import type { MatchStatus } from "@/types/database";

type MatchStatusBadgeProps = {
  status: MatchStatus;
};

type BadgeStyle = {
  variant: StatusBadgeVariant;
  className?: string;
};

function formatStatusLabel(status: MatchStatus) {
  const labels: Record<MatchStatus, string> = {
    scheduled: "Programado",
    in_progress: "En juego",
    completed: "Finalizado",
    postponed: "Pospuesto",
    cancelled: "Cancelado",
  };
  return labels[status];
}

export function MatchStatusBadge({ status }: MatchStatusBadgeProps) {
  const styles: Record<MatchStatus, BadgeStyle> = {
    completed: { variant: "success" },
    in_progress: { variant: "info" },
    cancelled: { variant: "danger" },
    postponed: { variant: "warning" },
    scheduled: { variant: "neutral", className: "text-gray-800" },
  };

  const badgeStyle = styles[status];

  return (
    <StatusBadge
      variant={badgeStyle.variant}
      className={`px-2 py-0.5 ${badgeStyle.className ?? ""}`}
    >
      {formatStatusLabel(status)}
    </StatusBadge>
  );
}
