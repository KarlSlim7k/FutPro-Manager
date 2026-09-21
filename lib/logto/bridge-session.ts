import { getLogtoContext } from '@logto/next/server-actions';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { logtoConfig } from '@/app/logto';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { createAdminClient } from '@/lib/supabase/admin';

export interface BridgeResult {
  success: boolean;
  error?: string;
  email?: string | null;
  authUserId?: string;
}

/**
 * Pasa la identidad de Logto a Supabase Auth:
 * 1. Obtiene contexto de Logto (con fetchUserInfo para email).
 * 2. Busca/crea el usuario sombra en Supabase Auth y sincroniza `profiles`.
 * 3. Emite sesión vía `generateLink(magiclink)` y `verifyOtp(token_hash)`.
 * 4. Escribe cookies de sesión en el navegador (`cookieStore.setAll`).
 */
export async function bridgeSupabaseSession(): Promise<BridgeResult> {
  const ctx = await getLogtoContext(logtoConfig, { fetchUserInfo: true });
  console.log('[bridgeSupabaseSession] Logto context debug:', {
    isAuthenticated: ctx.isAuthenticated,
    claims: ctx.claims,
    userInfo: ctx.userInfo,
  });

  if (!ctx.isAuthenticated || !ctx.claims?.sub) {
    console.warn('[bridgeSupabaseSession] User not authenticated or missing sub claim');
    return { success: false, error: 'Not authenticated in Logto' };
  }

  const sub = ctx.claims.sub;
  const email =
    (ctx.claims.email as string | undefined) ??
    (ctx.userInfo as { email?: string } | undefined)?.email ??
    null;

  if (!email) {
    console.warn('[bridgeSupabaseSession] No email found in Logto claims or userInfo for sub:', sub);
    return { success: false, error: 'No email in Logto context' };
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

  // 1) Profile existente por logto_sub
  const { data: existing, error: existingError } = await admin
    .from('profiles')
    .select('id, email, global_role, avatar_url, full_name, display_name')
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
      console.log('[bridgeSupabaseSession] Cleaning orphan profile without auth user:', existing.id);
      await admin.from('profiles').delete().eq('id', existing.id);
    }
  }

  // 2) Sin usuario sombra: reutilizar por email o crearlo
  const cookieStore = await cookies();
  const rawRole = cookieStore.get('futpro_role_preference')?.value;
  const validRoles = ['league_admin', 'team_admin', 'referee', 'viewer'];
  const preferredRole = (rawRole && validRoles.includes(rawRole)) ? rawRole : null;

  if (!authUserId) {
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
        user_metadata: {
          logto_sub: sub,
          full_name: name,
          ...(preferredRole ? { role_preference: preferredRole } : {}),
        },
      });
      if (error || !created?.user) {
        console.error('[bridgeSupabaseSession] Error creating shadow auth user:', error);
        return { success: false, error: error?.message ?? 'Failed to create auth user' };
      }
      authUserId = created.user.id;
      console.log('[bridgeSupabaseSession] Created shadow auth user:', authUserId);
    }

    const { data: profileByAuth } = await admin
      .from('profiles')
      .select('global_role, avatar_url, full_name, display_name')
      .eq('id', authUserId)
      .maybeSingle();

    const roleToSet =
      profileByAuth?.global_role && profileByAuth.global_role !== 'viewer'
        ? profileByAuth.global_role
        : (preferredRole ?? profileByAuth?.global_role ?? 'viewer');

    const avatarToSet = profileByAuth?.avatar_url || avatar;
    const nameToSet = profileByAuth?.full_name || name;
    const displayToSet = profileByAuth?.display_name || nameToSet;

    const { error: upsertError } = await admin.from('profiles').upsert(
      {
        id: authUserId,
        logto_sub: sub,
        email,
        full_name: nameToSet,
        display_name: displayToSet,
        avatar_url: avatarToSet,
        global_role: roleToSet,
      },
      { onConflict: 'id' }
    );
    if (upsertError) {
      console.error('[bridgeSupabaseSession] Error upserting profile:', upsertError);
    }
  } else if (existing) {
    const updates: Record<string, unknown> = {};
    if (!existing.email && email) updates.email = email;
    if (!existing.avatar_url && avatar) updates.avatar_url = avatar;
    if (!existing.full_name && name) updates.full_name = name;
    if (!existing.display_name && name) updates.display_name = name;
    // Si era viewer y explícitamente se registró con un rol superior, actualizarlo:
    if (existing.global_role === 'viewer' && preferredRole && preferredRole !== 'viewer') {
      updates.global_role = preferredRole;
    }
    if (Object.keys(updates).length > 0) {
      await admin.from('profiles').update(updates).eq('id', existing.id);
    }
  }

  // Limpiar la cookie de preferencia una vez procesada
  if (rawRole) {
    try {
      cookieStore.delete('futpro_role_preference');
    } catch {}
  }

  // 3) Generar magiclink y verificar token_hash
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });
  if (linkError || !linkData?.properties) {
    console.error('[bridgeSupabaseSession] Error generating magic link:', linkError);
    return { success: false, error: linkError?.message ?? 'Failed to generate magic link' };
  }

  const tokenHash = linkData.properties.hashed_token;
  const emailOtp = linkData.properties.email_otp;
  if (!tokenHash && !emailOtp) {
    console.error('[bridgeSupabaseSession] Missing token in action_link / linkData');
    return { success: false, error: 'Missing token in linkData' };
  }

  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv();
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
    return { success: false, error: verifyError.message };
  }

  console.log('[bridgeSupabaseSession] Successfully established Supabase session for:', email);
  return { success: true, email, authUserId };
}
