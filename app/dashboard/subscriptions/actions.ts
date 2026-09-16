"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("global_role").eq("id", user.id).maybeSingle();
  if (profile?.global_role !== "super_admin") {
    return { supabase, user: null as null, error: "Solo super_admin puede gestionar suscripciones." };
  }
  return { supabase, user, error: null as string | null };
}

export type SubscriptionFormState = { success: boolean; message: string | null };

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function createPlanAction(
  _prev: SubscriptionFormState,
  formData: FormData
): Promise<SubscriptionFormState> {
  const { supabase, user, error } = await requireSuperAdmin();
  if (error || !user) return { success: false, message: error ?? "No autorizado." };

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const price = Number(String(formData.get("price_monthly") ?? "").trim());

  if (name.length < 2) return { success: false, message: "El nombre debe tener al menos 2 caracteres." };
  if (!SLUG_PATTERN.test(slug)) return { success: false, message: "Slug inválido (lowercase-kebab-case)." };
  if (!Number.isFinite(price) || price < 0) return { success: false, message: "Precio mensual inválido." };

  const { error: insertError } = await supabase.from("subscription_plans").insert({
    name,
    slug,
    price_monthly: price,
    currency: "MXN",
    is_active: true,
  });

  if (insertError) {
    if (insertError.code === "23505") return { success: false, message: "Ya existe un plan con ese slug." };
    return { success: false, message: "No se pudo crear el plan." };
  }

  revalidatePath("/dashboard/subscriptions");
  return { success: true, message: `Plan "${name}" creado.` };
}

export async function togglePlanAction(planId: string, isActive: boolean): Promise<SubscriptionFormState> {
  const { supabase, user, error } = await requireSuperAdmin();
  if (error || !user) return { success: false, message: error ?? "No autorizado." };

  const { error: updateError } = await supabase
    .from("subscription_plans")
    .update({ is_active: !isActive })
    .eq("id", planId);

  if (updateError) return { success: false, message: "No se pudo actualizar el plan." };
  revalidatePath("/dashboard/subscriptions");
  return { success: true, message: "Plan actualizado." };
}

const SUBSCRIPTION_STATUSES = ["trialing", "active", "past_due", "cancelled", "paused"] as const;

export async function setLeagueSubscriptionAction(
  _prev: SubscriptionFormState,
  formData: FormData
): Promise<SubscriptionFormState> {
  const { supabase, user, error } = await requireSuperAdmin();
  if (error || !user) return { success: false, message: error ?? "No autorizado." };

  const leagueId = String(formData.get("leagueId") ?? "").trim();
  const planId = String(formData.get("planId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!leagueId || !planId) return { success: false, message: "Liga y plan son obligatorios." };
  if (!(SUBSCRIPTION_STATUSES as readonly string[]).includes(status)) {
    return { success: false, message: "Estado inválido." };
  }

  // Cerrar suscripción vigente (trialing/active/past_due) antes de crear la nueva
  const { error: closeError } = await supabase
    .from("league_subscriptions")
    .update({ status: "cancelled" })
    .eq("league_id", leagueId)
    .in("status", ["trialing", "active", "past_due"]);

  if (closeError) return { success: false, message: "No se pudo actualizar la suscripción previa." };

  const { error: insertError } = await supabase.from("league_subscriptions").insert({
    league_id: leagueId,
    plan_id: planId,
    status,
  });

  if (insertError) return { success: false, message: "No se pudo asignar el plan a la liga." };
  revalidatePath("/dashboard/subscriptions");
  return { success: true, message: "Suscripción asignada." };
}
