"use server";

import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/database";

export interface AdminUserRow {
  id: string;
  email: string | null;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  global_role: AppRole;
  is_suspended?: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  league_memberships: number;
}

export async function listUsersViaRpcAction(params: {
  role?: AppRole;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ users: AdminUserRow[]; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { users: [], error: "No autenticado." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("global_role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.global_role !== "super_admin") {
    return { users: [], error: "Solo super_admin puede listar usuarios." };
  }

  const { data, error } = await supabase.rpc("admin_list_users", {
    p_role: params.role ?? null,
    p_search: params.search ?? null,
    p_limit: params.limit ?? 200,
    p_offset: params.offset ?? 0,
  });

  if (error) return { users: [], error: error.message };

  return { users: (data ?? []) as AdminUserRow[], error: null };
}
