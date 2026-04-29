"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const EDITABLE_MATCH_STATUS_VALUES = ["scheduled", "postponed", "cancelled"] as const;
type EditableMatchStatus = (typeof EDITABLE_MATCH_STATUS_VALUES)[number];

type UpdateMatchField = "scheduled_at" | "venue_id" | "round_name" | "status";

export type UpdateMatchActionState = {
  values: {
    scheduled_at: string;
    venue_id: string;
    round_name: string;
    status: string;
  };
  fieldErrors: Partial<Record<UpdateMatchField, string>>;
  formError: string | null;
};

function mapUpdateErrorMessage(code?: string, message?: string | null, details?: string | null) {
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

  return "No se pudo actualizar el partido. Inténtalo nuevamente.";
}

export async function updateMatchAction(
  leagueSlug: string,
  matchId: string,
  _prevState: UpdateMatchActionState,
  formData: FormData
): Promise<UpdateMatchActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const values = {
    scheduled_at: String(formData.get("scheduled_at") ?? "").trim(),
    venue_id: String(formData.get("venue_id") ?? "").trim(),
    round_name: String(formData.get("round_name") ?? "").trim(),
    status: String(formData.get("status") ?? "").trim(),
  };

  const fieldErrors: Partial<Record<UpdateMatchField, string>> = {};

  if (!values.scheduled_at) {
    fieldErrors.scheduled_at = "La fecha y hora son obligatorias.";
  }

  if (!EDITABLE_MATCH_STATUS_VALUES.includes(values.status as EditableMatchStatus)) {
    fieldErrors.status = "Selecciona un estado válido para esta fase.";
  }

  if (values.round_name.length > 80) {
    fieldErrors.round_name = "La jornada/ronda no puede exceder 80 caracteres.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      values,
      fieldErrors,
      formError: null,
    };
  }

  const scheduledAtDate = new Date(values.scheduled_at);
  if (Number.isNaN(scheduledAtDate.getTime())) {
    return {
      values,
      fieldErrors: { scheduled_at: "La fecha y hora no son válidas." },
      formError: null,
    };
  }

  const { data: leagueData, error: leagueError } = await supabase
    .from("leagues")
    .select("id")
    .eq("slug", leagueSlug)
    .maybeSingle();

  if (leagueError) {
    throw leagueError;
  }

  if (!leagueData) {
    return {
      values,
      fieldErrors: {},
      formError: "Liga no encontrada o sin acceso para editar partidos.",
    };
  }

  const { data: matchData, error: matchError } = await supabase
    .from("matches")
    .select("id, status")
    .eq("id", matchId)
    .eq("league_id", leagueData.id)
    .maybeSingle();

  if (matchError) {
    throw matchError;
  }

  if (!matchData) {
    return {
      values,
      fieldErrors: {},
      formError: "Partido no encontrado o sin acceso para editar.",
    };
  }

  if (!EDITABLE_MATCH_STATUS_VALUES.includes(matchData.status as EditableMatchStatus)) {
    return {
      values,
      fieldErrors: {},
      formError: "Este partido no se puede editar aquí porque está en juego o finalizado.",
    };
  }

  if (values.venue_id) {
    const { data: venueData, error: venueError } = await supabase
      .from("venues")
      .select("id")
      .eq("id", values.venue_id)
      .eq("league_id", leagueData.id)
      .maybeSingle();

    if (venueError) {
      throw venueError;
    }

    if (!venueData) {
      return {
        values,
        fieldErrors: { venue_id: "La sede no pertenece a esta liga." },
        formError: null,
      };
    }
  }

  const { data: updatedRows, error: updateError } = await supabase
    .from("matches")
    .update({
      scheduled_at: scheduledAtDate.toISOString(),
      venue_id: values.venue_id || null,
      round_name: values.round_name || null,
      status: values.status as EditableMatchStatus,
    })
    .eq("id", matchId)
    .eq("league_id", leagueData.id)
    .select("id");

  if (updateError) {
    return {
      values,
      fieldErrors: {},
      formError: mapUpdateErrorMessage(updateError.code, updateError.message, updateError.details),
    };
  }

  if (!updatedRows?.[0]) {
    return {
      values,
      fieldErrors: {},
      formError: "No tienes permisos para actualizar este partido.",
    };
  }

  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches/${matchId}`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}`);
  revalidatePath("/dashboard");

  redirect(`/dashboard/leagues/${leagueSlug}/matches/${matchId}`);
}
