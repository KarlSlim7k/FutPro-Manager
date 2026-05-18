"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";
import type { AppRole } from "@/types/database";

export type UpdateMemberRoleState = {
  success: boolean;
  message: string | null;
};

const ALLOWED_ROLES: AppRole[] = [
  "league_admin",
  "team_admin",
  "coach",
  "referee",
  "viewer",
];

export async function updateMemberRoleAction(
  leagueSlug: string,
  prevState: UpdateMemberRoleState,
  formData: FormData
): Promise<UpdateMemberRoleState> {
  void prevState;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: league, error: leagueError } = await supabase
    .from("leagues")
    .select("id")
    .eq("slug", leagueSlug)
    .maybeSingle();

  if (leagueError) {
    return { success: false, message: "Error al buscar la liga." };
  }

  if (!league) {
    return { success: false, message: "Liga no encontrada." };
  }

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: league.id,
  });

  if (!permissions.canManageMembers) {
    return { success: false, message: "No tienes permisos para gestionar miembros." };
  }

  const memberId = String(formData.get("memberId") ?? "").trim();
  const newRole = String(formData.get("newRole") ?? "").trim() as AppRole;

  if (!memberId) {
    return { success: false, message: "ID de miembro no proporcionado." };
  }

  if (newRole === "super_admin") {
    return { success: false, message: "No se puede asignar el rol super_admin." };
  }

  if (!ALLOWED_ROLES.includes(newRole)) {
    return { success: false, message: "Rol no valido." };
  }

  // Prevent removing the last league_admin
  if (newRole !== "league_admin") {
    const { data: currentMember, error: currentMemberError } = await supabase
      .from("league_members")
      .select("role")
      .eq("id", memberId)
      .eq("league_id", league.id)
      .maybeSingle();

    if (currentMemberError) {
      return { success: false, message: "Error al verificar el miembro." };
    }

    if (!currentMember) {
      return { success: false, message: "Miembro no encontrado en esta liga." };
    }

    if (currentMember.role === "league_admin") {
      const { count, error: countError } = await supabase
        .from("league_members")
        .select("id", { count: "exact", head: true })
        .eq("league_id", league.id)
        .eq("role", "league_admin");

      if (countError) {
        return { success: false, message: "Error al verificar administradores." };
      }

      if ((count ?? 0) <= 1) {
        return {
          success: false,
          message: "No se puede cambiar el rol. La liga debe tener al menos un administrador.",
        };
      }
    }
  }

  const { error: updateError } = await supabase
    .from("league_members")
    .update({ role: newRole })
    .eq("id", memberId)
    .eq("league_id", league.id);

  if (updateError) {
    if (updateError.code === "42501" || updateError.message?.toLowerCase().includes("row-level security")) {
      return { success: false, message: "No tienes permisos para realizar este cambio." };
    }
    return { success: false, message: "No se pudo actualizar el rol. Intenta nuevamente." };
  }

  revalidatePath(`/dashboard/leagues/${leagueSlug}/members`);
  return { success: true, message: "Rol actualizado correctamente." };
}
