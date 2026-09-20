"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/audit/create-audit-log";
import { parsePlayerCsv, type ParsedPlayerRow } from "@/lib/csv/parse-player-csv";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";
import { createClient } from "@/lib/supabase/server";

export type ImportPlayersResult = {
  success: boolean;
  importedCount: number;
  registeredCount: number;
  errors: string[];
};

export async function importPlayersCsvAction(
  leagueSlug: string,
  csvContent: string,
  seasonId?: string
): Promise<ImportPlayersResult> {
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
    return { success: false, importedCount: 0, registeredCount: 0, errors: ["Liga no encontrada."] };
  }

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: league.id,
  });

  if (!permissions.canManagePlayers && !permissions.canManageLeague) {
    return {
      success: false,
      importedCount: 0,
      registeredCount: 0,
      errors: ["No tienes permisos para registrar jugadores en esta liga."],
    };
  }

  const { data: parsedPlayers, errors: parseErrors } = parsePlayerCsv(csvContent);

  if (parseErrors.length > 0) {
    return {
      success: false,
      importedCount: 0,
      registeredCount: 0,
      errors: parseErrors.map((e) => `Fila ${e.row}: ${e.message}`),
    };
  }

  if (parsedPlayers.length === 0) {
    return {
      success: false,
      importedCount: 0,
      registeredCount: 0,
      errors: ["No se encontraron jugadores válidos en el archivo."],
    };
  }

  // Pre-fetch teams of this league for fast lookup
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, slug")
    .eq("league_id", league.id);

  const teamMap = new Map<string, string>();
  (teams || []).forEach((t) => {
    teamMap.set(t.name.toLowerCase().trim(), t.id);
    teamMap.set(t.slug.toLowerCase().trim(), t.id);
  });

  // Prepare player records
  const toInsertPlayers = parsedPlayers.map((p) => {
    const rawName = p.lastName && p.lastName !== "-" 
      ? `${p.firstName} ${p.lastName}`.trim() 
      : p.firstName.trim();
    const fullName = rawName.length >= 3 ? rawName : `${rawName} Doe`;

    return {
      league_id: league.id,
      full_name: fullName,
      preferred_position: p.position || null,
      dominant_foot: p.dominantFoot || null,
      birth_date: p.birthDate || null,
      status: "active" as const,
    };
  });

  const { data: insertedPlayers, error: insertError } = await supabase
    .from("players")
    .insert(toInsertPlayers)
    .select("id, full_name");

  if (insertError) {
    return {
      success: false,
      importedCount: 0,
      registeredCount: 0,
      errors: [`Error al guardar jugadores: ${insertError.message}`],
    };
  }

  let registeredCount = 0;

  // If seasonId is provided, register players to their respective teams
  if (seasonId && insertedPlayers && insertedPlayers.length > 0) {
    const registrationsToInsert: Array<{
      league_id: string;
      season_id: string;
      team_id: string;
      player_id: string;
      jersey_number: number | null;
      status: "active";
    }> = [];

    insertedPlayers.forEach((player, idx) => {
      const parsed = parsedPlayers[idx];
      if (parsed?.teamIdentifier) {
        const teamId = teamMap.get(parsed.teamIdentifier.toLowerCase().trim());
        if (teamId) {
          registrationsToInsert.push({
            league_id: league.id,
            season_id: seasonId,
            team_id: teamId,
            player_id: player.id,
            jersey_number: parsed.preferredNumber || null,
            status: "active",
          });
        }
      }
    });

    if (registrationsToInsert.length > 0) {
      const { data: insertedRegs } = await supabase
        .from("player_team_registrations")
        .insert(registrationsToInsert)
        .select("id");
      registeredCount = insertedRegs?.length || 0;
    }
  }

  await createAuditLog({
    supabase,
    actorId: user.id,
    leagueId: league.id,
    entityType: "player",
    entityId: league.id,
    action: "player.bulk_imported",
    metadata: {
      count: insertedPlayers?.length || 0,
      registeredToSeason: registeredCount,
    },
  });

  revalidatePath(`/dashboard/leagues/${leagueSlug}/players`);

  return {
    success: true,
    importedCount: insertedPlayers?.length || 0,
    registeredCount,
    errors: [],
  };
}
