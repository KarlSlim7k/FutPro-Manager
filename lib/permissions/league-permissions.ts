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
  canManageMembers: boolean;
  canManageRoles: boolean;
  canAssignReferees: boolean;
  canViewRefereeAssignments: boolean;
  isReadOnly: boolean;
  canViewAuditLogs: boolean;
  canManageAuditLogs: boolean;
  // RBAC granular (alineado a RLS; la autoridad final sigue siendo RLS/server actions)
  staffTeamIds: string[];
  managedTeamIds: string[];
  assignedMatchIds: string[];
  canManagePlayers: boolean;
  canManageRegistrations: boolean;
  canCreateMatchEvents: boolean;
  canUpdateMatchResults: boolean;
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

    // RBAC granular: equipos donde el usuario es staff + partidos asignados como árbitro.
    // Best-effort y fail-closed: si RLS bloquea la lectura, se devuelve vacío (= comportamiento anterior).
    let staffTeamIds: string[] = [];
    let managedTeamIds: string[] = [];
    let assignedMatchIds: string[] = [];

    if (!canManageLeague) {
      try {
        const { data: teamRows } = await supabase
          .from("team_members")
          .select("team_id, role, teams!inner(league_id)")
          .eq("profile_id", userId)
          .eq("teams.league_id", leagueId);
        const rows = (teamRows ?? []) as Array<{ team_id: string; role: AppRole }>;
        staffTeamIds = rows.filter((r) => r.role === "team_admin" || r.role === "coach").map((r) => r.team_id);
        managedTeamIds = rows.filter((r) => r.role === "team_admin").map((r) => r.team_id);
      } catch {
        staffTeamIds = [];
        managedTeamIds = [];
      }

      try {
        const { data: matchRows } = await supabase
          .from("matches")
          .select("id")
          .eq("league_id", leagueId)
          .eq("referee_id", userId);
        assignedMatchIds = ((matchRows ?? []) as Array<{ id: string }>).map((m) => m.id);
      } catch {
        assignedMatchIds = [];
      }
    }

    const isTeamStaff = staffTeamIds.length > 0;
    const isAssignedReferee = assignedMatchIds.length > 0;

    const canManagePlayers = canManageLeague || isTeamStaff;
    const canManageRegistrations = canManageLeague || isTeamStaff;
    const canCreateMatchEvents = canManageLeague || isTeamStaff || isAssignedReferee;
    const canUpdateMatchResults = canManageLeague || isAssignedReferee;

    return {
      globalRole,
      leagueRole,
      canManageLeague,
      canManageCatalog: canManageLeague,
      canManageMatches: canManageLeague,
      canUpdateResults: canUpdateMatchResults,
      canManageEvents: canCreateMatchEvents,
      canRecalculateStandings: canManageLeague,
      canManageMembers: canManageLeague,
      canManageRoles: canManageLeague,
      canAssignReferees: canManageLeague,
      canViewRefereeAssignments: isSuperAdmin || leagueRole !== null,
      isReadOnly: !(
        canManageLeague ||
        isTeamStaff ||
        isAssignedReferee
      ),
      canViewAuditLogs: canManageLeague,
      canManageAuditLogs: canManageLeague,
      staffTeamIds,
      managedTeamIds,
      assignedMatchIds,
      canManagePlayers,
      canManageRegistrations,
      canCreateMatchEvents,
      canUpdateMatchResults,
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
    canManageMembers: false,
    canManageRoles: false,
    canAssignReferees: false,
    canViewRefereeAssignments: false,
    isReadOnly: true,
    canViewAuditLogs: false,
    canManageAuditLogs: false,
    staffTeamIds: [],
    managedTeamIds: [],
    assignedMatchIds: [],
    canManagePlayers: false,
    canManageRegistrations: false,
    canCreateMatchEvents: false,
    canUpdateMatchResults: false,
  };
}
