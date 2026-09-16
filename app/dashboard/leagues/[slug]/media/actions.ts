"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/audit/create-audit-log";
import { uploadEntityImage, sanitizeFileName } from "@/lib/media/upload-media";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";
import { createClient } from "@/lib/supabase/server";

type UploadState = { success: boolean; message: string | null };

const LOGO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

export async function updateLeagueLogoAction(
  leagueSlug: string,
  _state: UploadState,
  formData: FormData
): Promise<UploadState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: league } = await supabase.from("leagues").select("id, slug").eq("slug", leagueSlug).maybeSingle();
  if (!league) return { success: false, message: "Liga no encontrada." };

  const permissions = await getLeaguePermissions({ supabase, userId: user.id, leagueId: league.id });
  if (!permissions.canManageLeague) return { success: false, message: "No tienes permisos para actualizar el logo." };

  const file = formData.get("image");
  if (!(file instanceof File)) return { success: false, message: "Archivo inválido." };

  const safe = sanitizeFileName(file.name);
  const path = `leagues/${league.id}/league/logo/${Date.now()}-${safe}`;
  const upload = await uploadEntityImage({
    supabase, file, bucket: "league-media", path, leagueId: league.id, uploadedBy: user.id,
    entityType: "league", entityId: league.id, maxSizeBytes: 2 * 1024 * 1024, allowedMimeTypes: LOGO_MIME_TYPES,
  });
  if (!upload.success) return upload;

  const { error } = await supabase.from("leagues").update({ logo_url: upload.publicUrl }).eq("id", league.id);
  if (error) return { success: false, message: "Se subió el archivo, pero no se pudo actualizar la liga." };

  await createAuditLog({ supabase, actorId: user.id, leagueId: league.id, action: "media.league_logo_updated", entityType: "league", entityId: league.id, metadata: { bucket: "league-media", path: upload.path, mime_type: upload.mimeType, size_bytes: upload.sizeBytes } });

  revalidatePath(`/dashboard/leagues/${league.slug}`);
  revalidatePath(`/dashboard/leagues`);
  revalidatePath(`/liga/${league.slug}`);
  revalidatePath(`/liga/${league.slug}/standings`);
  return { success: true, message: "Logo de liga actualizado correctamente." };
}

export type CleanupMediaState = { success: boolean; message: string | null; cleanedCount?: number };

/**
 * Elimina archivos huérfanos: uploads de la liga cuya ruta ya no referencia
 * ningún logo/foto actual (logos reemplazados o entidades eliminadas).
 * Solo considera archivos con más de 24h para no interferir con subidas en curso.
 */
export async function cleanupOrphanMediaAction(
  leagueSlug: string,
  _state: CleanupMediaState
): Promise<CleanupMediaState> {
  void _state;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: league } = await supabase.from("leagues").select("id, slug, logo_url").eq("slug", leagueSlug).maybeSingle();
  if (!league) return { success: false, message: "Liga no encontrada." };

  const permissions = await getLeaguePermissions({ supabase, userId: user.id, leagueId: league.id });
  if (!permissions.canManageLeague) return { success: false, message: "No tienes permisos para limpiar archivos." };

  const graceCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [{ data: uploads }, { data: teams }, { data: players }] = await Promise.all([
    supabase.from("media_uploads").select("id, bucket, path, created_at").eq("league_id", league.id).lt("created_at", graceCutoff),
    supabase.from("teams").select("logo_url").eq("league_id", league.id),
    supabase.from("players").select("photo_url").eq("league_id", league.id),
  ]);

  const referenced = new Set<string>();
  const liveUrls = [
    league.logo_url as string | null,
    ...(teams ?? []).map((t) => t.logo_url as string | null),
    ...(players ?? []).map((p) => p.photo_url as string | null),
  ];
  for (const url of liveUrls) {
    if (url) referenced.add(url);
  }

  const orphans = (uploads ?? []).filter((u) => {
    const path = u.path as string;
    for (const url of referenced) {
      if (url.endsWith(path)) return false;
    }
    return true;
  });

  let cleanedCount = 0;
  for (const orphan of orphans) {
    const bucket = orphan.bucket as string;
    const path = orphan.path as string;
    // Borrado físico best-effort; si falla se conserva el registro
    const { error: storageError } = await supabase.storage.from(bucket).remove([path]);
    if (storageError) continue;
    const { error: rowError } = await supabase.from("media_uploads").delete().eq("id", orphan.id);
    if (!rowError) cleanedCount += 1;
  }

  await createAuditLog({
    supabase,
    actorId: user.id,
    leagueId: league.id,
    action: "media.orphans_cleaned",
    entityType: "league",
    entityId: league.id,
    metadata: { candidates: orphans.length, cleaned_count: cleanedCount, league_slug: leagueSlug },
  });

  revalidatePath(`/dashboard/leagues/${league.slug}`);
  return {
    success: true,
    message:
      cleanedCount === 0
        ? "No se encontraron archivos huérfanos para limpiar."
        : `Se limpiaron ${cleanedCount} archivo(s) huérfano(s).`,
    cleanedCount,
  };
}
