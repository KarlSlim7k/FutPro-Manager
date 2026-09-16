"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface StorageObjectRow {
  id: string;
  name: string;
  bucket_id: string;
  size_bytes: number;
  mime_type: string | null;
  created_at: string;
  updated_at: string;
  owner_id: string | null;
}

async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, isSuperAdmin: false };
  const { data: profile } = await supabase
    .from("profiles")
    .select("global_role")
    .eq("id", user.id)
    .maybeSingle();
  return { supabase, isSuperAdmin: profile?.global_role === "super_admin" };
}

export async function getStorageOverviewAction(search?: string): Promise<{
  buckets: Array<{ bucket_id: string; object_count: number; total_bytes: number }>;
  objects: StorageObjectRow[];
  error: string | null;
}> {
  const { supabase, isSuperAdmin } = await requireSuperAdmin();
  if (!isSuperAdmin) {
    return { buckets: [], objects: [], error: "Solo super_admin puede ver el almacenamiento." };
  }

  const [statsResult, listResult] = await Promise.all([
    supabase.rpc("admin_storage_stats"),
    supabase.rpc("admin_list_storage_objects", {
      p_bucket: "league-media",
      p_search: search ?? null,
      p_limit: 200,
    }),
  ]);

  if (statsResult.error || listResult.error) {
    return {
      buckets: [],
      objects: [],
      error:
        statsResult.error?.message ??
        listResult.error?.message ??
        "No fue posible consultar el almacenamiento.",
    };
  }

  return {
    buckets: (statsResult.data ?? []).map((b: { bucket_id: string; object_count: number; total_bytes: number }) => ({
      bucket_id: String(b.bucket_id),
      object_count: Number(b.object_count),
      total_bytes: Number(b.total_bytes),
    })),
    objects: (listResult.data ?? []).map((o: Record<string, unknown>) => ({
      id: String(o.id),
      name: String(o.name),
      bucket_id: String(o.bucket_id),
      size_bytes: Number(o.size_bytes ?? 0),
      mime_type: o.mime_type ? String(o.mime_type) : null,
      created_at: String(o.created_at),
      updated_at: String(o.updated_at),
      owner_id: o.owner_id ? String(o.owner_id) : null,
    })),
    error: null,
  };
}

export async function deleteStorageObjectAction(
  objectId: string
): Promise<{ success: boolean; message: string }> {
  const { supabase, isSuperAdmin } = await requireSuperAdmin();
  if (!isSuperAdmin) {
    return { success: false, message: "Solo super_admin puede borrar objetos." };
  }

  const { data, error } = await supabase.rpc("admin_delete_storage_object", {
    p_object_id: objectId,
  });

  if (error) {
    return { success: false, message: "No se pudo borrar el objeto. Intenta nuevamente." };
  }

  revalidatePath("/dashboard/storage");
  return {
    success: Number(data ?? 0) > 0,
    message: Number(data ?? 0) > 0 ? "Objeto eliminado y auditado." : "El objeto ya no existía.",
  };
}
