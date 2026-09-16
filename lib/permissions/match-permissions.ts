import type { SupabaseClient } from "@supabase/supabase-js";
import { getLeaguePermissions, type LeaguePermissions } from "./league-permissions";

export type MatchPermissions = {
  canUpdateResult: boolean;
  canManageEvents: boolean;
  isAssignedReferee: boolean;
  isTeamStaffForMatch: boolean;
  canOfficiate: boolean;
};

/**
 * Indica si el usuario puede oficiar un partido: admin de liga/super_admin,
 * árbitro asignado, o referee de liga cuando el partido no tiene árbitro
 * asignado (refleja `can_manage_match` de RLS).
 */
export function canOfficiateMatch(
  permissions: LeaguePermissions,
  userId: string,
  refereeId: string | null
): boolean {
  if (permissions.canManageLeague) return true;
  if (refereeId === userId) return true;
  if (refereeId === null && permissions.leagueRole === "referee") return true;
  return false;
}

/**
 * Permisos finos por partido (UX solamente; RLS/server actions son la autoridad).
 * - Resultado: league_admin/super_admin o árbitro asignado (match.referee_id = userId).
 * - Eventos: lo anterior + team_admin/coach de un equipo participante.
 */
export async function getMatchPermissions({
  supabase,
  userId,
  leagueId,
  matchId,
}: {
  supabase: SupabaseClient;
  userId: string;
  leagueId: string;
  matchId: string;
}): Promise<MatchPermissions> {
  const leaguePerms = await getLeaguePermissions({ supabase, userId, leagueId });

  if (leaguePerms.canManageLeague) {
    return {
      canUpdateResult: true,
      canManageEvents: true,
      isAssignedReferee: leaguePerms.assignedMatchIds.includes(matchId),
      isTeamStaffForMatch: false,
      canOfficiate: true,
    };
  }

  let match: { referee_id: string | null; home_team_id: string; away_team_id: string } | null = null;
  try {
    const { data } = await supabase
      .from("matches")
      .select("referee_id, home_team_id, away_team_id")
      .eq("id", matchId)
      .eq("league_id", leagueId)
      .maybeSingle();
    const row = data as { referee_id: string | null; home_team_id: string; away_team_id: string } | null;
    match = row ?? null;
  } catch {
    match = null;
  }

  if (!match) {
    // Sin datos del partido no se puede verificar si está sin asignar: fail-closed.
    const isAssigned = leaguePerms.assignedMatchIds.includes(matchId);
    return {
      canUpdateResult: isAssigned,
      canManageEvents: isAssigned || leaguePerms.staffTeamIds.length > 0,
      isAssignedReferee: isAssigned,
      isTeamStaffForMatch: false,
      canOfficiate: isAssigned,
    };
  }

  const isAssignedReferee =
    match.referee_id === userId || leaguePerms.assignedMatchIds.includes(matchId);
  const isTeamStaffForMatch = leaguePerms.staffTeamIds.some(
    (teamId) => teamId === match.home_team_id || teamId === match.away_team_id
  );
  const canOfficiate = canOfficiateMatch(leaguePerms, userId, match.referee_id);

  return {
    canUpdateResult: canOfficiate,
    canManageEvents: canOfficiate || isTeamStaffForMatch,
    isAssignedReferee,
    isTeamStaffForMatch,
    canOfficiate,
  };
}
