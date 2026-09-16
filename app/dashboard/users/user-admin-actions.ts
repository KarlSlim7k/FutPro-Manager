"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/database";

export type UserAdminActionState = { success: boolean; message: string };

async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, userId: null as string | null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("global_role")
    .eq("id", user.id)
    .maybeSingle();
  return {
    supabase,
    userId: profile?.global_role === "super_admin" ? user.id : null,
  };
}

function rpcErrorMessage(error: { message?: string } | null): string {
  const msg = error?.message ?? "";
  if (msg.includes("unico super_admin") || msg.includes("último")) {
    return "No puedes degradarte: eres el único super_admin activo.";
  }
  if (msg.includes("suspendido")) return "No puedes asignar super_admin a un usuario suspendido.";
  if (msg.includes("ti mismo") || msg.includes("ti mismo")) {
    return "No puedes realizar esta acción sobre tu propia cuenta.";
  }
  if (msg.includes("No puedes cambiar el rol de otro super_admin")) {
    return "No puedes cambiar el rol de otro super_admin.";
  }
  return msg || "No se pudo completar la operación.";
}

export async function assignSuperAdminAction(
  _prevState: UserAdminActionState,
  formData: FormData
): Promise<UserAdminActionState> {
  const { supabase, userId } = await requireSuperAdmin();
  if (!userId) return { success: false, message: "Solo super_admin puede asignar el rol." };

  const targetId = String(formData.get("targetUserId") ?? "");
  const confirmPhrase = String(formData.get("confirmPhrase") ?? "").trim();

  if (confirmPhrase !== "ASIGNAR SUPER_ADMIN") {
    return { success: false, message: 'Escribe exactamente "ASIGNAR SUPER_ADMIN" para confirmar.' };
  }

  const { data, error } = await supabase.rpc("admin_assign_super_admin", {
    p_target_user_id: targetId,
  });

  if (error) return { success: false, message: rpcErrorMessage(error) };

  revalidatePath("/dashboard/users");
  if (data === "already") {
    return { success: true, message: "El usuario ya tiene el rol super_admin." };
  }
  return { success: true, message: "Rol super_admin asignado y auditado." };
}

export async function setGlobalRoleAction(
  _prevState: UserAdminActionState,
  formData: FormData
): Promise<UserAdminActionState> {
  const { supabase, userId } = await requireSuperAdmin();
  if (!userId) return { success: false, message: "Solo super_admin puede cambiar roles." };

  const targetId = String(formData.get("targetUserId") ?? "");
  const newRole = String(formData.get("newRole") ?? "") as AppRole;

  const ALLOWED: AppRole[] = ["league_admin", "team_admin", "coach", "referee", "viewer"];
  if (!ALLOWED.includes(newRole)) {
    return { success: false, message: "Rol inválido." };
  }

  const { data, error } = await supabase.rpc("admin_set_global_role", {
    p_target_user_id: targetId,
    p_new_role: newRole,
  });

  if (error) return { success: false, message: rpcErrorMessage(error) };

  revalidatePath("/dashboard/users");
  if (data === "unchanged") return { success: true, message: "El usuario ya tenía ese rol." };
  return { success: true, message: "Rol global actualizado y auditado." };
}

export async function setUserSuspensionAction(
  targetUserId: string,
  suspended: boolean
): Promise<UserAdminActionState> {
  const { supabase, userId } = await requireSuperAdmin();
  if (!userId) return { success: false, message: "Solo super_admin puede suspender cuentas." };

  const { data, error } = await supabase.rpc("admin_set_user_suspension", {
    p_target_user_id: targetUserId,
    p_suspended: suspended,
  });

  if (error) return { success: false, message: rpcErrorMessage(error) };

  revalidatePath("/dashboard/users");
  if (data === "unchanged") {
    return { success: true, message: suspended ? "Ya estaba suspendido." : "Ya estaba activo." };
  }
  return {
    success: true,
    message: suspended ? "Cuenta suspendida y auditada." : "Cuenta rehabilitada y auditada.",
  };
}
