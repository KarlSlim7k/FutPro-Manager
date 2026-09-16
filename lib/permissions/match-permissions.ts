import type { SupabaseClient } from "@supabase/supabase-js";
import { getLeaguePermissions } from "./league-permissions";

export type MatchPermissions = {
  canUpdateResult: boolean;
  canManageEvents: boolean;
  isAssignedReferee: boolean;
  isTeamStaffForMatch: boolean;
};

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
    return {
      canUpdateResult: leaguePerms.assignedMatchIds.includes(matchId),
      canManageEvents:
        leaguePerms.assignedMatchIds.includes(matchId) || leaguePerms.staffTeamIds.length > 0,
      isAssignedReferee: leaguePerms.assignedMatchIds.includes(matchId),
      isTeamStaffForMatch: false,
    };
  }

  const isAssignedReferee =
    match.referee_id === userId || leaguePerms.assignedMatchIds.includes(matchId);
  const isTeamStaffForMatch = leaguePerms.staffTeamIds.some(
    (teamId) => teamId === match.home_team_id || teamId === match.away_team_id
  );

  return {
    canUpdateResult: isAssignedReferee,
    canManageEvents: isAssignedReferee || isTeamStaffForMatch,
    isAssignedReferee,
    isTeamStaffForMatch,
  };
}
