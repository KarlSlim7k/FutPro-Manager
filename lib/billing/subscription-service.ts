import type { SupabaseClient } from "@supabase/supabase-js";

export type SupportedPaymentProvider = "stripe" | "mercadopago" | "manual";

export interface SyncSubscriptionParams {
  leagueId: string;
  planId?: string;
  provider: SupportedPaymentProvider;
  status: "trialing" | "active" | "past_due" | "cancelled" | "paused";
  currentPeriodStart?: string; // ISO
  currentPeriodEnd?: string; // ISO
  metadata?: Record<string, unknown>;
}

export function mapStripeStatusToDb(stripeStatus: string): "trialing" | "active" | "past_due" | "cancelled" | "paused" {
  switch (stripeStatus) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
      return "cancelled";
    case "paused":
      return "paused";
    default:
      return "active";
  }
}

export function mapMercadoPagoStatusToDb(mpStatus: string): "active" | "past_due" | "cancelled" {
  switch (mpStatus) {
    case "approved":
    case "authorized":
      return "active";
    case "in_process":
    case "pending":
      return "past_due";
    case "rejected":
    case "cancelled":
    case "refunded":
    case "charged_back":
      return "cancelled";
    default:
      return "past_due";
  }
}

export async function syncLeagueSubscription(
  supabase: SupabaseClient,
  params: SyncSubscriptionParams
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
  try {
    // 1. Find if an active/trialing/past_due subscription already exists for this league
    const { data: existing, error: findError } = await supabase
      .from("league_subscriptions")
      .select("id, plan_id, status")
      .eq("league_id", params.leagueId)
      .in("status", ["trialing", "active", "past_due"])
      .maybeSingle();

    if (findError) {
      return { success: false, error: findError.message };
    }

    if (existing) {
      // Update existing subscription
      const updatePayload: Record<string, unknown> = {
        status: params.status,
        updated_at: new Date().toISOString(),
      };
      if (params.planId) updatePayload.plan_id = params.planId;
      if (params.currentPeriodStart) updatePayload.current_period_start = params.currentPeriodStart;
      if (params.currentPeriodEnd) updatePayload.current_period_end = params.currentPeriodEnd;

      const { error: updateError } = await supabase
        .from("league_subscriptions")
        .update(updatePayload)
        .eq("id", existing.id);

      if (updateError) return { success: false, error: updateError.message };
      return { success: true, subscriptionId: existing.id };
    } else {
      // Create new subscription if planId is provided
      if (!params.planId) {
        return { success: false, error: "planId requerido para nueva suscripción" };
      }

      const { data: inserted, error: insertError } = await supabase
        .from("league_subscriptions")
        .insert({
          league_id: params.leagueId,
          plan_id: params.planId,
          status: params.status,
          current_period_start: params.currentPeriodStart,
          current_period_end: params.currentPeriodEnd,
        })
        .select("id")
        .single();

      if (insertError) return { success: false, error: insertError.message };
      return { success: true, subscriptionId: inserted.id };
    }
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Error inesperado en sync" };
  }
}
