"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/audit/create-audit-log";
import { canManageTeam, getLeaguePermissions } from "@/lib/permissions/league-permissions";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/database";

export type TeamMemberActionState = {
  success: boolean;
  message: string | null;
};

const ALLOWED_TEAM_ROLES: AppRole[] = ["team_admin", "coach", "viewer"];

export async function addTeamMemberAction(
  leagueSlug: string,
  teamSlug: string,
  _prevState: TeamMemberActionState,
  formData: FormData
): Promise<TeamMemberActionState> {
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

  if (leagueError || !league) {
    return { success: false, message: "Liga no encontrada." };
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id, name")
    .eq("league_id", league.id)
    .eq("slug", teamSlug)
    .maybeSingle();

  if (teamError || !team) {
    return { success: false, message: "Equipo no encontrado." };
  }

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: league.id,
  });

  if (!canManageTeam(permissions, team.id)) {
    return { success: false, message: "No tienes permisos para gestionar el staff de este equipo." };
  }

  const profileId = String(formData.get("profileId") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim() as AppRole;

  if (!profileId) {
    return { success: false, message: "Selecciona un usuario para agregar al staff." };
  }

  if (!ALLOWED_TEAM_ROLES.includes(role)) {
    return { success: false, message: "Rol no válido para staff de equipo." };
  }

  // Prevenir que un team_admin agregue a usuarios que no son miembros de la liga
  const { data: leagueMember } = await supabase
    .from("league_members")
    .select("id")
    .eq("league_id", league.id)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (!leagueMember) {
    return {
      success: false,
      message: "El usuario debe ser miembro de la liga para poder formar parte del staff del equipo.",
    };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("team_members")
    .insert({
      team_id: team.id,
      profile_id: profileId,
      role,
    })
    .select("id")
    .maybeSingle();

  if (insertError) {
    if (insertError.code === "23505") {
      return { success: false, message: "Este usuario ya forma parte del staff del equipo." };
    }
    if (insertError.code === "42501" || insertError.message?.toLowerCase().includes("row-level security")) {
      return { success: false, message: "RLS bloqueó la operación: sin permisos para agregar staff." };
    }
    return { success: false, message: "No se pudo agregar al miembro del staff." };
  }

  await createAuditLog({
    supabase,
    actorId: user.id,
    leagueId: league.id,
    action: "team_member.created",
    entityType: "team_member",
    entityId: inserted?.id ?? null,
    metadata: {
      league_slug: leagueSlug,
      team_slug: teamSlug,
      team_id: team.id,
      profile_id: profileId,
      role,
    },
  });

  revalidatePath(`/dashboard/leagues/${leagueSlug}/teams/${teamSlug}/staff`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}/teams/${teamSlug}`);
  revalidatePath(`/dashboard/teams`);
  revalidatePath(`/dashboard`);

  return { success: true, message: "Miembro agregado al staff correctamente." };
}

export async function updateTeamMemberRoleAction(
  leagueSlug: string,
  teamSlug: string,
  _prevState: TeamMemberActionState,
  formData: FormData
): Promise<TeamMemberActionState> {
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

  if (leagueError || !league) {
    return { success: false, message: "Liga no encontrada." };
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id")
    .eq("league_id", league.id)
    .eq("slug", teamSlug)
    .maybeSingle();

  if (teamError || !team) {
    return { success: false, message: "Equipo no encontrado." };
  }

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: league.id,
  });

  if (!canManageTeam(permissions, team.id)) {
    return { success: false, message: "No tienes permisos para modificar el staff de este equipo." };
  }

  const memberId = String(formData.get("memberId") ?? "").trim();
  const newRole = String(formData.get("newRole") ?? "").trim() as AppRole;

  if (!memberId) {
    return { success: false, message: "ID de miembro no proporcionado." };
  }

  if (!ALLOWED_TEAM_ROLES.includes(newRole)) {
    return { success: false, message: "Rol no válido para staff de equipo." };
  }

  // Verificar si es el último team_admin
  const { data: currentMember, error: currentMemberError } = await supabase
    .from("team_members")
    .select("role, profile_id")
    .eq("id", memberId)
    .eq("team_id", team.id)
    .maybeSingle();

  if (currentMemberError || !currentMember) {
    return { success: false, message: "Miembro no encontrado." };
  }

  if (currentMember.role === "team_admin" && newRole !== "team_admin") {
    const { count, error: countError } = await supabase
      .from("team_members")
      .select("id", { count: "exact", head: true })
      .eq("team_id", team.id)
      .eq("role", "team_admin");

    if (countError || (count ?? 0) <= 1) {
      return {
        success: false,
        message: "No se puede cambiar el rol. El equipo debe conservar al menos un administrador.",
      };
    }
  }

  const { error: updateError } = await supabase
    .from("team_members")
    .update({ role: newRole })
    .eq("id", memberId)
    .eq("team_id", team.id);

  if (updateError) {
    if (updateError.code === "42501" || updateError.message?.toLowerCase().includes("row-level security")) {
      return { success: false, message: "No tienes permisos para modificar este miembro." };
    }
    return { success: false, message: "No se pudo actualizar el rol del miembro." };
  }

  await createAuditLog({
    supabase,
    actorId: user.id,
    leagueId: league.id,
    action: "team_member.role_updated",
    entityType: "team_member",
    entityId: memberId,
    metadata: {
      league_slug: leagueSlug,
      team_slug: teamSlug,
      team_id: team.id,
      previous_role: currentMember.role,
      new_role: newRole,
      target_profile_id: currentMember.profile_id,
    },
  });

  revalidatePath(`/dashboard/leagues/${leagueSlug}/teams/${teamSlug}/staff`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}/teams/${teamSlug}`);
  revalidatePath(`/dashboard/teams`);
  revalidatePath(`/dashboard`);

  return { success: true, message: "Rol de staff actualizado correctamente." };
}

