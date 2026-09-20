"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/audit/create-audit-log";
import { parseTeamCsv, type ParsedTeamRow } from "@/lib/csv/parse-team-csv";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";
import { createClient } from "@/lib/supabase/server";

export type ImportTeamsResult = {
  success: boolean;
  importedCount: number;
  errors: string[];
};

export async function importTeamsCsvAction(
  leagueSlug: string,
  csvContent: string
): Promise<ImportTeamsResult> {
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
    return { success: false, importedCount: 0, errors: ["Liga no encontrada."] };
  }

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: league.id,
  });

  if (!permissions.canManageLeague) {
    return {
      success: false,
      importedCount: 0,
      errors: ["No tienes permisos administrativos para importar equipos en esta liga."],
    };
  }

  const { data: parsedTeams, errors: parseErrors } = parseTeamCsv(csvContent);

  if (parseErrors.length > 0) {
    return {
      success: false,
      importedCount: 0,
      errors: parseErrors.map((e) => `Fila ${e.row}: ${e.message}`),
    };
  }

  if (parsedTeams.length === 0) {
    return {
      success: false,
      importedCount: 0,
      errors: ["No se encontraron equipos válidos en el archivo."],
    };
  }

  // Check existing slugs in this league to prevent collision
  const { data: existingTeams } = await supabase
    .from("teams")
    .select("slug")
    .eq("league_id", league.id);

  const existingSlugs = new Set((existingTeams || []).map((t) => t.slug));

  const toInsert = parsedTeams.map((team) => {
    let finalSlug = team.slug;
    let counter = 1;
    while (existingSlugs.has(finalSlug)) {
      finalSlug = `${team.slug}-${counter}`;
      counter++;
    }
    existingSlugs.add(finalSlug);

    return {
      league_id: league.id,
      name: team.name,
      slug: finalSlug,
      primary_color: team.primaryColor || null,
      secondary_color: team.secondaryColor || null,
      founded_year: team.foundedYear || null,
      status: team.status,
    };
  });

  const { data: inserted, error: insertError } = await supabase
    .from("teams")
    .insert(toInsert)
    .select("id, name, slug");

  if (insertError) {
    return {
      success: false,
      importedCount: 0,
      errors: [`Error al guardar en base de datos: ${insertError.message}`],
    };
  }

  await createAuditLog({
    supabase,
    actorId: user.id,
    leagueId: league.id,
    entityType: "team",
    entityId: league.id,
    action: "team.bulk_imported",
    metadata: {
      count: inserted?.length || 0,
      teams: (inserted || []).map((t) => ({ id: t.id, name: t.name })),
    },
  });

  revalidatePath(`/dashboard/leagues/${leagueSlug}/teams`);
  revalidatePath(`/liga/${leagueSlug}/teams`);

  return {
    success: true,
    importedCount: inserted?.length || 0,
    errors: [],
  };
}
