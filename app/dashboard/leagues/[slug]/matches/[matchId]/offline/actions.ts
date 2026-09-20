"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/audit/create-audit-log";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";
import { canOfficiateMatch } from "@/lib/permissions/match-permissions";
import { recalculateStandingsForSeason } from "@/lib/standings/recalculate-standings";
import { createClient } from "@/lib/supabase/server";

export type OfflineEventToSync = {
  id: string;
  teamId?: string | null;
  playerId?: string | null;
  eventType: string;
  minute?: number | null;
  notes?: string | null;
};

export type OfflineScoreToSync = {
  homeScore: number;
  awayScore: number;
  status: string;
};

export type SyncOfflineResult = {
  success: boolean;
  syncedEventIds: string[];
  scoreSynced: boolean;
  error?: string;
};

export async function syncOfflineMatchDataAction(
  leagueSlug: string,
  matchId: string,
  data: {
    events?: OfflineEventToSync[];
    score?: OfflineScoreToSync | null;
  }
): Promise<SyncOfflineResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, league_id, season_id, referee_id, status")
    .eq("id", matchId)
    .single();

  if (matchError || !match) {
    return { success: false, syncedEventIds: [], scoreSynced: false, error: "Partido no encontrado." };
  }

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: match.league_id,
  });

  const canManage =
    permissions.canManageLeague ||
    canOfficiateMatch(permissions, match.referee_id, match.id);

  if (!canManage) {
    return {
      success: false,
      syncedEventIds: [],
      scoreSynced: false,
      error: "No tienes permisos para sincronizar este partido.",
    };
  }

  let scoreSynced = false;
  if (data.score) {
    const { error: scoreErr } = await supabase
      .from("matches")
      .update({
        home_score: data.score.homeScore,
        away_score: data.score.awayScore,
        status: data.score.status as any,
        updated_at: new Date().toISOString(),
      })
      .eq("id", matchId);

    if (!scoreErr) {
      scoreSynced = true;
      if (data.score.status === "completed") {
        await recalculateStandingsForSeason({
          supabase,
          leagueId: match.league_id,
          seasonId: match.season_id,
        });
      }
    }
  }

  const syncedEventIds: string[] = [];
  if (data.events && data.events.length > 0) {
    const toInsert = data.events.map((e) => ({
      match_id: matchId,
      team_id: e.teamId || null,
      player_id: e.playerId || null,
      event_type: e.eventType as any,
      minute: e.minute || null,
      notes: e.notes || null,
      created_by: user.id,
    }));

    const { error: eventsErr } = await supabase.from("match_events").insert(toInsert);
    if (!eventsErr) {
      data.events.forEach((e) => syncedEventIds.push(e.id));
    }
  }

  await createAuditLog({
    supabase,
    actorId: user.id,
    leagueId: match.league_id,
    entityType: "match",
    entityId: matchId,
    action: "match.offline_synced",
    metadata: {
      syncedEvents: syncedEventIds.length,
      scoreSynced,
    },
  });

  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches/${matchId}`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches/${matchId}/events`);
  revalidatePath(`/liga/${leagueSlug}/matches/${matchId}`);

  return {
    success: true,
    syncedEventIds,
    scoreSynced,
  };
}
