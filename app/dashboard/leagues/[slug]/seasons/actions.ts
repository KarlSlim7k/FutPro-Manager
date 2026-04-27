"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SEASON_STATUS_VALUES, type SeasonStatus } from "@/types/database";

type CreateSeasonField = "name" | "slug" | "start_date" | "end_date" | "status";

type CreateSeasonActionState = {
  values: {
    name: string;
    slug: string;
    start_date: string;
    end_date: string;
    status: string;
  };
  fieldErrors: Partial<Record<CreateSeasonField, string>>;
  formError: string | null;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function mapInsertErrorMessage(code?: string, message?: string) {
  if (code === "42501") {
    return "RLS bloqueó la creación: no tienes permisos para crear temporadas en esta liga.";
  }

  if (code === "23505") {
    return "Ya existe una temporada con ese slug dentro de esta liga.";
  }

  if (code === "22P02" || code === "23514") {
    return "Los datos enviados no cumplen con las reglas del sistema.";
  }

  if (message?.toLowerCase().includes("permission denied")) {
    return "No tienes permisos para crear temporadas en esta liga.";
  }

  return "No se pudo crear la temporada. Inténtalo nuevamente.";
}

export async function createSeasonAction(
  leagueSlug: string,
  _prevState: CreateSeasonActionState,
  formData: FormData
): Promise<CreateSeasonActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const values = {
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    start_date: String(formData.get("start_date") ?? "").trim(),
    end_date: String(formData.get("end_date") ?? "").trim(),
    status: String(formData.get("status") ?? "").trim(),
  };

  const fieldErrors: Partial<Record<CreateSeasonField, string>> = {};

  if (!values.name) {
    fieldErrors.name = "El nombre es obligatorio.";
  }

  if (!values.slug) {
    fieldErrors.slug = "El slug es obligatorio.";
  } else if (!SLUG_PATTERN.test(values.slug)) {
    fieldErrors.slug = "Usa formato lowercase-kebab-case (ejemplo: temporada-2026).";
  }

  if (!values.start_date) {
    fieldErrors.start_date = "La fecha de inicio es obligatoria.";
  }

  if (!values.end_date) {
    fieldErrors.end_date = "La fecha de fin es obligatoria.";
  }

  if (values.start_date && values.end_date && values.end_date < values.start_date) {
    fieldErrors.end_date = "La fecha de fin debe ser mayor o igual a la fecha de inicio.";
  }

  if (!SEASON_STATUS_VALUES.includes(values.status as SeasonStatus)) {
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
      formError: "Liga no encontrada o sin acceso para crear temporadas.",
    };
  }

  const { error: insertError } = await supabase.from("seasons").insert({
    league_id: league.id,
    name: values.name,
    slug: values.slug,
    start_date: values.start_date,
    end_date: values.end_date,
    status: values.status as SeasonStatus,
  });

  if (insertError) {
    return {
      values,
      fieldErrors: {},
      formError: mapInsertErrorMessage(insertError.code, insertError.message),
    };
  }

  revalidatePath(`/dashboard/leagues/${leagueSlug}/seasons`);
  redirect(`/dashboard/leagues/${leagueSlug}/seasons`);
}
