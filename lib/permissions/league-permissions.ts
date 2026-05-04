import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppRole } from "@/types/database";

export type LeaguePermissions = {
  globalRole: AppRole | null;
  leagueRole: AppRole | null;
  canManageLeague: boolean;
  canManageCatalog: boolean;
  canManageMatches: boolean;
  canUpdateResults: boolean;
  canManageEvents: boolean;
  canRecalculateStandings: boolean;
  isReadOnly: boolean;
};

export async function getLeaguePermissions({
  supabase,
  userId,
  leagueId,
}: {
  supabase: SupabaseClient;
  userId: string;
  leagueId: string;
}): Promise<LeaguePermissions> {
  try {
    const [{ data: profileData, error: profileError }, { data: membershipData, error: membershipError }] =
      await Promise.all([
        supabase.from("profiles").select("global_role").eq("id", userId).maybeSingle(),
        supabase.from("league_members").select("role").eq("league_id", leagueId).eq("profile_id", userId).maybeSingle(),
      ]);

    // Si falla por RLS u otro motivo, no romper la página; devolver permisos mínimos seguros.
    if (profileError || membershipError) {
      return safePermissions();
    }

    const globalRole = (profileData?.global_role as AppRole | null) ?? null;
    const leagueRole = (membershipData?.role as AppRole | null) ?? null;

    const isSuperAdmin = globalRole === "super_admin";
    const isLeagueAdmin = leagueRole === "league_admin";

    const canManageLeague = isSuperAdmin || isLeagueAdmin;

    return {
      globalRole,
      leagueRole,
      canManageLeague,
      canManageCatalog: canManageLeague,
      canManageMatches: canManageLeague,
      canUpdateResults: canManageLeague,
      canManageEvents: canManageLeague,
      canRecalculateStandings: canManageLeague,
      isReadOnly: !canManageLeague,
    };
  } catch {
    return safePermissions();
  }
}

function safePermissions(): LeaguePermissions {
  return {
    globalRole: null,
    leagueRole: null,
    canManageLeague: false,
    canManageCatalog: false,
    canManageMatches: false,
    canUpdateResults: false,
    canManageEvents: false,
    canRecalculateStandings: false,
    isReadOnly: true,
  };
}
