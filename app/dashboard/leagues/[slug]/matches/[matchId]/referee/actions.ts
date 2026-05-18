"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";
import { createAuditLog } from "@/lib/audit/create-audit-log";

export type UpdateRefereeState = {
  success: boolean;
  message: string | null;
};

export async function updateMatchRefereeAction(
  leagueSlug: string,
  matchId: string,
  prevState: UpdateRefereeState,
  formData: FormData
): Promise<UpdateRefereeState> {
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

  if (!permissions.canAssignReferees) {
    return { success: false, message: "No tienes permisos para asignar arbitros." };
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, referee_id")
    .eq("id", matchId)
    .eq("league_id", league.id)
    .maybeSingle();

  if (matchError) {
    return { success: false, message: "Error al buscar el partido." };
  }

  if (!match) {
    return { success: false, message: "Partido no encontrado en esta liga." };
  }

  const previousRefereeId = match.referee_id ?? null;

  const rawRefereeId = String(formData.get("refereeId") ?? "").trim();
  const refereeId = rawRefereeId === "" || rawRefereeId === "none" ? null : rawRefereeId;

  if (refereeId) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(refereeId)) {
      return { success: false, message: "ID de arbitro no valido." };
    }

    const { data: member, error: memberError } = await supabase
      .from("league_members")
      .select("role")
      .eq("profile_id", refereeId)
      .eq("league_id", league.id)
      .maybeSingle();

    if (memberError) {
      return { success: false, message: "Error al verificar el miembro." };
    }

    if (!member) {
      return { success: false, message: "El usuario no es miembro de esta liga." };
    }

    const allowedRoles = ["referee", "league_admin"];
    if (!allowedRoles.includes(member.role)) {
      return {
        success: false,
        message: "Solo se puede asignar como arbitro a miembros con rol referee o league_admin.",
      };
    }
  }

  const { error: updateError } = await supabase
    .from("matches")
    .update({ referee_id: refereeId })
    .eq("id", matchId)
    .eq("league_id", league.id);

  if (updateError) {
    if (
      updateError.code === "42501" ||
      updateError.message?.toLowerCase().includes("row-level security")
    ) {
      return { success: false, message: "No tienes permisos para realizar este cambio." };
    }
    return { success: false, message: "No se pudo actualizar el arbitro. Intenta nuevamente." };
  }

  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches/${matchId}`);

  // Best-effort audit log
  await createAuditLog({
    supabase,
    actorId: user.id,
    leagueId: league.id,
    action: refereeId ? "match.referee_updated" : "match.referee_removed",
    entityType: "match",
    entityId: matchId,
    metadata: {
      previous_referee_id: previousRefereeId,
      new_referee_id: refereeId ?? null,
      league_slug: leagueSlug,
    },
  });

  return { success: true, message: "Arbitro actualizado correctamente." };
}
