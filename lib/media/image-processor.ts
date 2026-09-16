export type AspectRatioType = "square" | "portrait" | "free";

export interface CropOptions {
  aspectRatio?: AspectRatioType | number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "image/webp" | "image/jpeg" | "image/png";
}

export interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const ASPECT_RATIOS: Record<AspectRatioType, number | null> = {
  square: 1, // 1:1 (logos, avatares)
  portrait: 3 / 4, // 3:4 (fotos de jugadores)
  free: null, // Libre / original
};

export const ASPECT_RATIO_LABELS: Record<AspectRatioType, string> = {
  square: "Cuadrado (1:1 - Logos y avatares)",
  portrait: "Retrato (3:4 - Fotos de jugadores)",
  free: "Original / Libre",
};

/**
 * Calcula el recorte centrado inicial según la relación de aspecto.
 */
export function getInitialCropBox(
  naturalWidth: number,
  naturalHeight: number,
  aspectRatio: AspectRatioType | number | null
): CropBox {
  const ratio =
    typeof aspectRatio === "number"
      ? aspectRatio
      : aspectRatio && aspectRatio !== "free"
      ? ASPECT_RATIOS[aspectRatio]
      : null;

  if (!ratio || naturalWidth <= 0 || naturalHeight <= 0) {
    return { x: 0, y: 0, width: naturalWidth, height: naturalHeight };
  }

  const imageRatio = naturalWidth / naturalHeight;

  let cropWidth = naturalWidth;
  let cropHeight = naturalHeight;

  if (imageRatio > ratio) {
    // La imagen es más ancha que el ratio deseado
    cropWidth = Math.round(naturalHeight * ratio);
  } else {
    // La imagen es más alta que el ratio deseado
    cropHeight = Math.round(naturalWidth / ratio);
  }

  const x = Math.round((naturalWidth - cropWidth) / 2);
  const y = Math.round((naturalHeight - cropHeight) / 2);

  return { x, y, width: cropWidth, height: cropHeight };
}

/**
 * Recorta y redimensiona una imagen en el navegador antes de subirla.
 */
export async function cropAndResizeImage(
  source: File | Blob | string,
  cropBox?: CropBox,
  options: CropOptions = {}
): Promise<{ file: File; previewUrl: string; width: number; height: number }> {
  const {
    maxWidth = 1000,
    maxHeight = 1000,
    quality = 0.88,
    format = "image/webp",
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    let objectUrlToRevoke: string | null = null;

    img.onload = () => {
      try {
        if (objectUrlToRevoke) {
          URL.revokeObjectURL(objectUrlToRevoke);
        }

        const naturalWidth = img.naturalWidth || img.width;
        const naturalHeight = img.naturalHeight || img.height;

        const effectiveCrop = cropBox || {
          x: 0,
          y: 0,
          width: naturalWidth,
          height: naturalHeight,
        };

        // Limitar dimensiones máximas conservando proporción de recorte
        let targetWidth = effectiveCrop.width;
        let targetHeight = effectiveCrop.height;

        if (targetWidth > maxWidth || targetHeight > maxHeight) {
          const ratio = targetWidth / targetHeight;
          if (targetWidth > targetHeight) {
            targetWidth = Math.min(targetWidth, maxWidth);
            targetHeight = Math.round(targetWidth / ratio);
          } else {
            targetHeight = Math.min(targetHeight, maxHeight);
            targetWidth = Math.round(targetHeight * ratio);
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo inicializar el contexto 2D de canvas."));
          return;
        }

        // Calidad de renderizado
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Dibujar sección recortada redimensionada
        ctx.drawImage(
          img,
          effectiveCrop.x,
          effectiveCrop.y,
          effectiveCrop.width,
          effectiveCrop.height,
          0,
          0,
          targetWidth,
          targetHeight
        );

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Error al exportar la imagen optimizada."));
              return;
            }

            const fileName =
              source instanceof File
                ? source.name.replace(/\.[^/.]+$/, "") + (format === "image/webp" ? ".webp" : ".jpg")
                : `optimized-${Date.now()}.${format === "image/webp" ? "webp" : "jpg"}`;

            const resultFile = new File([blob], fileName, { type: format });
            const previewUrl = URL.createObjectURL(blob);

            resolve({
              file: resultFile,
              previewUrl,
              width: targetWidth,
              height: targetHeight,
            });
          },
          format,
          quality
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
      reject(new Error("No se pudo cargar la imagen para su procesamiento."));
    };

    if (typeof source === "string") {
      img.src = source;
    } else {
      objectUrlToRevoke = URL.createObjectURL(source);
      img.src = objectUrlToRevoke;
    }
  });
}
