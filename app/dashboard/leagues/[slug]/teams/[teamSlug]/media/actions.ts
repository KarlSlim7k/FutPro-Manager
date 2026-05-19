"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/audit/create-audit-log";
import { uploadEntityImage, sanitizeFileName } from "@/lib/media/upload-media";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";
import { createClient } from "@/lib/supabase/server";

type UploadState = { success: boolean; message: string | null };
const LOGO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

export async function updateTeamLogoAction(leagueSlug: string, teamSlug: string, _state: UploadState, formData: FormData): Promise<UploadState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: league } = await supabase.from("leagues").select("id,slug").eq("slug", leagueSlug).maybeSingle();
  if (!league) return { success: false, message: "Liga no encontrada." };
  const { data: team } = await supabase.from("teams").select("id,slug").eq("league_id", league.id).eq("slug", teamSlug).maybeSingle();
  if (!team) return { success: false, message: "Equipo no encontrado." };
  const permissions = await getLeaguePermissions({ supabase, userId: user.id, leagueId: league.id });
  if (!permissions.canManageCatalog) return { success: false, message: "No tienes permisos para actualizar el logo del equipo." };
  const file = formData.get("image");
  if (!(file instanceof File)) return { success: false, message: "Archivo inválido." };
  const path = `leagues/${league.id}/teams/${team.id}/logo/${Date.now()}-${sanitizeFileName(file.name)}`;
  const upload = await uploadEntityImage({ supabase, file, bucket: "league-media", path, leagueId: league.id, uploadedBy: user.id, entityType: "team", entityId: team.id, maxSizeBytes: 2*1024*1024, allowedMimeTypes: LOGO_MIME_TYPES });
  if (!upload.success) return upload;
  const { error } = await supabase.from("teams").update({ logo_url: upload.publicUrl }).eq("id", team.id).eq("league_id", league.id);
  if (error) return { success: false, message: "Se subió el archivo, pero no se pudo actualizar el equipo." };
  await createAuditLog({ supabase, actorId: user.id, leagueId: league.id, action: "media.team_logo_updated", entityType: "team", entityId: team.id, metadata: { bucket: "league-media", path: upload.path, mime_type: upload.mimeType, size_bytes: upload.sizeBytes } });
  revalidatePath(`/dashboard/leagues/${league.slug}/teams/${team.slug}`);
  revalidatePath(`/dashboard/leagues/${league.slug}/teams/${team.slug}/edit`);
  revalidatePath(`/dashboard/leagues/${league.slug}/teams`);
  revalidatePath(`/liga/${league.slug}`);
  revalidatePath(`/liga/${league.slug}/teams/${team.slug}`);
  revalidatePath(`/liga/${league.slug}/standings`);
  return { success: true, message: "Logo de equipo actualizado correctamente." };
}
