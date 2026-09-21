import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type LogtoWebhookPayload = {
  sub?: string;
  email?: string;
  name?: string;
  avatar?: string;
};

/**
 * POST /api/webhooks/logto — auto-provisión de profiles para usuarios Logto.
 * Configurar en Logto Console → Webhooks con header `x-webhook-secret`
 * igual a LOGTO_WEBHOOK_SECRET. Acepta payload mínimo {sub,email,name,avatar}.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.LOGTO_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 500 });
  }

  const signature = request.headers.get("x-webhook-secret");
  if (signature !== secret) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: LogtoWebhookPayload;
  try {
    body = (await request.json()) as LogtoWebhookPayload;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.sub) {
    return NextResponse.json({ error: "Falta sub" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("logto_sub", body.sub)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  const { error } = await admin.from("profiles").insert({
    logto_sub: body.sub,
    email: body.email ?? null,
    full_name: body.name ?? null,
    display_name: body.name ?? null,
    avatar_url: body.avatar ?? null,
    global_role: "viewer",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
