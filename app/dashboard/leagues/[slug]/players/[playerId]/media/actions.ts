"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/audit/create-audit-log";
import { uploadEntityImage, sanitizeFileName } from "@/lib/media/upload-media";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";
import { createClient } from "@/lib/supabase/server";

type UploadState = { success: boolean; message: string | null };
const PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function updatePlayerPhotoAction(leagueSlug: string, playerId: string, _state: UploadState, formData: FormData): Promise<UploadState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: league } = await supabase.from('leagues').select('id,slug').eq('slug', leagueSlug).maybeSingle();
  if (!league) return { success:false, message:'Liga no encontrada.'};
  const { data: player } = await supabase.from('players').select('id').eq('id', playerId).eq('league_id', league.id).maybeSingle();
  if (!player) return { success:false, message:'Jugador no encontrado.'};
  const permissions = await getLeaguePermissions({ supabase, userId:user.id, leagueId:league.id});
  if (!permissions.canManageCatalog) return { success:false, message:'No tienes permisos para actualizar la foto del jugador.'};
  const file = formData.get('image');
  if (!(file instanceof File)) return { success:false, message:'Archivo inválido.'};
  const path = `leagues/${league.id}/players/${player.id}/photo/${Date.now()}-${sanitizeFileName(file.name)}`;
  const upload = await uploadEntityImage({ supabase, file, bucket:'league-media', path, leagueId:league.id, uploadedBy:user.id, entityType:'player', entityId:player.id, maxSizeBytes:3*1024*1024, allowedMimeTypes:PHOTO_MIME_TYPES });
  if (!upload.success) return upload;
  const { error } = await supabase.from('players').update({ photo_url: upload.publicUrl }).eq('id', player.id).eq('league_id', league.id);
  if (error) return { success:false, message:'Se subió el archivo, pero no se pudo actualizar el jugador.'};
  await createAuditLog({ supabase, actorId:user.id, leagueId:league.id, action:'media.player_photo_updated', entityType:'player', entityId:player.id, metadata:{ bucket:'league-media', path:upload.path, mime_type:upload.mimeType, size_bytes:upload.sizeBytes }});
  revalidatePath(`/dashboard/leagues/${league.slug}/players/${player.id}`);
  revalidatePath(`/dashboard/leagues/${league.slug}/players`);
  revalidatePath(`/liga/${league.slug}/players/${player.id}`);
  revalidatePath(`/liga/${league.slug}/teams`);
  return { success:true, message:'Foto de jugador actualizada correctamente.'};
}
