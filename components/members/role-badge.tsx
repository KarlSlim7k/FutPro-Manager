import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/status-badge";
import type { AppRole } from "@/types/database";

const roleVariantMap: Record<AppRole, StatusBadgeVariant> = {
  super_admin: "danger",
  league_admin: "info",
  team_admin: "warning",
  coach: "success",
  referee: "neutral",
  viewer: "neutral",
};

function formatRoleLabel(role: AppRole): string {
  return role
    .split("_")
    .map((word, index) => (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
}

interface RoleBadgeProps {
  role: AppRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <StatusBadge variant={roleVariantMap[role]}>
      {formatRoleLabel(role)}
    </StatusBadge>
  );
}
