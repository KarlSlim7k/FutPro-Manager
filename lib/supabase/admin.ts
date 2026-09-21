import { createClient } from "@supabase/supabase-js";

/**
 * Cliente service_role (bypass RLS). Solo servidor, nunca exponer al browser.
 * Requiere SUPABASE_SERVICE_ROLE_KEY en env. Se usa para perfiles Logto
 * que no tienen sesión Supabase y por tanto no pasan RLS con anon key.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY (o NEXT_PUBLIC_SUPABASE_URL) para el puente Logto."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
