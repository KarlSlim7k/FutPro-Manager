import type { SupabaseClient } from "@supabase/supabase-js";

export interface CreateAuditLogParams {
  supabase: SupabaseClient;
  actorId: string;
  leagueId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
}

export type CreateAuditLogResult =
  | { success: true }
  | { success: false; error: unknown };

export async function createAuditLog(
  params: CreateAuditLogParams
): Promise<CreateAuditLogResult> {
  const { supabase, actorId, leagueId, action, entityType, entityId, metadata } = params;
  try {
    const { error } = await supabase.from("audit_logs").insert({
      actor_id: actorId,
      league_id: leagueId,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      metadata,
    });
    if (error) {
      return { success: false, error };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
