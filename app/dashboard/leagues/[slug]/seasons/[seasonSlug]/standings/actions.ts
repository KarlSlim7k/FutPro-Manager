"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recalculateStandingsForSeason } from "@/lib/standings/recalculate-standings";
import { createClient } from "@/lib/supabase/server";

export type RecalculateActionState = {
  formError: string | null;
  success: boolean;
  message: string | null;
  teamsCount: number;
  matchesCount: number;
};

function mapRecalculateErrorMessage(
  code?: string,
  message?: string | null,
  details?: string | null
) {
  const normalizedErrorText = `${message ?? ""} ${details ?? ""}`.toLowerCase();

  if (code === "42501") {
    return "No tienes permisos para recalcular la tabla de esta temporada.";
  }

  if (
    normalizedErrorText.includes("row-level security") ||
    normalizedErrorText.includes("permission denied")
  ) {
    return "No tienes permisos para recalcular la tabla de esta temporada.";
  }

  if (normalizedErrorText.includes("unique")) {
    return "Error de integridad al guardar la tabla de posiciones.";
  }

  if (code === "NO_TEAMS") {
    return "No hay equipos registrados para calcular la tabla.";
  }

  return "No se pudo guardar la tabla de posiciones.";
}

export async function recalculateStandingsAction(
  leagueSlug: string,
  seasonSlug: string,
  prevState: RecalculateActionState,
  formData: FormData
): Promise<RecalculateActionState> {
  void prevState;
  void formData;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: league, error: leagueError } = await supabase
    .from("leagues")
    .select("id")
    .eq("slug", leagueSlug)
    .maybeSingle();

  if (leagueError) {
    throw leagueError;
  }

  if (!league) {
    return {
      formError: "Liga no encontrada o sin acceso.",
      success: false,
      message: null,
      teamsCount: 0,
      matchesCount: 0,
    };
  }

  const { data: season, error: seasonError } = await supabase
    .from("seasons")
    .select("id")
    .eq("league_id", league.id)
    .eq("slug", seasonSlug)
    .maybeSingle();

  if (seasonError) {
    throw seasonError;
  }

  if (!season) {
    return {
      formError: "Temporada no encontrada o sin acceso.",
      success: false,
      message: null,
      teamsCount: 0,
      matchesCount: 0,
    };
  }

  const recalculateResult = await recalculateStandingsForSeason({
    supabase,
    leagueId: league.id,
    seasonId: season.id,
  });

  if (!recalculateResult.success) {
    return {
      formError: mapRecalculateErrorMessage(
        recalculateResult.error?.code,
        recalculateResult.error?.message,
        recalculateResult.error?.details
      ),
      success: false,
      message: null,
      teamsCount: recalculateResult.teamsCount,
      matchesCount: recalculateResult.matchesCount,
    };
  }

  revalidatePath(`/dashboard/leagues/${leagueSlug}/seasons/${seasonSlug}/standings`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}/seasons/${seasonSlug}`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}`);

  return {
    formError: null,
    success: true,
    message: `Tabla recalculada correctamente: ${recalculateResult.teamsCount} equipos, ${recalculateResult.matchesCount} partidos finalizados.`,
    teamsCount: recalculateResult.teamsCount,
    matchesCount: recalculateResult.matchesCount,
  };
}
