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

type CreatePlayerField =
  | "full_name"
  | "birth_date"
  | "photo_url"
  | "preferred_position"
  | "dominant_foot"
  | "status";

type CreatePlayerActionState = {
  values: {
    full_name: string;
    birth_date: string;
    photo_url: string;
    preferred_position: string;
    dominant_foot: string;
    status: string;
  };
  fieldErrors: Partial<Record<CreatePlayerField, string>>;
  formError: string | null;
};

function mapInsertErrorMessage(code?: string, message?: string) {
  if (code === "42501") {
    return "RLS bloqueó la creación: no tienes permisos para crear jugadores en esta liga.";
  }

  if (code === "22P02" || code === "23514") {
    return "Los datos enviados no cumplen con las reglas del sistema.";
  }

  if (message?.toLowerCase().includes("permission denied")) {
    return "No tienes permisos para crear jugadores en esta liga.";
  }

  return "No se pudo crear el jugador. Inténtalo nuevamente.";
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

export async function createPlayerAction(
  leagueSlug: string,
  _prevState: CreatePlayerActionState,
  formData: FormData
): Promise<CreatePlayerActionState> {
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

  const fieldErrors: Partial<Record<CreatePlayerField, string>> = {};

  if (!values.full_name) {
    fieldErrors.full_name = "El nombre completo es obligatorio.";
  } else if (values.full_name.length < 3) {
    fieldErrors.full_name = "El nombre completo debe tener al menos 3 caracteres.";
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
      if (!parsedUrl.protocol.startsWith("http")) {
        fieldErrors.photo_url = "La URL de foto debe iniciar con http o https.";
      }
    } catch {
      fieldErrors.photo_url = "Ingresa una URL válida.";
    }
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
      formError: "Liga no encontrada o sin acceso para crear jugadores.",
    };
  }

  const { error: insertError } = await supabase.from("players").insert({
    league_id: league.id,
    full_name: values.full_name,
    birth_date: birthDate,
    photo_url: values.photo_url || null,
    preferred_position: values.preferred_position || null,
    dominant_foot: dominantFoot as DominantFoot | null,
    status: values.status as PlayerStatus,
  });

  if (insertError) {
    return {
      values,
      fieldErrors: {},
      formError: mapInsertErrorMessage(insertError.code, insertError.message),
    };
  }

  revalidatePath(`/dashboard/leagues/${leagueSlug}/players`);
  redirect(`/dashboard/leagues/${leagueSlug}/players`);
}
