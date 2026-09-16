import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

let cachedPublicClient: SupabaseClient | null = null;

/**
 * Cliente Supabase ligero y sin cookies para lecturas públicas (ISR / Static Generation).
 * Utiliza @supabase/supabase-js de forma directa con la clave pública anónima.
 * Al NO importar cookies() de next/headers, Next.js permite cachear y servir
 * respuestas ISR (s-maxage=60 / Vercel HIT) sin forzar render dinámico.
 */
export function createPublicClient(): SupabaseClient {
  if (cachedPublicClient) {
    return cachedPublicClient;
  }

  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv();
  cachedPublicClient = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (url, options = {}) => {
        return fetch(url, {
          ...options,
          next: { revalidate: 60 },
        });
      },
    },
  });

  return cachedPublicClient;
}
