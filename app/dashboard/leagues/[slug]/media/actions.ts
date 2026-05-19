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
