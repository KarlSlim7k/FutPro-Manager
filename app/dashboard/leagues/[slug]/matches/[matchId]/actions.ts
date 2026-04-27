"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MATCH_STATUS_VALUES, type MatchStatus } from "@/types/database";

type UpdateResultField = "home_score" | "away_score" | "status";

type UpdateResultActionState = {
  values: {
    home_score: string;
    away_score: string;
    status: string;
  };
  fieldErrors: Partial<Record<UpdateResultField, string>>;
  formError: string | null;
  success: boolean;
};

function mapUpdateErrorMessage(
  code?: string,
  message?: string | null,
  details?: string | null
) {
  const normalizedErrorText = `${message ?? ""} ${details ?? ""}`.toLowerCase();

  if (code === "42501") {
    return "No tienes permisos para actualizar este partido.";
  }

  if (
    normalizedErrorText.includes("row-level security") ||
    normalizedErrorText.includes("permission denied")
  ) {
    return "No tienes permisos para actualizar este partido.";
  }

  if (
    normalizedErrorText.includes("trigger") ||
    normalizedErrorText.includes("ensure_match_update_scope")
  ) {
    return "Solo puedes actualizar marcador y estado del partido.";
  }

  return "No se pudo actualizar el resultado. Inténtalo nuevamente.";
}

export async function updateMatchResultAction(
  leagueSlug: string,
  matchId: string,
  _prevState: UpdateResultActionState,
  formData: FormData
): Promise<UpdateResultActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const values = {
    home_score: String(formData.get("home_score") ?? "").trim(),
    away_score: String(formData.get("away_score") ?? "").trim(),
    status: String(formData.get("status") ?? "").trim(),
  };

  const fieldErrors: Partial<Record<UpdateResultField, string>> = {};

  if (values.home_score === "") {
    fieldErrors.home_score = "El marcador local es obligatorio.";
  } else {
    const num = Number(values.home_score);
    if (!Number.isInteger(num) || num < 0 || num > 99) {
      fieldErrors.home_score = "El marcador debe estar entre 0 y 99.";
    }
  }

  if (values.away_score === "") {
    fieldErrors.away_score = "El marcador visitante es obligatorio.";
  } else {
    const num = Number(values.away_score);
    if (!Number.isInteger(num) || num < 0 || num > 99) {
      fieldErrors.away_score = "El marcador debe estar entre 0 y 99.";
    }
  }

  if (!MATCH_STATUS_VALUES.includes(values.status as MatchStatus)) {
    fieldErrors.status = "Selecciona un estado válido.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      values,
      fieldErrors,
      formError: null,
      success: false,
    };
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
      values,
      fieldErrors: {},
      formError: "Liga no encontrada o sin acceso.",
      success: false,
    };
  }

  const { data: matchData, error: matchError } = await supabase
    .from("matches")
    .select("id")
    .eq("id", matchId)
    .eq("league_id", league.id)
    .maybeSingle();

  if (matchError) {
    throw matchError;
  }

  if (!matchData) {
    return {
      values,
      fieldErrors: {},
      formError: "Partido no encontrado o sin acceso.",
      success: false,
    };
  }

  const { error: updateError } = await supabase
    .from("matches")
    .update({
      home_score: Number(values.home_score),
      away_score: Number(values.away_score),
      status: values.status as MatchStatus,
    })
    .eq("id", matchId);

  if (updateError) {
    return {
      values,
      fieldErrors: {},
      formError: mapUpdateErrorMessage(
        updateError.code,
        updateError.message,
        updateError.details
      ),
      success: false,
    };
  }

  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches/${matchId}`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches`);
  revalidatePath("/dashboard");

  return {
    values,
    fieldErrors: {},
    formError: null,
    success: true,
  };
}
