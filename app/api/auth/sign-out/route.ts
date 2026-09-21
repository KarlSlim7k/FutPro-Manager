import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import LogtoClient from '@logto/next/server-actions';
import { createServerClient } from '@supabase/ssr';
import { logtoConfig } from '@/app/logto';
import { getSupabaseEnv } from '@/lib/supabase/env';

async function performSignOut(request: NextRequest) {
  const cookieStore = await cookies();
  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv();

  // 1. Cerrar sesión en Supabase a nivel de servidor
  try {
    const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    });
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('[sign-out] Error en supabase.auth.signOut:', err);
  }

  // 2. Destruir explícitamente todas las cookies de autenticación de Supabase y Logto
  const allCookies = cookieStore.getAll();
  const cookiesToClear: string[] = [];

  for (const c of allCookies) {
    if (
      c.name.startsWith('sb-') ||
      c.name.startsWith('logto') ||
      c.name === 'futpro_role_preference'
    ) {
      cookiesToClear.push(c.name);
      try {
        cookieStore.set(c.name, '', {
          path: '/',
          maxAge: 0,
          expires: new Date(0),
        });
        cookieStore.delete(c.name);
      } catch {}
    }
  }

  // 3. Manejar revocación y fin de sesión OIDC en Logto
  const postLogoutRedirectUri = `${logtoConfig.baseUrl}/login?signed_out=1`;
  let logtoNavigateUrl: string | null = null;

  if (logtoConfig.appSecret && logtoConfig.cookieSecret) {
    try {
      const client = new LogtoClient(logtoConfig);
      logtoNavigateUrl = await client.handleSignOut(postLogoutRedirectUri);
    } catch (err) {
      console.warn('[sign-out] Logto handleSignOut no retornó URL OIDC:', err);
    }
  }

  const destination = logtoNavigateUrl || `${logtoConfig.baseUrl}/login?signed_out=1`;
  const response = NextResponse.redirect(new URL(destination, request.url));

  // 4. Adjuntar cabeceras Set-Cookie para expirar cookies en el navegador inmediatamente
  for (const name of cookiesToClear) {
    response.cookies.set(name, '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });
  }

  return response;
}

export async function GET(request: NextRequest) {
  return performSignOut(request);
}

export async function POST(request: NextRequest) {
  return performSignOut(request);
}
