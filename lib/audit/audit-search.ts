/**
 * Filtra logs de auditoría por texto libre (acción, entidad, metadata).
 * Se aplica en memoria porque metadata es jsonb y no admite ilike directo.
 */
export function filterAuditLogsByQuery<T extends { action: string; entity_type: string; metadata: Record<string, unknown> }>(
  logs: T[],
  query?: string
): T[] {
  if (!query) return logs;
  const q = query.trim().toLowerCase();
  if (!q) return logs;
  return logs.filter((log) => {
    if (log.action.toLowerCase().includes(q)) return true;
    if (log.entity_type.toLowerCase().includes(q)) return true;
    try {
      if (JSON.stringify(log.metadata ?? {}).toLowerCase().includes(q)) return true;
    } catch {
      return false;
    }
    return false;
  });
}
