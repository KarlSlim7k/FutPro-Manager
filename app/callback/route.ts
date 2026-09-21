import { handleSignIn } from '@logto/next/server-actions';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { logtoConfig } from '../logto';
import { bridgeSupabaseSession } from '@/lib/logto/bridge-session';

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
