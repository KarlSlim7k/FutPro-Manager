import type { MatchStatus } from "@/types/database";

type MatchStatusBadgeProps = {
  status: MatchStatus;
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
  const className =
    status === "completed"
      ? "bg-emerald-100 text-emerald-800"
      : status === "in_progress"
      ? "bg-blue-100 text-blue-800"
      : status === "cancelled"
      ? "bg-red-100 text-red-800"
      : status === "postponed"
      ? "bg-amber-100 text-amber-800"
      : "bg-gray-100 text-gray-800";

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {formatStatusLabel(status)}
    </span>
  );
}
