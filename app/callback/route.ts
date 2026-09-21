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
  } catch (err) {
    console.error('[callback] Error in bridgeSupabaseSession:', err);
    // Fallback: el layout con auto-provisión cubre el caso sin sesión Supabase.
  }

  redirect('/dashboard');
}

async function bridgeSupabaseSession() {
  const ctx = await getLogtoContext(logtoConfig, { fetchUserInfo: true });
  console.log('[bridgeSupabaseSession] Logto context debug:', {
    isAuthenticated: ctx.isAuthenticated,
    claims: ctx.claims,
    userInfo: ctx.userInfo,
  });

  if (!ctx.isAuthenticated || !ctx.claims?.sub) {
    console.warn('[bridgeSupabaseSession] User not authenticated or missing sub claim');
    return;
  }

  const sub = ctx.claims.sub;
  const email =
    (ctx.claims.email as string | undefined) ??
    (ctx.userInfo as { email?: string } | undefined)?.email ??
    null;

  // Sin email no hay usuario sombra viable (magiclink lo exige).
  if (!email) {
    console.warn('[bridgeSupabaseSession] No email found in Logto claims or userInfo for sub:', sub);
    return;
  }

  console.log('[bridgeSupabaseSession] Resolved email:', email, 'for sub:', sub);

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
  const { data: existing, error: existingError } = await admin
    .from('profiles')
    .select('id, email')
    .eq('logto_sub', sub)
    .maybeSingle();

  if (existingError) {
    console.error('[bridgeSupabaseSession] Error querying existing profile:', existingError);
  }

  let authUserId: string | null = null;

  if (existing?.id) {
    const { data } = await admin.auth.admin.getUserById(existing.id);
    if (data?.user) {
      authUserId = data.user.id;
      console.log('[bridgeSupabaseSession] Found existing auth user:', authUserId);
    } else {
      // Profile huérfano (creado por webhook con uuid aleatorio): lo recreamos
      // con el id del usuario sombra para que RLS (auth.uid()) siga valiendo.
      console.log('[bridgeSupabaseSession] Cleaning orphan profile without auth user:', existing.id);
      await admin.from('profiles').delete().eq('id', existing.id);
    }
  }

  // 2) Sin usuario sombra: crearlo + profile con su mismo id.
  if (!authUserId) {
    // Reutilizar auth user por email si ya existe (ej. registrado antes).
    const { data: listed, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listError) {
      console.error('[bridgeSupabaseSession] Error listing auth users:', listError);
    }
    const byEmail = listed?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (byEmail) {
      authUserId = byEmail.id;
      console.log('[bridgeSupabaseSession] Reusing existing auth user by email:', authUserId);
    } else {
      const { data: created, error } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { logto_sub: sub, full_name: name },
      });
      if (error || !created?.user) {
        console.error('[bridgeSupabaseSession] Error creating shadow auth user:', error);
        return;
      }
      authUserId = created.user.id;
      console.log('[bridgeSupabaseSession] Created shadow auth user:', authUserId);
    }

    const { error: upsertError } = await admin.from('profiles').upsert(
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
    if (upsertError) {
      console.error('[bridgeSupabaseSession] Error upserting profile:', upsertError);
    }
  } else if (existing && !existing.email) {
    await admin.from('profiles').update({ email }).eq('id', existing.id);
  }

  // 3) Sesión Supabase vía magiclink (sin correo real): genera link, extrae
  // token y lo verifica → el cliente ssr persiste las cookies de sesión.
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });
  if (linkError || !linkData?.properties?.action_link) {
    console.error('[bridgeSupabaseSession] Error generating magic link:', linkError);
    return;
  }

  const tokenHash = linkData.properties.hashed_token;
  const emailOtp = linkData.properties.email_otp;
  if (!tokenHash && !emailOtp) {
    console.error('[bridgeSupabaseSession] Missing token in action_link / linkData');
    return;
  }

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

  let verifyError = null;
  if (tokenHash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'magiclink',
    });
    verifyError = error;
  } else if (emailOtp) {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: emailOtp,
      type: 'email',
    });
    verifyError = error;
  }

  if (verifyError) {
    console.error('[bridgeSupabaseSession] Error verifying OTP:', verifyError);
    return;
  }

  console.log('[bridgeSupabaseSession] Successfully established Supabase session for:', email);
}
