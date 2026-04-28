"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  DOMINANT_FOOT_VALUES,
  PLAYER_STATUS_VALUES,
  type DominantFoot,
  type PlayerStatus,
} from "@/types/database";

type UpdatePlayerField =
  | "full_name"
  | "birth_date"
  | "photo_url"
  | "preferred_position"
  | "dominant_foot"
  | "status";

export type UpdatePlayerActionState = {
  values: {
    full_name: string;
    birth_date: string;
    photo_url: string;
    preferred_position: string;
    dominant_foot: string;
    status: string;
  };
  fieldErrors: Partial<Record<UpdatePlayerField, string>>;
  formError: string | null;
};

function mapUpdateErrorMessage(code?: string, message?: string | null, details?: string | null) {
  const normalizedErrorText = `${message ?? ""} ${details ?? ""}`.toLowerCase();

  if (code === "42501") {
    return "No tienes permisos para actualizar este jugador.";
  }

  if (code === "22P02" || code === "23514") {
    return "Los datos enviados no cumplen con las reglas del sistema.";
  }

  if (
    normalizedErrorText.includes("row-level security") ||
    normalizedErrorText.includes("permission denied")
  ) {
    return "No tienes permisos para actualizar este jugador.";
  }

  return "No se pudo actualizar el jugador. Inténtalo nuevamente.";
}

function parseDateInput(value: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() + 1 !== month ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export async function updatePlayerAction(
  leagueSlug: string,
  playerId: string,
  _prevState: UpdatePlayerActionState,
  formData: FormData
): Promise<UpdatePlayerActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const values = {
    full_name: String(formData.get("full_name") ?? "").trim(),
    birth_date: String(formData.get("birth_date") ?? "").trim(),
    photo_url: String(formData.get("photo_url") ?? "").trim(),
    preferred_position: String(formData.get("preferred_position") ?? "").trim(),
    dominant_foot: String(formData.get("dominant_foot") ?? "").trim(),
    status: String(formData.get("status") ?? "").trim(),
  };

  const fieldErrors: Partial<Record<UpdatePlayerField, string>> = {};

  if (!values.full_name) {
    fieldErrors.full_name = "El nombre completo es obligatorio.";
  } else if (values.full_name.length < 2) {
    fieldErrors.full_name = "El nombre completo debe tener al menos 2 caracteres.";
  }

  let birthDate: string | null = null;
  if (values.birth_date) {
    const parsedDate = parseDateInput(values.birth_date);

    if (!parsedDate) {
      fieldErrors.birth_date = "Ingresa una fecha válida.";
    } else {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      if (parsedDate.getTime() > today.getTime()) {
        fieldErrors.birth_date = "La fecha de nacimiento no puede ser futura.";
      } else {
        birthDate = values.birth_date;
      }
    }
  }

  if (values.photo_url) {
    try {
      const parsedUrl = new URL(values.photo_url);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        fieldErrors.photo_url = "La URL de foto debe iniciar con http o https.";
      }
    } catch {
      fieldErrors.photo_url = "Ingresa una URL válida.";
    }
  }

  if (values.preferred_position.length > 50) {
    fieldErrors.preferred_position = "La posición preferida no puede superar 50 caracteres.";
  }

  const dominantFoot = values.dominant_foot || null;
  if (dominantFoot && !DOMINANT_FOOT_VALUES.includes(dominantFoot as DominantFoot)) {
    fieldErrors.dominant_foot = "Selecciona un perfil dominante válido.";
  }

  if (!PLAYER_STATUS_VALUES.includes(values.status as PlayerStatus)) {
    fieldErrors.status = "Selecciona un estado válido.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      values,
      fieldErrors,
      formError: null,
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
      formError: "Liga no encontrada o sin acceso para editar jugadores.",
    };
  }

  const { data: currentPlayer, error: currentPlayerError } = await supabase
    .from("players")
    .select("id")
    .eq("league_id", league.id)
    .eq("id", playerId)
    .maybeSingle();

  if (currentPlayerError) {
    throw currentPlayerError;
  }

  if (!currentPlayer) {
    return {
      values,
      fieldErrors: {},
      formError: "Jugador no encontrado o sin acceso para editar.",
    };
  }

  const { data: updatedRows, error: updateError } = await supabase
    .from("players")
    .update({
      full_name: values.full_name,
      birth_date: birthDate,
      photo_url: values.photo_url || null,
      preferred_position: values.preferred_position || null,
      dominant_foot: dominantFoot as DominantFoot | null,
      status: values.status as PlayerStatus,
    })
    .eq("id", currentPlayer.id)
    .eq("league_id", league.id)
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
      formError: "No tienes permisos para actualizar este jugador.",
    };
  }

  const playerDetailPath = `/dashboard/leagues/${leagueSlug}/players/${currentPlayer.id}`;
  revalidatePath(`/dashboard/leagues/${leagueSlug}/players`);
  revalidatePath(playerDetailPath);
  revalidatePath(`/dashboard/leagues/${leagueSlug}`);
  revalidatePath("/dashboard");

  redirect(playerDetailPath);
}
