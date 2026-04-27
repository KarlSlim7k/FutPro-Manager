"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type CreateVenueField = "name" | "address" | "city" | "state" | "latitude" | "longitude";

type CreateVenueActionState = {
  values: {
    name: string;
    address: string;
    city: string;
    state: string;
    latitude: string;
    longitude: string;
  };
  fieldErrors: Partial<Record<CreateVenueField, string>>;
  formError: string | null;
};

function mapInsertErrorMessage(code?: string, message?: string | null, details?: string | null) {
  const normalizedErrorText = `${message ?? ""} ${details ?? ""}`.toLowerCase();

  if (code === "42501") {
    return "RLS bloqueó la creación: no tienes permisos para crear sedes en esta liga.";
  }

  if (code === "22P02" || code === "23514") {
    return "Los datos enviados no cumplen con las reglas del sistema.";
  }

  if (
    normalizedErrorText.includes("row-level security") ||
    normalizedErrorText.includes("permission denied")
  ) {
    return "No tienes permisos para crear sedes en esta liga.";
  }

  return "No se pudo crear la sede. Inténtalo nuevamente.";
}

export async function createVenueAction(
  leagueSlug: string,
  _prevState: CreateVenueActionState,
  formData: FormData
): Promise<CreateVenueActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const values = {
    name: String(formData.get("name") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim(),
    latitude: String(formData.get("latitude") ?? "").trim(),
    longitude: String(formData.get("longitude") ?? "").trim(),
  };

  const fieldErrors: Partial<Record<CreateVenueField, string>> = {};

  if (!values.name) {
    fieldErrors.name = "El nombre es obligatorio.";
  } else if (values.name.length < 2) {
    fieldErrors.name = "El nombre debe tener al menos 2 caracteres.";
  }

  const hasLatitude = values.latitude.length > 0;
  const hasLongitude = values.longitude.length > 0;
  let latitude: number | null = null;
  let longitude: number | null = null;

  if (hasLatitude !== hasLongitude) {
    const message = "Ambas coordenadas deben ir juntas: latitud y longitud.";
    fieldErrors.latitude = message;
    fieldErrors.longitude = message;
  } else if (hasLatitude && hasLongitude) {
    const parsedLatitude = Number(values.latitude);
    const parsedLongitude = Number(values.longitude);

    if (!Number.isFinite(parsedLatitude)) {
      fieldErrors.latitude = "La latitud debe ser un número válido.";
    } else if (parsedLatitude < -90 || parsedLatitude > 90) {
      fieldErrors.latitude = "La latitud debe estar entre -90 y 90.";
    } else {
      latitude = parsedLatitude;
    }

    if (!Number.isFinite(parsedLongitude)) {
      fieldErrors.longitude = "La longitud debe ser un número válido.";
    } else if (parsedLongitude < -180 || parsedLongitude > 180) {
      fieldErrors.longitude = "La longitud debe estar entre -180 y 180.";
    } else {
      longitude = parsedLongitude;
    }
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
      formError: "Liga no encontrada o sin acceso para crear sedes.",
    };
  }

  const { error: insertError } = await supabase.from("venues").insert({
    league_id: league.id,
    name: values.name,
    address: values.address || null,
    city: values.city || null,
    state: values.state || null,
    latitude,
    longitude,
  });

  if (insertError) {
    return {
      values,
      fieldErrors: {},
      formError: mapInsertErrorMessage(insertError.code, insertError.message, insertError.details),
    };
  }

  revalidatePath(`/dashboard/leagues/${leagueSlug}`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}/venues`);
  redirect(`/dashboard/leagues/${leagueSlug}/venues`);
}
