"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TEAM_STATUS_VALUES, type TeamStatus } from "@/types/database";

type CreateTeamField =
  | "name"
  | "slug"
  | "logo_url"
  | "primary_color"
  | "secondary_color"
  | "founded_year"
  | "status";

type CreateTeamActionState = {
  values: {
    name: string;
    slug: string;
    logo_url: string;
    primary_color: string;
    secondary_color: string;
    founded_year: string;
    status: string;
  };
  fieldErrors: Partial<Record<CreateTeamField, string>>;
  formError: string | null;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function mapInsertErrorMessage(code?: string, message?: string) {
  if (code === "42501") {
    return "RLS bloqueó la creación: no tienes permisos para crear equipos en esta liga.";
  }

  if (code === "23505") {
    return "Ya existe un equipo con ese slug dentro de esta liga.";
  }

  if (code === "22P02" || code === "23514") {
    return "Los datos enviados no cumplen con las reglas del sistema.";
  }

  if (message?.toLowerCase().includes("permission denied")) {
    return "No tienes permisos para crear equipos en esta liga.";
  }

  return "No se pudo crear el equipo. Inténtalo nuevamente.";
}

export async function createTeamAction(
  leagueSlug: string,
  _prevState: CreateTeamActionState,
  formData: FormData
): Promise<CreateTeamActionState> {
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
    logo_url: String(formData.get("logo_url") ?? "").trim(),
    primary_color: String(formData.get("primary_color") ?? "").trim(),
    secondary_color: String(formData.get("secondary_color") ?? "").trim(),
    founded_year: String(formData.get("founded_year") ?? "").trim(),
    status: String(formData.get("status") ?? "").trim(),
  };

  const fieldErrors: Partial<Record<CreateTeamField, string>> = {};

  if (!values.name) {
    fieldErrors.name = "El nombre es obligatorio.";
  }

  if (!values.slug) {
    fieldErrors.slug = "El slug es obligatorio.";
  } else if (!SLUG_PATTERN.test(values.slug)) {
    fieldErrors.slug = "Usa formato lowercase-kebab-case (ejemplo: club-perote-fc).";
  }

  if (values.primary_color && !HEX_COLOR_PATTERN.test(values.primary_color)) {
    fieldErrors.primary_color = "Usa un color hex válido (#fff o #ffffff).";
  }

  if (values.secondary_color && !HEX_COLOR_PATTERN.test(values.secondary_color)) {
    fieldErrors.secondary_color = "Usa un color hex válido (#fff o #ffffff).";
  }

  const currentYear = new Date().getFullYear();
  let foundedYear: number | null = null;

  if (values.founded_year) {
    const parsedYear = Number(values.founded_year);

    if (!Number.isInteger(parsedYear)) {
      fieldErrors.founded_year = "El año de fundación debe ser un número entero.";
    } else if (parsedYear < 1850 || parsedYear > currentYear + 1) {
      fieldErrors.founded_year = `El año debe estar entre 1850 y ${currentYear + 1}.`;
    } else {
      foundedYear = parsedYear;
    }
  }

  if (!TEAM_STATUS_VALUES.includes(values.status as TeamStatus)) {
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
      formError: "Liga no encontrada o sin acceso para crear equipos.",
    };
  }

  const { error: insertError } = await supabase.from("teams").insert({
    league_id: league.id,
    name: values.name,
    slug: values.slug,
    logo_url: values.logo_url || null,
    primary_color: values.primary_color || null,
    secondary_color: values.secondary_color || null,
    founded_year: foundedYear,
    status: values.status as TeamStatus,
  });

  if (insertError) {
    return {
      values,
      fieldErrors: {},
      formError: mapInsertErrorMessage(insertError.code, insertError.message),
    };
  }

  revalidatePath(`/dashboard/leagues/${leagueSlug}/teams`);
  redirect(`/dashboard/leagues/${leagueSlug}/teams`);
}
