"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  type AspectRatioType,
  ASPECT_RATIOS,
  cropAndResizeImage,
  getInitialCropBox,
} from "@/lib/media/image-processor";

interface ImageCropperModalProps {
  file: File;
  isOpen: boolean;
  defaultAspectRatio?: AspectRatioType;
  onClose: () => void;
  onCropComplete: (croppedFile: File, previewUrl: string) => void;
}

export function ImageCropperModal({
  file,
  isOpen,
  defaultAspectRatio = "square",
  onClose,
  onCropComplete,
}: ImageCropperModalProps) {
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>(defaultAspectRatio);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [sourceDataUrl, setSourceDataUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Cargar imagen de origen
  useEffect(() => {
    if (!file || !isOpen) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSourceDataUrl(result);

      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        setZoom(1);
        setPanX(0);
        setPanY(0);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);

    return () => {
      setSourceDataUrl(null);
      setImageDimensions(null);
    };
  }, [file, isOpen]);

  // Renderizar preview en Canvas
  useEffect(() => {
    if (!sourceDataUrl || !imageDimensions || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const targetRatio = ASPECT_RATIOS[aspectRatio] || img.naturalWidth / img.naturalHeight;
      const displayWidth = 360;
      const displayHeight = Math.round(displayWidth / targetRatio);

      canvas.width = displayWidth;
      canvas.height = displayHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Calcular crop centrado con zoom y desplazamiento
      const baseCrop = getInitialCropBox(img.naturalWidth, img.naturalHeight, targetRatio);

      const zoomedWidth = baseCrop.width / zoom;
      const zoomedHeight = baseCrop.height / zoom;

      // Aplicar pan restringido a los límites de la imagen
      const maxPanX = (img.naturalWidth - zoomedWidth) / 2;
      const maxPanY = (img.naturalHeight - zoomedHeight) / 2;

      const effectivePanX = (panX / 100) * maxPanX;
      const effectivePanY = (panY / 100) * maxPanY;

      const cropX = Math.max(0, Math.min(img.naturalWidth - zoomedWidth, baseCrop.x + effectivePanX));
      const cropY = Math.max(0, Math.min(img.naturalHeight - zoomedHeight, baseCrop.y + effectivePanY));

      ctx.drawImage(
        img,
        cropX,
        cropY,
        zoomedWidth,
        zoomedHeight,
        0,
        0,
        displayWidth,
        displayHeight
      );
    };
    img.src = sourceDataUrl;
  }, [sourceDataUrl, imageDimensions, aspectRatio, zoom, panX, panY]);

  const handleApplyCrop = async () => {
    if (!file || !imageDimensions) return;

    try {
      setIsProcessing(true);
      const targetRatio = ASPECT_RATIOS[aspectRatio] || imageDimensions.width / imageDimensions.height;
      const baseCrop = getInitialCropBox(imageDimensions.width, imageDimensions.height, targetRatio);

      const zoomedWidth = Math.round(baseCrop.width / zoom);
      const zoomedHeight = Math.round(baseCrop.height / zoom);

      const maxPanX = (imageDimensions.width - zoomedWidth) / 2;
      const maxPanY = (imageDimensions.height - zoomedHeight) / 2;

      const effectivePanX = (panX / 100) * maxPanX;
      const effectivePanY = (panY / 100) * maxPanY;

      const cropX = Math.round(Math.max(0, Math.min(imageDimensions.width - zoomedWidth, baseCrop.x + effectivePanX)));
      const cropY = Math.round(Math.max(0, Math.min(imageDimensions.height - zoomedHeight, baseCrop.y + effectivePanY)));

      const result = await cropAndResizeImage(
        file,
        { x: cropX, y: cropY, width: zoomedWidth, height: zoomedHeight },
        {
          maxWidth: aspectRatio === "portrait" ? 900 : 800,
          maxHeight: aspectRatio === "portrait" ? 1200 : 800,
          quality: 0.88,
          format: "image/webp",
        }
      );

      onCropComplete(result.file, result.previewUrl);
      onClose();
    } catch (err) {
      console.error("Error al recortar imagen:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cropper-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 id="cropper-title" className="text-lg font-semibold text-gray-900">
              Ajustar y recortar imagen
            </h3>
            <p className="text-xs text-gray-500">
              Optimiza el encuadre y resolución antes de subir.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Canvas de visualización */}
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
          <canvas
            ref={canvasRef}
            className="max-h-72 max-w-full rounded shadow-sm"
            style={{ maxHeight: "280px" }}
          />
          {imageDimensions ? (
            <p className="mt-2 text-xs text-gray-500">
              Original: {imageDimensions.width} × {imageDimensions.height} px
            </p>
          ) : (
            <p className="text-xs text-gray-400">Cargando imagen...</p>
          )}
        </div>

        {/* Controles */}
        <div className="mt-4 space-y-4">
          {/* Selector de proporción */}
          <div>
            <label className="text-xs font-medium text-gray-700">Proporción</label>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setAspectRatio("square")}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  aspectRatio === "square"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                1:1 (Cuadrado)
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio("portrait")}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  aspectRatio === "portrait"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                3:4 (Retrato)
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio("free")}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  aspectRatio === "free"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Original
              </button>
            </div>
          </div>

          {/* Zoom Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-gray-700">
              <span>Zoom</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="mt-1 w-full accent-emerald-600"
            />
          </div>

          {/* Controles de desplazamiento si zoom > 1 */}
          {zoom > 1 ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700">Posición horizontal</label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="1"
                  value={panX}
                  onChange={(e) => setPanX(parseInt(e.target.value, 10))}
                  className="mt-1 w-full accent-emerald-600"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Posición vertical</label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="1"
                  value={panY}
                  onChange={(e) => setPanY(parseInt(e.target.value, 10))}
                  className="mt-1 w-full accent-emerald-600"
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Acciones */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleApplyCrop}
            disabled={isProcessing || !imageDimensions}
          >
            {isProcessing ? "Procesando..." : "Aplicar recorte"}
          </Button>
        </div>
      </div>
    </div>
  );
}
