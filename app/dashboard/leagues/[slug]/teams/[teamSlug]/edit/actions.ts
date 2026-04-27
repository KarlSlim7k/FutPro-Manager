"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TEAM_STATUS_VALUES, type TeamStatus } from "@/types/database";

type UpdateTeamField =
  | "name"
  | "slug"
  | "logo_url"
  | "primary_color"
  | "secondary_color"
  | "founded_year"
  | "status";

export type UpdateTeamActionState = {
  values: {
    name: string;
    slug: string;
    logo_url: string;
    primary_color: string;
    secondary_color: string;
    founded_year: string;
    status: string;
  };
  fieldErrors: Partial<Record<UpdateTeamField, string>>;
  formError: string | null;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function mapUpdateErrorMessage(code?: string, message?: string | null, details?: string | null) {
  const normalizedErrorText = `${message ?? ""} ${details ?? ""}`.toLowerCase();

  if (code === "42501") {
    return "RLS bloqueó la edición: no tienes permisos para actualizar este equipo.";
  }

  if (code === "23505") {
    return "Ya existe otro equipo con ese slug dentro de esta liga.";
  }

  if (code === "22P02" || code === "23514") {
    return "Los datos enviados no cumplen con las reglas del sistema.";
  }

  if (
    normalizedErrorText.includes("row-level security") ||
    normalizedErrorText.includes("permission denied")
  ) {
    return "No tienes permisos para actualizar este equipo.";
  }

  return "No se pudo actualizar el equipo. Inténtalo nuevamente.";
}

export async function updateTeamAction(
  leagueSlug: string,
  currentTeamSlug: string,
  _prevState: UpdateTeamActionState,
  formData: FormData
): Promise<UpdateTeamActionState> {
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

  const fieldErrors: Partial<Record<UpdateTeamField, string>> = {};

  if (!values.name) {
    fieldErrors.name = "El nombre es obligatorio.";
  }

  if (!values.slug) {
    fieldErrors.slug = "El slug es obligatorio.";
  } else if (!SLUG_PATTERN.test(values.slug)) {
    fieldErrors.slug = "Usa formato lowercase-kebab-case (ejemplo: club-perote-fc).";
  }

  if (values.logo_url) {
    try {
      const parsedUrl = new URL(values.logo_url);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        fieldErrors.logo_url = "La URL del logo debe iniciar con http o https.";
      }
    } catch {
      fieldErrors.logo_url = "Ingresa una URL válida para el logo.";
    }
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
      formError: "Liga no encontrada o sin acceso para editar equipos.",
    };
  }

  const { data: currentTeam, error: currentTeamError } = await supabase
    .from("teams")
    .select("id, slug")
    .eq("league_id", league.id)
    .eq("slug", currentTeamSlug)
    .maybeSingle();

  if (currentTeamError) {
    throw currentTeamError;
  }

  if (!currentTeam) {
    return {
      values,
      fieldErrors: {},
      formError: "Equipo no encontrado o sin acceso para editar.",
    };
  }

  if (values.slug !== currentTeam.slug) {
    const { data: duplicateTeam, error: duplicateTeamError } = await supabase
      .from("teams")
      .select("id")
      .eq("league_id", league.id)
      .eq("slug", values.slug)
      .neq("id", currentTeam.id)
      .maybeSingle();

    if (duplicateTeamError) {
      throw duplicateTeamError;
    }

    if (duplicateTeam) {
      return {
        values,
        fieldErrors: {
          slug: "Ya existe otro equipo con ese slug dentro de esta liga.",
        },
        formError: null,
      };
    }
  }

  const { data: updatedRows, error: updateError } = await supabase
    .from("teams")
    .update({
      name: values.name,
      slug: values.slug,
      logo_url: values.logo_url || null,
      primary_color: values.primary_color || null,
      secondary_color: values.secondary_color || null,
      founded_year: foundedYear,
      status: values.status as TeamStatus,
    })
    .eq("id", currentTeam.id)
    .eq("league_id", league.id)
    .select("slug");

  if (updateError) {
    return {
      values,
      fieldErrors: {},
      formError: mapUpdateErrorMessage(updateError.code, updateError.message, updateError.details),
    };
  }

  const updatedTeam = updatedRows?.[0];
  if (!updatedTeam) {
    return {
      values,
      fieldErrors: {},
      formError: "No se pudo actualizar el equipo por permisos de acceso (RLS).",
    };
  }

  const previousDetailPath = `/dashboard/leagues/${leagueSlug}/teams/${currentTeam.slug}`;
  const nextDetailPath = `/dashboard/leagues/${leagueSlug}/teams/${updatedTeam.slug}`;

  revalidatePath(previousDetailPath);
  revalidatePath(nextDetailPath);
  revalidatePath(`/dashboard/leagues/${leagueSlug}/teams`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}`);
  revalidatePath("/dashboard");

  redirect(nextDetailPath);
}
