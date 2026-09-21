import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import LogtoClient from "@logto/next/edge";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { logtoConfig } from "@/app/logto";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv();

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fase 1 Logto (coexistencia): si hay sesión Logto válida, tratar como autenticado.
  let logtoAuthenticated = false;
  let logtoSub: string | null = null;
  try {
    if (logtoConfig.appSecret && logtoConfig.cookieSecret) {
      const logtoClient = new LogtoClient(logtoConfig);
      const ctx = await logtoClient.getLogtoContext(request);
      logtoAuthenticated = ctx.isAuthenticated;
      logtoSub = ctx.claims?.sub ?? null;
    }
  } catch {
    logtoAuthenticated = false;
    logtoSub = null;
  }

  const isAuthenticated = Boolean(user) || logtoAuthenticated;

  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isLoginRoute = request.nextUrl.pathname.startsWith("/login");

  if (!isAuthenticated && isDashboardRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  // Bloqueo de usuarios suspendidos: solo consulta ligera al perfil en rutas del dashboard.
  if (user && isDashboardRoute) {
    const { data: suspendedProfile } = await supabase
      .from("profiles")
      .select("is_suspended")
      .eq("id", user.id)
      .maybeSingle();
    if (suspendedProfile?.is_suspended) {
      await supabase.auth.signOut();
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("suspended", "1");
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Fase 2: mismo bloqueo para usuarios solo-Logto (lookup por logto_sub
  // con service_role; sin signOut server-side, redirige a login).
  if (!user && logtoAuthenticated && logtoSub && isDashboardRoute) {
    try {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceRoleKey) {
        const { createClient } = await import("@supabase/supabase-js");
        const admin = createClient(supabaseUrl, serviceRoleKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: logtoProfile } = await admin
          .from("profiles")
          .select("is_suspended")
          .eq("logto_sub", logtoSub)
          .maybeSingle();
        if (logtoProfile?.is_suspended) {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = "/login";
          redirectUrl.searchParams.set("suspended", "1");
          return NextResponse.redirect(redirectUrl);
        }
      }
    } catch {
      // No bloquear por error de lookup; el layout revalida identidad.
    }
  }

  if (isAuthenticated && isLoginRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
