"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/audit/create-audit-log";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";
import { createClient } from "@/lib/supabase/server";

export type SaveFixtureMatchInput = {
  homeTeamId: string;
  awayTeamId: string;
  venueId?: string | null;
  scheduledAt: string;
  roundName: string;
};

export type SaveFixtureResult = {
  success: boolean;
  insertedCount: number;
  error?: string;
};

export async function saveGeneratedFixtureAction(
  leagueSlug: string,
  seasonSlug: string,
  matches: SaveFixtureMatchInput[]
): Promise<SaveFixtureResult> {
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
    return { success: false, insertedCount: 0, error: "Liga no encontrada." };
  }

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: league.id,
  });

  if (!permissions.canManageLeague && !permissions.canManageMatches) {
    return {
      success: false,
      insertedCount: 0,
      error: "No tienes permisos para programar partidos en esta liga.",
    };
  }

  const { data: season, error: seasonError } = await supabase
    .from("seasons")
    .select("id, slug")
    .eq("league_id", league.id)
    .eq("slug", seasonSlug)
    .single();

  if (seasonError || !season) {
    return { success: false, insertedCount: 0, error: "Temporada no encontrada." };
  }

  if (matches.length === 0) {
    return { success: false, insertedCount: 0, error: "No se proporcionaron partidos para guardar." };
  }

  const toInsert = matches.map((m) => ({
    league_id: league.id,
    season_id: season.id,
    home_team_id: m.homeTeamId,
    away_team_id: m.awayTeamId,
    venue_id: m.venueId || null,
    scheduled_at: m.scheduledAt,
    round_name: m.roundName,
    stage: "regular_season" as const,
    leg: "single" as const,
    status: "scheduled" as const,
    home_score: 0,
    away_score: 0,
  }));

  const { data: inserted, error: insertError } = await supabase
    .from("matches")
    .insert(toInsert)
    .select("id");

  if (insertError) {
    return {
      success: false,
      insertedCount: 0,
      error: `Error al guardar los partidos: ${insertError.message}`,
    };
  }

  await createAuditLog({
    supabase,
    actorId: user.id,
    leagueId: league.id,
    entityType: "match",
    entityId: season.id,
    action: "match.fixture_generated",
    metadata: {
      seasonId: season.id,
      matchesCount: inserted?.length || 0,
    },
  });

  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}/seasons/${seasonSlug}`);
  revalidatePath(`/liga/${leagueSlug}/matches`);

  return {
    success: true,
    insertedCount: inserted?.length || 0,
  };
}
