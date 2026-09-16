"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/audit/create-audit-log";
import { uploadEntityImage, sanitizeFileName } from "@/lib/media/upload-media";
import { createClient } from "@/lib/supabase/server";

export type ProfileUploadState = { success: boolean; message: string | null };
export type ProfileDetailsState = { success: boolean; message: string | null };

const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function updateUserAvatarAction(
  _state: ProfileUploadState,
  formData: FormData
): Promise<ProfileUploadState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const file = formData.get("image");
  if (!(file instanceof File)) {
    return { success: false, message: "Archivo inválido." };
  }

  const safeName = sanitizeFileName(file.name);
  const path = `leagues/avatars/${user.id}/${Date.now()}-${safeName}`;

  const upload = await uploadEntityImage({
    supabase,
    file,
    bucket: "league-media",
    path,
    leagueId: null,
    uploadedBy: user.id,
    entityType: "profile_avatar",
    entityId: user.id,
    maxSizeBytes: 2 * 1024 * 1024,
    allowedMimeTypes: AVATAR_MIME_TYPES,
  });

  if (!upload.success) {
    return upload;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: upload.publicUrl })
    .eq("id", user.id);

  if (error) {
    return {
      success: false,
      message: "Se subió la imagen, pero no se pudo actualizar el avatar en tu perfil.",
    };
  }

  await createAuditLog({
    supabase,
    actorId: user.id,
    leagueId: null,
    action: "profile.avatar_updated",
    entityType: "profile",
    entityId: user.id,
    metadata: {
      bucket: "league-media",
      path: upload.path,
      mime_type: upload.mimeType,
      size_bytes: upload.sizeBytes,
    },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");

  return { success: true, message: "Avatar actualizado correctamente." };
}

export async function updateUserProfileDetailsAction(
  _state: ProfileDetailsState,
  formData: FormData
): Promise<ProfileDetailsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = (formData.get("displayName") as string | null)?.trim() || null;
  const fullName = (formData.get("fullName") as string | null)?.trim() || null;
  const phone = (formData.get("phone") as string | null)?.trim() || null;

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      full_name: fullName,
      phone: phone,
    })
    .eq("id", user.id);

  if (error) {
    return {
      success: false,
      message: "No se pudieron guardar los cambios de tu perfil. Inténtalo de nuevo.",
    };
  }

  await createAuditLog({
    supabase,
    actorId: user.id,
    leagueId: null,
    action: "profile.updated",
    entityType: "profile",
    entityId: user.id,
    metadata: {
      has_display_name: Boolean(displayName),
      has_full_name: Boolean(fullName),
      has_phone: Boolean(phone),
    },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");

  return { success: true, message: "Perfil actualizado correctamente." };
}
