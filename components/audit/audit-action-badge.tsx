import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/status-badge";

const actionVariantMap: Record<string, StatusBadgeVariant> = {
  "member.role_updated": "info",
  "match.referee_updated": "success",
  "match.referee_removed": "warning",
  "standings.recalculated_manual": "success",
  "standings.recalculated_auto": "info",
  "standings.recalculate_failed": "danger",
  "media.league_logo_updated": "info",
  "media.team_logo_updated": "info",
  "media.player_photo_updated": "success",
  "media.batch_uploaded": "success",
  "media.deleted": "danger",
  "profile.avatar_updated": "success",
  "profile.updated": "info",
  "match.officials_updated": "success",
  "match.created_auto": "info",
  "match.updated_auto": "neutral",
  "match.deleted_auto": "danger",
  "match.event_created_auto": "success",
  "match.event_deleted_auto": "warning",
  "match.official_assigned_auto": "success",
  "match.official_removed_auto": "warning",
  "team_member.created_auto": "success",
  "team_member.role_updated_auto": "info",
  "team_member.removed_auto": "warning",
  "player.registration_created_auto": "success",
  "player.registration_updated_auto": "info",
  "player.registration_deleted_auto": "warning",
};

interface AuditActionBadgeProps {
  action: string;
}

export function AuditActionBadge({ action }: AuditActionBadgeProps) {
  const variant = actionVariantMap[action] ?? "neutral";
  return <StatusBadge variant={variant}>{action}</StatusBadge>;
}
