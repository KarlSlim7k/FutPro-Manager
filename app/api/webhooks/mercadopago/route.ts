import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  syncLeagueSubscription,
  mapMercadoPagoStatusToDb,
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

    const topic = event?.type || event?.topic;
    const paymentData = event?.data;

    if (!topic || !paymentData) {
      return NextResponse.json({ received: true, ignored: true });
    }

    // MercadoPago webhooks can send external_reference as leagueId
    const leagueId =
      paymentData.external_reference ||
      event?.external_reference ||
      paymentData.metadata?.league_id;

    if (!leagueId) {
      return NextResponse.json({ received: true, note: "No leagueId found in MP event" });
    }

    const supabase = await createClient();
    const mpStatus = paymentData.status || "approved";
    const targetStatus = mapMercadoPagoStatusToDb(mpStatus);

    const syncResult = await syncLeagueSubscription(supabase, {
      leagueId,
      provider: "mercadopago",
      status: targetStatus,
      metadata: paymentData,
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
      { error: error?.message ?? "MercadoPago webhook processing error" },
      { status: 500 }
    );
  }
}
