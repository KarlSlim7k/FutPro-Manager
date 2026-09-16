"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type GlobalPurgeAuditState = {
  success: boolean;
  message: string | null;
  deletedCount?: number;
};

const ALLOWED_DAYS = [90, 180, 365] as const;

async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("global_role")
    .eq("id", user.id)
    .maybeSingle();
  return { supabase, isSuperAdmin: profile?.global_role === "super_admin" };
}

export async function getGlobalAuditStatsAction(): Promise<{
  total: number;
  olderThan90: number;
  olderThan180: number;
  olderThan365: number;
  oldestLogAt: string | null;
} | null> {
  const { supabase, isSuperAdmin } = await requireSuperAdmin();
  if (!isSuperAdmin) return null;

  const { data, error } = await supabase.rpc("admin_audit_stats");
  if (error || !data || data.length === 0) return null;
  const row = data[0];
  return {
    total: Number(row.total_logs ?? 0),
    olderThan90: Number(row.older_than_90_days ?? 0),
    olderThan180: Number(row.older_than_180_days ?? 0),
    olderThan365: Number(row.older_than_365_days ?? 0),
    oldestLogAt: row.oldest_log_at ? String(row.oldest_log_at) : null,
  };
}

export async function purgeGlobalAuditLogsAction(
  _prevState: GlobalPurgeAuditState,
  formData: FormData
): Promise<GlobalPurgeAuditState> {
  const { supabase, isSuperAdmin } = await requireSuperAdmin();
  if (!isSuperAdmin) {
    return { success: false, message: "Solo super_admin puede purgar la auditoría global." };
  }

  const days = Number(String(formData.get("days") ?? ""));
  if (!ALLOWED_DAYS.includes(days as (typeof ALLOWED_DAYS)[number])) {
    return { success: false, message: "Selecciona un rango de retención válido (90, 180 o 365 días)." };
  }

  const { data, error } = await supabase.rpc("admin_purge_audit_logs", { p_days: days });

  if (error) {
    return { success: false, message: "No se pudo purgar la auditoría global. Intenta nuevamente." };
  }

  const deletedCount = Number(data ?? 0);
  revalidatePath("/dashboard/audit");
  return {
    success: true,
    message:
      deletedCount === 0
        ? `No había registros de liga anteriores a ${days} días.`
        : `Se eliminaron ${deletedCount} registro(s) de liga anteriores a ${days} días.`,
    deletedCount,
  };
}