export async function removeTeamMemberAction(
  leagueSlug: string,
  teamSlug: string,
  _prevState: TeamMemberActionState,
  formData: FormData
): Promise<TeamMemberActionState> {
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

  if (leagueError || !league) {
    return { success: false, message: "Liga no encontrada." };
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id")
    .eq("league_id", league.id)
    .eq("slug", teamSlug)
    .maybeSingle();

  if (teamError || !team) {
    return { success: false, message: "Equipo no encontrado." };
  }

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: league.id,
  });

  if (!canManageTeam(permissions, team.id)) {
    return { success: false, message: "No tienes permisos para remover miembros del staff." };
  }

  const memberId = String(formData.get("memberId") ?? "").trim();

  if (!memberId) {
    return { success: false, message: "ID de miembro no proporcionado." };
  }

  const { data: currentMember, error: currentMemberError } = await supabase
    .from("team_members")
    .select("role, profile_id")
    .eq("id", memberId)
    .eq("team_id", team.id)
    .maybeSingle();

  if (currentMemberError || !currentMember) {
    return { success: false, message: "Miembro no encontrado." };
  }

  if (currentMember.role === "team_admin") {
    const { count, error: countError } = await supabase
      .from("team_members")
      .select("id", { count: "exact", head: true })
      .eq("team_id", team.id)
      .eq("role", "team_admin");

    if (countError || (count ?? 0) <= 1) {
      return {
        success: false,
        message: "No se puede remover al único administrador del equipo.",
      };
    }
  }

  const { error: deleteError } = await supabase
    .from("team_members")
    .delete()
    .eq("id", memberId)
    .eq("team_id", team.id);

  if (deleteError) {
    if (deleteError.code === "42501" || deleteError.message?.toLowerCase().includes("row-level security")) {
      return { success: false, message: "No tienes permisos para remover este miembro." };
    }
    return { success: false, message: "No se pudo remover al miembro del staff." };
  }

  await createAuditLog({
    supabase,
    actorId: user.id,
    leagueId: league.id,
    action: "team_member.removed",
    entityType: "team_member",
    entityId: memberId,
    metadata: {
      league_slug: leagueSlug,
      team_slug: teamSlug,
      team_id: team.id,
      removed_role: currentMember.role,
      target_profile_id: currentMember.profile_id,
    },
  });

  revalidatePath(`/dashboard/leagues/${leagueSlug}/teams/${teamSlug}/staff`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}/teams/${teamSlug}`);
  revalidatePath(`/dashboard/teams`);
  revalidatePath(`/dashboard`);

  return { success: true, message: "Miembro removido del staff correctamente." };
}
