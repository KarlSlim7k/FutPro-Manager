import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/app/logto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type VerifiedUser =
  | {
      source: "supabase";
      supabaseUserId: string;
      email: string | null;
      profileId: string;
    }
  | {
      source: "logto";
      logtoSub: string;
      email: string | null;
      profileId: string | null;
    }
  | { source: "anonymous" };

/**
 * Identidad unificada Fase 2 (coexistencia).
 * 1) Si hay sesión Supabase -> source supabase (RLS intacto).
 * 2) Si hay sesión Logto -> busca profile por logto_sub (service_role).
 *    profileId null = Logto válido pero sin profile (webhook pendiente).
 */
export async function getVerifiedUser(): Promise<VerifiedUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return {
      source: "supabase",
      supabaseUserId: user.id,
      email: user.email ?? null,
      profileId: user.id,
    };
  }

  try {
    if (!logtoConfig.appSecret || !logtoConfig.cookieSecret) {
      return { source: "anonymous" };
    }
    const ctx = await getLogtoContext(logtoConfig);
    if (!ctx.isAuthenticated || !ctx.claims?.sub) {
      return { source: "anonymous" };
    }
    const sub = ctx.claims.sub;
    const email =
      (ctx.claims.email as string | undefined) ?? ctx.userInfo?.email ?? null;

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("logto_sub", sub)
      .maybeSingle();

    return { source: "logto", logtoSub: sub, email, profileId: profile?.id ?? null };
  } catch {
    return { source: "anonymous" };
  }
}
