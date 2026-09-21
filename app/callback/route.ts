import { handleSignIn, getLogtoContext } from '@logto/next/server-actions';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { logtoConfig } from '../logto';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Callback Logto Fase 2+: además de cerrar el login Logto, crea/vincula un
 * usuario sombra en Supabase Auth y establece su sesión (cookies). Así las
 * ~80 páginas que usan `supabase.auth.getUser()` + RLS funcionan sin cambios.
 * Ante cualquier fallo, cae al comportamiento anterior (redirect dashboard).
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  await handleSignIn(logtoConfig, searchParams);

  try {
    await bridgeSupabaseSession();
  } catch {
    // Fallback: el layout con auto-provisión cubre el caso sin sesión Supabase.
  }

  redirect('/dashboard');
}

async function bridgeSupabaseSession() {
  const ctx = await getLogtoContext(logtoConfig, { fetchUserInfo: true });
  if (!ctx.isAuthenticated || !ctx.claims?.sub) return;

  const sub = ctx.claims.sub;
  const email =
    (ctx.claims.email as string | undefined) ??
    (ctx.userInfo as { email?: string } | undefined)?.email ??
    null;
  // Sin email no hay usuario sombra viable (magiclink lo exige).
  if (!email) return;

  const name =
    (ctx.claims.name as string | undefined) ??
    (ctx.userInfo as { name?: string } | undefined)?.name ??
    null;
  const avatar =
    (ctx.claims.picture as string | undefined) ??
    (ctx.userInfo as { picture?: string } | undefined)?.picture ??
    null;

  const admin = createAdminClient();

  // 1) Profile existente por logto_sub.
  const { data: existing } = await admin
    .from('profiles')
    .select('id, email')
    .eq('logto_sub', sub)
    .maybeSingle();

  let authUserId: string | null = null;

  if (existing?.id) {
    const { data } = await admin.auth.admin.getUserById(existing.id);
    if (data?.user) {
      authUserId = data.user.id;
    } else {
      // Profile huérfano (creado por webhook con uuid aleatorio): lo recreamos
      // con el id del usuario sombra para que RLS (auth.uid()) siga valiendo.
      await admin.from('profiles').delete().eq('id', existing.id);
    }
  }

  // 2) Sin usuario sombra: crearlo + profile con su mismo id.
  if (!authUserId) {
    // Reutilizar auth user por email si ya existe (ej. registrado antes).
    const { data: listed } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const byEmail = listed?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (byEmail) {
      authUserId = byEmail.id;
    } else {
      const { data: created, error } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { logto_sub: sub, full_name: name },
      });
      if (error || !created?.user) return;
      authUserId = created.user.id;
    }

    await admin.from('profiles').upsert(
      {
        id: authUserId,
        logto_sub: sub,
        email,
        full_name: name,
        display_name: name,
        avatar_url: avatar,
      },
      { onConflict: 'id' }
    );
  } else if (existing && !existing.email) {
    await admin.from('profiles').update({ email }).eq('id', existing.id);
  }

  // 3) Sesión Supabase vía magiclink (sin correo real): genera link, extrae
  // token y lo verifica → el cliente ssr persiste las cookies de sesión.
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });
  if (linkError || !linkData?.properties?.action_link) return;

  const token = new URL(linkData.properties.action_link).searchParams.get('token');
  if (!token) return;

  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv();
  const cookieStore = await cookies();
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

  const { error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'magiclink',
  });
  if (verifyError) return;
}
