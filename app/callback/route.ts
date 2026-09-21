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

  // Si el proveedor OAuth devolvió error o el usuario canceló
  const errorParam = searchParams.get('error');
  if (errorParam) {
    console.warn('[callback] OAuth provider error:', errorParam, searchParams.get('error_description'));
    const code = errorParam === 'access_denied' ? 'cancelled' : 'oauth_failed';
    redirect(`/login?error=${code}`);
  }

  try {
    await handleSignIn(logtoConfig, searchParams);
  } catch (err) {
    if (err && typeof err === 'object' && 'digest' in err) {
      throw err;
    }
    console.error('[callback] Error in handleSignIn:', err);
    redirect('/login?error=oauth_failed');
  }

  try {
    await bridgeSupabaseSession();
  } catch (err) {
    if (err && typeof err === 'object' && 'digest' in err) {
      throw err;
    }
    console.error('[callback] Error in bridgeSupabaseSession:', err);
    // Fallback: el auto-puente en proxy.ts lo recuperará
  }

  redirect('/dashboard');
}
