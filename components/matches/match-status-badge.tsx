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
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
        </span>
        EN VIVO
      </span>
    );
  }

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
