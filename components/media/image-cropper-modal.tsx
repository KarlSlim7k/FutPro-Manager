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
  const touchStateRef = useRef<{
    isPinching: boolean;
    initialDistance: number;
    initialZoom: number;
    startX: number;
    startY: number;
    initialPanX: number;
    initialPanY: number;
  } | null>(null);

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

  // Gestos táctiles de pellizco (pinch zoom) y arrastre (pan)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      touchStateRef.current = {
        isPinching: true,
        initialDistance: distance,
        initialZoom: zoom,
        startX: 0,
        startY: 0,
        initialPanX: panX,
        initialPanY: panY,
      };
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStateRef.current = {
        isPinching: false,
        initialDistance: 0,
        initialZoom: zoom,
        startX: touch.clientX,
        startY: touch.clientY,
        initialPanX: panX,
        initialPanY: panY,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStateRef.current) return;

    if (e.touches.length === 2 && touchStateRef.current.isPinching) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const factor = currentDistance / touchStateRef.current.initialDistance;
      const newZoom = Math.max(1, Math.min(3, touchStateRef.current.initialZoom * factor));
      setZoom(Number(newZoom.toFixed(2)));
    } else if (e.touches.length === 1 && !touchStateRef.current.isPinching) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStateRef.current.startX;
      const deltaY = touch.clientY - touchStateRef.current.startY;
      const nextPanX = Math.max(-100, Math.min(100, touchStateRef.current.initialPanX + deltaX * 0.8));
      const nextPanY = Math.max(-100, Math.min(100, touchStateRef.current.initialPanY + deltaY * 0.8));
      setPanX(Math.round(nextPanX));
      setPanY(Math.round(nextPanY));
    }
  };

  const handleTouchEnd = () => {
    touchStateRef.current = null;
  };

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-2xl max-h-[90dvh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 id="cropper-title" className="text-base sm:text-lg font-bold text-gray-900">
              Ajustar y recortar imagen
            </h3>
            <p className="text-xs text-gray-500">
              Usa pellizco o arrastra para encuadrar.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 touch-manipulation"
          >
            ✕
          </button>
        </div>

        {/* Canvas de visualización táctil */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-3 touch-none cursor-move select-none"
        >
          <canvas
            ref={canvasRef}
            className="max-h-64 sm:max-h-72 max-w-full rounded-lg shadow-sm pointer-events-none"
            style={{ maxHeight: "260px" }}
          />
          <span className="mt-2 text-[10px] sm:text-xs text-gray-500">
            {imageDimensions
              ? `Táctil: Pellizca para zoom, arrastra para mover`
              : "Cargando imagen..."}
          </span>
        </div>

        {/* Controles táctiles */}
        <div className="mt-4 space-y-4">
          {/* Selector de proporción */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1.5">
              Proporción
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAspectRatio("square")}
                className={`flex min-h-[44px] items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold transition touch-manipulation active:scale-95 ${
                  aspectRatio === "square"
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                1:1 (Cuadrado)
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio("portrait")}
                className={`flex min-h-[44px] items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold transition touch-manipulation active:scale-95 ${
                  aspectRatio === "portrait"
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                3:4 (Retrato)
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio("free")}
                className={`flex min-h-[44px] items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold transition touch-manipulation active:scale-95 ${
                  aspectRatio === "free"
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Libre
              </button>
            </div>
          </div>

          {/* Zoom con botones rápidos */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-gray-700 uppercase">
              <span>Zoom</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, Number((z - 0.2).toFixed(1))))}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-300 bg-white text-lg font-bold text-gray-700 active:bg-gray-100 touch-manipulation"
                aria-label="Reducir zoom"
              >
                -
              </button>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="h-6 w-full accent-emerald-600 touch-manipulation"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, Number((z + 0.2).toFixed(1))))}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-300 bg-white text-lg font-bold text-gray-700 active:bg-gray-100 touch-manipulation"
                aria-label="Aumentar zoom"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isProcessing}
            className="min-h-[44px] touch-manipulation"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleApplyCrop}
            disabled={isProcessing || !imageDimensions}
            className="min-h-[44px] px-5 font-bold touch-manipulation"
          >
            {isProcessing ? "Procesando..." : "Aplicar recorte"}
          </Button>
        </div>
      </div>
    </div>
  );
}
