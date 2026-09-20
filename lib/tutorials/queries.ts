import { createClient } from "@/lib/supabase/server";
import type { AppRole, Tutorial, TutorialStep, TutorialWithSteps } from "@/types/database";
import {
  ALLOWED_TUTORIAL_TAGS,
  canUserAccessTutorial,
  isValidAppRole,
} from "./roles";

export interface GetTutorialsOptions {
  q?: string | null;
  role?: string | null;
  tag?: string | null;
  userAllowedRoles: AppRole[];
  limit?: number;
}

/**
 * Sanitiza y valida la cadena de búsqueda.
 * Trunca a 100 caracteres y escapa caracteres problemáticos para LIKE/ILIKE.
 */
export function sanitizeSearchQuery(rawQuery?: string | null): string {
  if (!rawQuery || typeof rawQuery !== "string") {
    return "";
  }
  // Trim y límite estricto de 100 caracteres
  const trimmed = rawQuery.trim().slice(0, 100);
  // Reemplazar caracteres de escape de LIKE
  return trimmed.replace(/[%_\\]/g, "");
}

/**
 * Obtiene la lista de tutoriales publicados filtrados por rol efectivo, búsqueda y etiqueta.
 * Fail-closed: solo retorna tutoriales a los que el usuario tiene acceso según userAllowedRoles.
 */
export async function getTutorials({
  q,
  role,
  tag,
  userAllowedRoles,
  limit = 50,
}: GetTutorialsOptions): Promise<Tutorial[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("tutorials")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .limit(Math.min(Math.max(limit, 1), 100));

    // Validar filtro de rol contra allowlist y permisos del usuario
    let filteredRole: AppRole | null = null;
    if (role && typeof role === "string" && isValidAppRole(role)) {
      if (userAllowedRoles.includes("super_admin") || userAllowedRoles.includes(role)) {
        filteredRole = role;
      }
    }

    if (filteredRole) {
      query = query.contains("target_roles", [filteredRole]);
    } else if (!userAllowedRoles.includes("super_admin")) {
      // Filtrar a nivel base de datos por los roles permitidos
      query = query.overlaps("target_roles", userAllowedRoles);
    }

    // Validar filtro de tag contra allowlist
    if (tag && typeof tag === "string") {
      const cleanTag = tag.trim().toLowerCase().slice(0, 50);
      if (ALLOWED_TUTORIAL_TAGS.includes(cleanTag)) {
        query = query.contains("tags", [cleanTag]);
      }
    }

    // Validar y sanitizar búsqueda por texto en título
    const safeQ = sanitizeSearchQuery(q);
    if (safeQ.length > 0) {
      query = query.ilike("title", `%${safeQ}%`);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    const tutorials = data as Tutorial[];

    // Defensa en profundidad: filtrar en memoria para asegurar 100% de aislamiento
    return tutorials.filter((t) => canUserAccessTutorial(t, userAllowedRoles));
  } catch {
    return [];
  }
}

/**
 * Obtiene un tutorial con todos sus pasos ordenados por slug.
 * Fail-closed: si no existe, no está publicado o el usuario no tiene rol, retorna null.
 */
export async function getTutorialBySlug(
  slug: string,
  userAllowedRoles: AppRole[]
): Promise<TutorialWithSteps | null> {
  if (!slug || typeof slug !== "string" || slug.length > 100 || !/^[a-z0-9-]+$/.test(slug)) {
    return null;
  }

  try {
    const supabase = await createClient();

    const { data: tutorialData, error: tutorialError } = await supabase
      .from("tutorials")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (tutorialError || !tutorialData) {
      return null;
    }

    const tutorial = tutorialData as Tutorial;

    // Verificar visibilidad del tutorial para el usuario
    if (!canUserAccessTutorial(tutorial, userAllowedRoles)) {
      return null;
    }

    const { data: stepsData, error: stepsError } = await supabase
      .from("tutorial_steps")
      .select("*")
      .eq("tutorial_id", tutorial.id)
      .order("step_order", { ascending: true });

    if (stepsError) {
      return null;
    }

    const steps = (stepsData ?? []) as TutorialStep[];

    return {
      ...tutorial,
      steps,
    };
  } catch {
    return null;
  }
}
