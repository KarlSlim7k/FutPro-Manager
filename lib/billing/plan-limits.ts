import type { SupabaseClient } from "@supabase/supabase-js";

export interface PlanLimits {
  name: string;
  maxTeams: number; // -1 indicates unlimited
  maxActiveSeasons: number; // -1 indicates unlimited
  hasRealtime: boolean;
  hasDigitalQr: boolean;
  hasCustomDomain: boolean;
}

export const PLAN_LIMITS_CATALOG: Record<string, PlanLimits> = {
  gratis: {
    name: "Gratis / Prueba",
    maxTeams: 10,
    maxActiveSeasons: 1,
    hasRealtime: true,
    hasDigitalQr: true,
    hasCustomDomain: false,
  },
  basico: {
    name: "Plan Básico",
    maxTeams: 16,
    maxActiveSeasons: 2,
    hasRealtime: true,
    hasDigitalQr: true,
    hasCustomDomain: false,
  },
  pro: {
    name: "Plan Pro",
    maxTeams: 32,
    maxActiveSeasons: 5,
    hasRealtime: true,
    hasDigitalQr: true,
    hasCustomDomain: true,
  },
  elite: {
    name: "Plan Élite",
    maxTeams: -1,
    maxActiveSeasons: -1,
    hasRealtime: true,
    hasDigitalQr: true,
    hasCustomDomain: true,
  },
};

export function getPlanLimits(planSlug?: string | null): PlanLimits {
  if (!planSlug) return PLAN_LIMITS_CATALOG.gratis;
  const normalized = planSlug.toLowerCase().trim();
  return PLAN_LIMITS_CATALOG[normalized] || PLAN_LIMITS_CATALOG.gratis;
}

export function isWithinLimit(currentCount: number, maxAllowed: number): boolean {
  if (maxAllowed === -1) return true; // Unlimited
  return currentCount < maxAllowed;
}

export async function verifyTeamCreationLimit(
  supabase: SupabaseClient,
  leagueId: string
): Promise<{ allowed: boolean; currentCount: number; maxAllowed: number; message?: string }> {
  // 1. Get league active subscription and its plan
  const { data: sub } = await supabase
    .from("league_subscriptions")
    .select(`
      status,
      plan:subscription_plans(slug, name)
    `)
    .eq("league_id", leagueId)
    .in("status", ["trialing", "active"])
    .maybeSingle();

  const planSlug = (sub?.plan as any)?.slug ?? "gratis";
  const limits = getPlanLimits(planSlug);

  // 2. Count existing teams in league
  const { count, error } = await supabase
    .from("teams")
    .select("id", { count: "exact", head: true })
    .eq("league_id", leagueId);

  const currentCount = count ?? 0;
  const allowed = isWithinLimit(currentCount, limits.maxTeams);

  if (!allowed) {
    return {
      allowed: false,
      currentCount,
      maxAllowed: limits.maxTeams,
      message: `Has alcanzado el límite de ${limits.maxTeams} equipos permitidos en tu plan actual (${limits.name}). Actualiza tu suscripción para registrar más equipos.`,
    };
  }

  return { allowed: true, currentCount, maxAllowed: limits.maxTeams };
}

export async function verifySeasonCreationLimit(
  supabase: SupabaseClient,
  leagueId: string
): Promise<{ allowed: boolean; currentCount: number; maxAllowed: number; message?: string }> {
  const { data: sub } = await supabase
    .from("league_subscriptions")
    .select(`
      status,
      plan:subscription_plans(slug, name)
    `)
    .eq("league_id", leagueId)
    .in("status", ["trialing", "active"])
    .maybeSingle();

  const planSlug = (sub?.plan as any)?.slug ?? "gratis";
  const limits = getPlanLimits(planSlug);

  const { count } = await supabase
    .from("seasons")
    .select("id", { count: "exact", head: true })
    .eq("league_id", leagueId)
    .in("status", ["upcoming", "active"]);

  const currentCount = count ?? 0;
  const allowed = isWithinLimit(currentCount, limits.maxActiveSeasons);

  if (!allowed) {
    return {
      allowed: false,
      currentCount,
      maxAllowed: limits.maxActiveSeasons,
      message: `Has alcanzado el límite de ${limits.maxActiveSeasons} temporadas simultáneas en tu plan actual (${limits.name}). Actualiza a Pro o finaliza temporadas anteriores.`,
    };
  }

  return { allowed: true, currentCount, maxAllowed: limits.maxActiveSeasons };
}
