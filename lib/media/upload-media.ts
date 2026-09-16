import type { SupabaseClient } from "@supabase/supabase-js";

export type UploadEntityImageParams = {
  supabase: SupabaseClient;
  file: File;
  bucket: string;
  path: string;
  leagueId?: string | null;
  uploadedBy: string;
  entityType: string;
  entityId: string | null;
  maxSizeBytes: number;
  allowedMimeTypes: string[];
};

export type MediaUrlOptions = {
  width?: number;
  height?: number;
  quality?: number;
  resize?: "cover" | "contain" | "fill";
};

/**
 * Resuelve la URL pública de un archivo multimedia, aplicando el dominio de CDN
 * personalizado (NEXT_PUBLIC_CDN_DOMAIN) o transformaciones de imagen de Supabase si están solicitadas.
 */
export function resolveCdnMediaUrl(
  url: string | null | undefined,
  options?: MediaUrlOptions
): string {
  if (!url) return "";

  let resolved = url;
  const customCdn =
    process.env.NEXT_PUBLIC_CDN_DOMAIN ||
    process.env.NEXT_PUBLIC_SUPABASE_MEDIA_CDN_URL;

  if (customCdn) {
    try {
      const parsed = new URL(url);
      const cdnUrl = new URL(
        customCdn.startsWith("http") ? customCdn : `https://${customCdn}`
      );
      parsed.host = cdnUrl.host;
      parsed.protocol = cdnUrl.protocol;
      resolved = parsed.toString();
    } catch {
      // Fallback a URL original
    }
  }

  if (options && (options.width || options.height || options.quality || options.resize)) {
    if (resolved.includes("/storage/v1/object/public/")) {
      const params = new URLSearchParams();
      if (options.width) params.set("width", String(options.width));
      if (options.height) params.set("height", String(options.height));
      if (options.quality) params.set("quality", String(options.quality));
      if (options.resize) params.set("resize", options.resize);

      resolved = resolved.replace(
        "/storage/v1/object/public/",
        "/storage/v1/render/image/public/"
      );
      const separator = resolved.includes("?") ? "&" : "?";
      resolved = `${resolved}${separator}${params.toString()}`;
    }
  }

  return resolved;
}

export type UploadEntityImageResult =
  | { success: true; publicUrl: string; path: string; mimeType: string; sizeBytes: number }
  | { success: false; message: string };

export function sanitizeFileName(value: string) {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/-\./g, ".")
    .replace(/\.-/g, ".")
    .replace(/^-|-$/g, "");
  return cleaned || "file";
}

const STORAGE_UPLOAD_BASE_ERROR = "No se pudo subir el archivo. Verifica la configuración de Storage.";
const MIME_LABELS: Record<string, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WEBP",
};

function getInvalidMimeMessage(allowedMimeTypes: string[]) {
  const labels = allowedMimeTypes.map((mimeType) => MIME_LABELS[mimeType]).filter(Boolean);
  const normalizedLabels = labels.length > 0 ? labels : ["JPG", "PNG", "WEBP"];

  return `Formato no permitido. Usa ${normalizedLabels.join(", ")}.`;
}

function getStorageUploadErrorMessage(uploadError: { message?: string } | null) {
  if (!uploadError?.message) {
    return STORAGE_UPLOAD_BASE_ERROR;
  }

  const normalizedMessage = uploadError.message.toLowerCase();

  if (normalizedMessage.includes("bucket") && normalizedMessage.includes("not found")) {
    return `${STORAGE_UPLOAD_BASE_ERROR} El bucket configurado no está disponible.`;
  }

  if (
    normalizedMessage.includes("policy") ||
    normalizedMessage.includes("permission") ||
    normalizedMessage.includes("not authorized") ||
    normalizedMessage.includes("access denied") ||
    normalizedMessage.includes("unauthorized")
  ) {
    return `${STORAGE_UPLOAD_BASE_ERROR} Revisa las policies y permisos del bucket.`;
  }

  return STORAGE_UPLOAD_BASE_ERROR;
}

/**
 * Verifica magic bytes del contenido real (no solo `file.type`).
 * Rechaza SVG/HTML polyglots aunque lleguen con MIME spoofeado.
 */
function hasAllowedImageSignature(bytes: Uint8Array, declaredMime: string): boolean {
  if (bytes.length < 12) return false;

  // Rechazo rápido de texto/markup (SVG, HTML, XML, scripts).
  const head = new TextDecoder().decode(bytes.slice(0, Math.min(bytes.length, 512))).trimStart().toLowerCase();
  if (
    head.startsWith("<svg") ||
    head.startsWith("<?xml") ||
    head.startsWith("<html") ||
    head.startsWith("<!doctype html") ||
    head.startsWith("<script")
  ) {
    return false;
  }

  if (declaredMime === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (declaredMime === "image/png") {
    return (
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
      bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
    );
  }
  if (declaredMime === "image/webp") {
    return (
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
    );
  }
  return false;
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
    return { success: false, message: getInvalidMimeMessage(allowedMimeTypes) };
  }

  // Defensa en profundidad: no confiar solo en `file.type` (controlable por el
  // cliente). Verifica magic bytes y rechaza SVG/HTML polyglots aunque vengan
  // con MIME spoofeado. Solo se permiten rasterizados: JPEG, PNG, WebP.
  try {
    const buffer = new Uint8Array(await file.arrayBuffer());
    if (!hasAllowedImageSignature(buffer, file.type)) {
      return { success: false, message: getInvalidMimeMessage(allowedMimeTypes) };
    }
  } catch {
    return { success: false, message: "No se pudo validar el archivo." };
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
    return { success: false, message: getStorageUploadErrorMessage(uploadError) };
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

  const { error: mediaError } = await supabase.from("media_uploads").insert({
    league_id: leagueId ?? null,
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
