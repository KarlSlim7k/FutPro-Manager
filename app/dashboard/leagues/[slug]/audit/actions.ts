"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";

export type PurgeAuditState = {
  success: boolean;
  message: string | null;
  deletedCount?: number;
};

const ALLOWED_DAYS = [90, 180, 365] as const;

export async function purgeAuditLogsAction(
  leagueSlug: string,
  _prevState: PurgeAuditState,
  formData: FormData
): Promise<PurgeAuditState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const days = Number(String(formData.get("days") ?? ""));
  if (!ALLOWED_DAYS.includes(days as (typeof ALLOWED_DAYS)[number])) {
    return { success: false, message: "Selecciona un rango de retención válido (90, 180 o 365 días)." };
  }

  const { data: league } = await supabase.from("leagues").select("id").eq("slug", leagueSlug).maybeSingle();
  if (!league) {
    return { success: false, message: "Liga no encontrada." };
  }

  const permissions = await getLeaguePermissions({ supabase, userId: user.id, leagueId: league.id });
  if (!permissions.canManageLeague) {
    return { success: false, message: "No tienes permisos para purgar la auditoría." };
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const { data: deleted, error: deleteError } = await supabase
    .from("audit_logs")
    .delete()
    .eq("league_id", league.id)
    .lt("created_at", cutoff.toISOString())
    .select("id");

  if (deleteError) {
    return { success: false, message: "No se pudo purgar la auditoría. Intenta nuevamente." };
  }

  const deletedCount = deleted?.length ?? 0;

  // Registrar la purga (best-effort; este registro queda como el más reciente)
  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    league_id: league.id,
    action: "audit.purged",
    entity_type: "league",
    entity_id: league.id,
    metadata: { days, deleted_count: deletedCount, league_slug: leagueSlug },
  });

  revalidatePath(`/dashboard/leagues/${leagueSlug}/audit`);
  return {
    success: true,
    message:
      deletedCount === 0
        ? `No había registros anteriores a ${days} días.`
        : `Se eliminaron ${deletedCount} registro(s) anteriores a ${days} días.`,
    deletedCount,
  };
}
