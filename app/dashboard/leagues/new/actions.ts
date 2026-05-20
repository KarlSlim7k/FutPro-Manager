"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Field = "name" | "slug" | "description" | "city" | "state" | "region" | "country";

type State = {
  values: Record<Field, string>;
  fieldErrors: Partial<Record<Field, string>>;
  formError: string | null;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function mapError(code?: string, message?: string) {
  if (code === "23505") return "Ya existe una liga con ese slug.";
  if (code === "42501" || message?.toLowerCase().includes("permission denied"))
    return "No tienes permisos para crear ligas.";
  return "No se pudo crear la liga. Inténtalo nuevamente.";
}

export async function createLeagueAction(
  _prev: State,
  formData: FormData
): Promise<State> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const values: Record<Field, string> = {
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim(),
    region: String(formData.get("region") ?? "").trim(),
    country: String(formData.get("country") ?? "").trim(),
  };

  const fieldErrors: Partial<Record<Field, string>> = {};

  if (!values.name) fieldErrors.name = "El nombre es obligatorio.";
  if (!values.slug) {
    fieldErrors.slug = "El slug es obligatorio.";
  } else if (!SLUG_PATTERN.test(values.slug)) {
    fieldErrors.slug = "Usa formato lowercase-kebab-case (ej: liga-municipal-perote).";
  }
  if (!values.country) fieldErrors.country = "El país es obligatorio.";

  if (Object.keys(fieldErrors).length > 0) return { values, fieldErrors, formError: null };

  const { error } = await supabase.from("leagues").insert({
    name: values.name,
    slug: values.slug,
    description: values.description || null,
    city: values.city || null,
    state: values.state || null,
    region: values.region || null,
    country: values.country,
    is_public: false,
    status: "draft",
    created_by: user.id,
  });

  if (error) return { values, fieldErrors: {}, formError: mapError(error.code, error.message) };

  revalidatePath("/dashboard/leagues");
  redirect(`/dashboard/leagues/${values.slug}`);
}
