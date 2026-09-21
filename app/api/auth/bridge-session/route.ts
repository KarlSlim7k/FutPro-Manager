import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { bridgeSupabaseSession } from '@/lib/logto/bridge-session';

/**
 * Endpoint de auto-puente:
 * Cuando un usuario tiene sesión activa en Logto pero no en Supabase (ej. sesión
 * preexistente, cookies de Supabase expiradas o navegación directa a subpáginas),
 * middleware lo redirige aquí para establecer la sesión Supabase transparentemente
 * y enviarlo a su destino original (`next`).
 */
export async function GET(request: NextRequest) {
  const nextParam = request.nextUrl.searchParams.get('next');
  let target = '/dashboard';
  if (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')) {
    target = nextParam;
  }

  try {
    const result = await bridgeSupabaseSession();
    if (!result.success) {
      console.warn('[bridge-session route] Bridge failed:', result.error);
      redirect('/login');
    }
  } catch (err) {
    // Si redirect lanzó NEXT_REDIRECT, relanzar
    if (err && typeof err === 'object' && 'digest' in err) {
      throw err;
    }
    console.error('[bridge-session route] Error:', err);
    redirect('/login');
  }

  const separator = target.includes('?') ? '&' : '?';
  redirect(`${target}${separator}bridged=1`);
}
