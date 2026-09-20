import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  syncLeagueSubscription,
  mapStripeStatusToDb,
} from "@/lib/billing/subscription-service";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let event: any;

    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const eventType = event?.type;
    const dataObject = event?.data?.object;

    if (!eventType || !dataObject) {
      return NextResponse.json({ received: true, ignored: true });
    }

    // Extract league ID from metadata or client_reference_id
    const leagueId =
      dataObject.metadata?.league_id ||
      dataObject.client_reference_id ||
      dataObject.subscription_details?.metadata?.league_id;

    if (!leagueId) {
      // Event without league reference, acknowledge gracefully
      return NextResponse.json({ received: true, note: "No leagueId in metadata" });
    }

    const supabase = await createClient();

    let targetStatus: "active" | "past_due" | "cancelled" | "trialing" | "paused" = "active";
    if (eventType === "customer.subscription.deleted") {
      targetStatus = "cancelled";
    } else if (eventType === "invoice.payment_failed") {
      targetStatus = "past_due";
    } else if (dataObject.status) {
      targetStatus = mapStripeStatusToDb(dataObject.status);
    }

    const currentPeriodStart = dataObject.current_period_start
      ? new Date(dataObject.current_period_start * 1000).toISOString()
      : undefined;
    const currentPeriodEnd = dataObject.current_period_end
      ? new Date(dataObject.current_period_end * 1000).toISOString()
      : undefined;

    const syncResult = await syncLeagueSubscription(supabase, {
      leagueId,
      provider: "stripe",
      status: targetStatus,
      currentPeriodStart,
      currentPeriodEnd,
      metadata: dataObject.metadata,
    });

    if (!syncResult.success) {
      return NextResponse.json(
        { error: syncResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ received: true, updated: syncResult.subscriptionId });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Webhook processing error" },
      { status: 500 }
    );
  }
}
