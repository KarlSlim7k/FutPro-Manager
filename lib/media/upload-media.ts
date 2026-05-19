import type { SupabaseClient } from "@supabase/supabase-js";

export type UploadEntityImageParams = {
  supabase: SupabaseClient;
  file: File;
  bucket: string;
  path: string;
  leagueId: string;
  uploadedBy: string;
  entityType: string;
  entityId: string | null;
  maxSizeBytes: number;
  allowedMimeTypes: string[];
};

export type UploadEntityImageResult =
  | { success: true; publicUrl: string; path: string; mimeType: string; sizeBytes: number }
  | { success: false; message: string };

export function sanitizeFileName(value: string) {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "file";
}

export async function uploadEntityImage(params: UploadEntityImageParams): Promise<UploadEntityImageResult> {
  const {
    supabase,
    file,
    bucket,
    path,
    leagueId,
    uploadedBy,
    entityType,
    entityId,
    maxSizeBytes,
    allowedMimeTypes,
  } = params;

  if (!file || file.size <= 0) {
    return { success: false, message: "Selecciona un archivo válido." };
  }

  if (!allowedMimeTypes.includes(file.type)) {
    return { success: false, message: "Formato no permitido. Usa JPG, PNG o WEBP." };
  }

  if (file.size > maxSizeBytes) {
    return { success: false, message: "El archivo excede el tamaño máximo permitido." };
  }

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (uploadError) {
    return { success: false, message: "No se pudo subir el archivo. Verifica la configuración de Storage." };
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

  const { error: mediaError } = await supabase.from("media_uploads").insert({
    league_id: leagueId,
    uploaded_by: uploadedBy,
    bucket,
    path,
    entity_type: entityType,
    entity_id: entityId,
    mime_type: file.type,
    size_bytes: file.size,
  });

  if (mediaError) {
    return {
      success: false,
      message:
        "Archivo subido, pero no se pudo registrar metadata. Reintenta y verifica permisos de media_uploads.",
    };
  }

  return { success: true, publicUrl: urlData.publicUrl, path, mimeType: file.type, sizeBytes: file.size };
}
