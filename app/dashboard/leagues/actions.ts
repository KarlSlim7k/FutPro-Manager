"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAuditLog } from "@/lib/audit/create-audit-log";

const LEAGUE_STATUSES = ["draft", "active", "inactive", "archived"] as const;

export type LeagueStatus = (typeof LEAGUE_STATUSES)[number];

export type LeagueStatusState = { success: boolean; message: string | null };

export async function updateLeagueStatusAction(
  leagueId: string,
  nextStatus: string
): Promise<LeagueStatusState> {
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
    return { success: false, message: "Solo super_admin puede cambiar estados de liga." };
  }

  if (!(LEAGUE_STATUSES as readonly string[]).includes(nextStatus)) {
    return { success: false, message: "Estado inválido." };
  }

  const { data: league, error: leagueError } = await supabase
    .from("leagues")
    .select("id, slug, status")
    .eq("id", leagueId)
    .maybeSingle();

  if (leagueError || !league) {
    return { success: false, message: "Liga no encontrada." };
  }

  if (league.status === nextStatus) {
    return { success: true, message: "La liga ya tiene ese estado." };
  }

  const { error: updateError } = await supabase
    .from("leagues")
    .update({ status: nextStatus as LeagueStatus })
    .eq("id", leagueId);

  if (updateError) {
    if (updateError.code === "42501" || updateError.message?.toLowerCase().includes("row-level security")) {
      return { success: false, message: "No tienes permisos para realizar este cambio." };
    }
    return { success: false, message: "No se pudo actualizar el estado de la liga." };
  }

  revalidatePath("/dashboard/leagues");
  revalidatePath(`/dashboard/leagues/${league.slug}`);

  // Best-effort audit log: si falla, la acción principal ya se completó.
  await createAuditLog({
    supabase,
    actorId: user.id,
    leagueId: league.id,
    action: "league.status_updated",
    entityType: "league",
    entityId: league.id,
    metadata: {
      previous_status: league.status,
      new_status: nextStatus,
    },
  });

  return { success: true, message: "Estado actualizado." };
}
