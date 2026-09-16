export const AUDIT_ACTION_OPTIONS = [
  "member.role_updated",
  "team_member.created",
  "team_member.role_updated",
  "team_member.removed",
  "match.referee_updated",
  "match.referee_removed",
  "match.officials_updated",
  "match.created",
  "match.updated",
  "match.result_updated",
  "match.event_created",
  "match.event_deleted",
  "league.created",
  "season.created",
  "team.created",
  "team.updated",
  "player.created",
  "player.updated",
  "player.registration_created",
  "player.registration_updated",
  "player.registration_deleted",
  "venue.created",
  "audit.purged",
  "standings.recalculated_manual",
  "standings.recalculated_auto",
  "standings.recalculate_failed",
  "media.player_photo_updated",
  "media.team_logo_updated",
  "media.league_logo_updated",
  "media.orphans_cleaned",
] as const;

export const AUDIT_ENTITY_TYPE_OPTIONS = [
  "league_member",
  "team_member",
  "match",
  "match_event",
  "season",
  "league",
  "team",
  "player",
  "player_registration",
  "venue",
] as const;

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
