import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/status-badge";

const actionVariantMap: Record<string, StatusBadgeVariant> = {
  "member.role_updated": "info",
  "match.referee_updated": "success",
  "match.referee_removed": "warning",
};

interface AuditActionBadgeProps {
  action: string;
}

export function AuditActionBadge({ action }: AuditActionBadgeProps) {
  const variant = actionVariantMap[action] ?? "neutral";
  return <StatusBadge variant={variant}>{action}</StatusBadge>;
}
