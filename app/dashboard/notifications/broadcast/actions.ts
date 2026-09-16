"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserNotificationType } from "@/types/database";

export type BroadcastState = { success: boolean; message: string | null; sentCount?: number };

const VALID_TYPES: UserNotificationType[] = ["match_assignment", "match_update", "system"];

export async function broadcastNotificationAction(
  _prevState: BroadcastState,
  formData: FormData
): Promise<BroadcastState> {
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

  if (profile?.global_role !== "super_admin") {
    return { success: false, message: "Solo super_admin puede enviar avisos globales." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const linkUrl = String(formData.get("linkUrl") ?? "").trim();
  const typeRaw = String(formData.get("type") ?? "system") as UserNotificationType;
  const targetRoleRaw = String(formData.get("targetRole") ?? "all");

  if (title.length < 3) {
    return { success: false, message: "El título debe tener al menos 3 caracteres." };
  }
  if (message.length < 3) {
    return { success: false, message: "El mensaje debe tener al menos 3 caracteres." };
  }
  if (!VALID_TYPES.includes(typeRaw)) {
    return { success: false, message: "Tipo de notificación inválido." };
  }
  if (linkUrl && !/^https?:\/\//.test(linkUrl)) {
    return { success: false, message: "El link debe iniciar con http:// o https://." };
  }

  // Destinatarios: todos los usuarios activos, o filtrados por rol global.
  let recipientsQuery = supabase.from("profiles").select("id").eq("is_suspended", false);
  if (targetRoleRaw !== "all") {
    recipientsQuery = recipientsQuery.eq("global_role", targetRoleRaw);
  }
  const { data: recipients, error: recipientsError } = await recipientsQuery.limit(1000);

  if (recipientsError) {
    return { success: false, message: "No fue posible obtener los destinatarios." };
  }
  if (!recipients || recipients.length === 0) {
    return { success: false, message: "No hay destinatarios para ese filtro." };
  }

  const rows = recipients.map((r) => ({
    user_id: r.id,
    league_id: null,
    type: typeRaw,
    title,
    message,
    link_url: linkUrl || null,
  }));

  // Insert por lotes de 200 para evitar payloads grandes.
  let sent = 0;
  for (let i = 0; i < rows.length; i += 200) {
    const chunk = rows.slice(i, i + 200);
    const { error: insertError } = await supabase.from("user_notifications").insert(chunk);
    if (insertError) {
      return {
        success: false,
        message: `Se enviaron ${sent} de ${rows.length} notificaciones antes de un error. Intenta reenviar al resto.`,
        sentCount: sent,
      };
    }
    sent += chunk.length;
  }

  // Auditoría best-effort del broadcast.
  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    league_id: null,
    action: "notification.broadcast",
    entity_type: "notification",
    entity_id: null,
    metadata: {
      title,
      type: typeRaw,
      target_role: targetRoleRaw,
      recipients: sent,
    },
  });

  revalidatePath("/dashboard/notifications/broadcast");
  return { success: true, message: `Aviso enviado a ${sent} usuario(s).`, sentCount: sent };
}
