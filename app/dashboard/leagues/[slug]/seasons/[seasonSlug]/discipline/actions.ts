"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/audit/create-audit-log";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";
import { createClient } from "@/lib/supabase/server";

export type ToggleSuspensionResult = {
  success: boolean;
  newStatus?: string;
  error?: string;
};

export async function togglePlayerSuspensionAction(
  leagueSlug: string,
  seasonSlug: string,
  playerId: string,
  currentStatus: string,
  reason?: string
): Promise<ToggleSuspensionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: league, error: leagueError } = await supabase
    .from("leagues")
    .select("id, slug")
    .eq("slug", leagueSlug)
    .single();

  if (leagueError || !league) {
    return { success: false, error: "Liga no encontrada." };
  }

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: league.id,
  });

  if (!permissions.canManageLeague) {
    return { success: false, error: "No tienes permisos disciplinarios en esta liga." };
  }

  const newStatus = currentStatus === "suspended" ? "active" : "suspended";

  // Update player status in players table
  const { error: updateError } = await supabase
    .from("players")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", playerId)
    .eq("league_id", league.id);

  if (updateError) {
    return { success: false, error: `Error al actualizar: ${updateError.message}` };
  }

  await createAuditLog({
    supabase,
    actorId: user.id,
    leagueId: league.id,
    entityType: "player",
    entityId: playerId,
    action: newStatus === "suspended" ? "player.suspended_manually" : "player.pardoned",
    metadata: {
      previousStatus: currentStatus,
      newStatus,
      reason: reason || "Ajuste por comité disciplinario de la liga",
    },
  });

  revalidatePath(`/dashboard/leagues/${leagueSlug}/seasons/${seasonSlug}/discipline`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}/players`);

  return {
    success: true,
    newStatus,
  };
}
