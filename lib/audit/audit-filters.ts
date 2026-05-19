export const AUDIT_ACTION_OPTIONS = [
  "member.role_updated",
  "match.referee_updated",
  "match.referee_removed",
  "standings.recalculated_manual",
  "standings.recalculated_auto",
  "standings.recalculate_failed",
  "media.player_photo_updated",
  "media.team_logo_updated",
  "media.league_logo_updated",
] as const;

export const AUDIT_ENTITY_TYPE_OPTIONS = ["league_member", "match", "season", "league", "team", "player"] as const;

export type AuditActionOption = (typeof AUDIT_ACTION_OPTIONS)[number];
export type AuditEntityTypeOption = (typeof AUDIT_ENTITY_TYPE_OPTIONS)[number];

export function parseAuditAction(value?: string): AuditActionOption | undefined {
  if (!value) return undefined;
  return AUDIT_ACTION_OPTIONS.includes(value as AuditActionOption)
    ? (value as AuditActionOption)
    : undefined;
}

export function parseAuditEntityType(value?: string): AuditEntityTypeOption | undefined {
  if (!value) return undefined;
  return AUDIT_ENTITY_TYPE_OPTIONS.includes(value as AuditEntityTypeOption)
    ? (value as AuditEntityTypeOption)
    : undefined;
}
