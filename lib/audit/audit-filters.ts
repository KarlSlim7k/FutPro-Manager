export const AUDIT_ACTION_OPTIONS = [
  "member.role_updated",
  "match.referee_updated",
  "match.referee_removed",
] as const;

export const AUDIT_ENTITY_TYPE_OPTIONS = ["league_member", "match"] as const;

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
