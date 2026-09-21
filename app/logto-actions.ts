'use server';

import { signIn, signOut } from '@logto/next/server-actions';
import { logtoConfig } from '@/app/logto';

export async function logtoSignIn() {
  await signIn(logtoConfig);
}

export async function logtoSignOut() {
  await signOut(logtoConfig);
}
