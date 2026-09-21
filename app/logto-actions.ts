'use server';

import { signIn, signOut } from '@logto/next/server-actions';
import { cookies } from 'next/headers';
import { logtoConfig } from '@/app/logto';

const VALID_ROLES = ['league_admin', 'team_admin', 'referee', 'viewer'] as const;

export async function logtoSignIn(rolePreference?: string) {
  if (rolePreference && VALID_ROLES.includes(rolePreference as (typeof VALID_ROLES)[number])) {
    const cookieStore = await cookies();
    cookieStore.set('futpro_role_preference', rolePreference, {
      path: '/',
      maxAge: 60 * 15, // 15 minutos de vigencia para completar el flujo OAuth
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }
  await signIn(logtoConfig);
}

export async function logtoSignOut() {
  await signOut(logtoConfig);
}
