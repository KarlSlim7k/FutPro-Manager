"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type PurgeContactMessagesState = {
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

export async function getContactMessageStatsAction(): Promise<{
  total: number;
  last30Days: number;
} | null> {
  const { supabase, isSuperAdmin } = await requireSuperAdmin();
  if (!isSuperAdmin) return null;

  const { data, error } = await supabase.rpc("admin_contact_message_stats");
  if (error || !data || data.length === 0) return null;
  const row = data[0];
  return {
    total: Number(row.total ?? 0),
    last30Days: Number(row.last_30_days ?? 0),
  };
}

export async function purgeContactMessagesAction(
  _prevState: PurgeContactMessagesState,
  formData: FormData
): Promise<PurgeContactMessagesState> {
  const { supabase, isSuperAdmin } = await requireSuperAdmin();
  if (!isSuperAdmin) {
    return { success: false, message: "Solo super_admin puede purgar mensajes." };
  }

  const days = Number(String(formData.get("days") ?? ""));
  if (!ALLOWED_DAYS.includes(days as (typeof ALLOWED_DAYS)[number])) {
    return { success: false, message: "Selecciona un rango de retención válido (90, 180 o 365 días)." };
  }

  const { data, error } = await supabase.rpc("admin_purge_contact_messages", { p_days: days });

  if (error) {
    return { success: false, message: "No se pudo purgar los mensajes. Intenta nuevamente." };
  }

  const deletedCount = Number(data ?? 0);
  revalidatePath("/dashboard/contact-messages");
  return {
    success: true,
    message:
      deletedCount === 0
        ? `No había mensajes anteriores a ${days} días.`
        : `Se eliminaron ${deletedCount} mensaje(s) anteriores a ${days} días.`,
    deletedCount,
  };
}
