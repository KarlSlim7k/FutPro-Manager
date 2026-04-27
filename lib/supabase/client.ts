import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

let browserClient:
  | ReturnType<typeof createBrowserClient>
  | undefined = undefined;

export function createClient() {
  if (!browserClient) {
    const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv();
    browserClient = createBrowserClient(supabaseUrl, supabasePublishableKey);
  }

  return browserClient;
}
