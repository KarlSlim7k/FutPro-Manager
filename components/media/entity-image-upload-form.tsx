"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImageCropperModal } from "@/components/media/image-cropper-modal";
import type { AspectRatioType } from "@/lib/media/image-processor";

type UploadState = { success: boolean; message: string | null };

interface EntityImageUploadFormProps {
  action: (state: UploadState, formData: FormData) => Promise<UploadState>;
  helpText: string;
  buttonText: string;
  accept?: string;
  aspectRatio?: AspectRatioType;
  enableCrop?: boolean;
}

export function EntityImageUploadForm({
  action,
  helpText,
  buttonText,
  accept = "image/jpeg,image/png,image/webp",
  aspectRatio = "square",
  enableCrop = true,
}: EntityImageUploadFormProps) {
  const [state, formAction, pending] = useActionState(action, { success: false, message: null });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [hasCropped, setHasCropped] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setHasCropped(false);
      return;
    }

    setSelectedFile(file);
    setHasCropped(false);
    setPreviewUrl(URL.createObjectURL(file));

    // Si es SVG, no recortar
    if (file.type === "image/svg+xml") {
      return;
    }
  };

  const handleCropComplete = (croppedFile: File, newPreviewUrl: string) => {
    setSelectedFile(croppedFile);
    setPreviewUrl(newPreviewUrl);
    setHasCropped(true);

    // Sincronizar el input file mediante DataTransfer si está soportado
    if (fileInputRef.current) {
      try {
        const dt = new DataTransfer();
        dt.items.add(croppedFile);
        fileInputRef.current.files = dt.files;
      } catch {
        // Fallback: el formulario usará el formData intervenido o la referencia
      }
    }
  };

  const isSvg = selectedFile?.type === "image/svg+xml";

  return (
    <>
      <form
        action={async (formData) => {
          // Asegurar que si tenemos un archivo recortado, se envíe exactamente ese
          if (selectedFile && hasCropped) {
            formData.set("image", selectedFile);
          }
          await formAction(formData);
        }}
        className="space-y-3"
      >
        <div className="space-y-1">
          <label htmlFor="entity-image-input" className="text-sm font-medium text-gray-700">
            Imagen
          </label>
          <input
            id="entity-image-input"
            ref={fileInputRef}
            type="file"
            name="image"
            accept={accept}
            onChange={handleFileChange}
            required={!selectedFile}
            className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-gray-700 hover:file:bg-gray-200"
          />
          <p className="text-xs text-gray-500">{helpText}</p>
        </div>

        {/* Vista previa y botón de ajuste */}
        {previewUrl ? (
          <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="relative h-16 w-16 overflow-hidden rounded-md border border-gray-300 bg-white">
              <Image
                src={previewUrl}
                alt="Vista previa"
                fill
                sizes="64px"
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="flex-1 text-xs">
              <p className="font-medium text-gray-800 truncate">{selectedFile?.name}</p>
              <p className="text-gray-500">
                {selectedFile ? (selectedFile.size / 1024).toFixed(1) + " KB" : ""}
                {hasCropped ? " (recortada y optimizada)" : ""}
              </p>
              {enableCrop && !isSvg && selectedFile ? (
                <button
                  type="button"
                  onClick={() => setIsCropperOpen(true)}
                  className="mt-1 font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  {hasCropped ? "Volver a ajustar recorte" : "Ajustar / Recortar imagen"}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" disabled={pending || !selectedFile}>
            {pending ? "Subiendo..." : buttonText}
          </Button>
          {enableCrop && !isSvg && selectedFile && !hasCropped ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCropperOpen(true)}
              disabled={pending}
            >
              Ajustar recorte
            </Button>
          ) : null}
        </div>

        {state.message ? (
          <p
            role="status"
            className={`text-sm ${state.success ? "text-emerald-700 font-medium" : "text-red-700"}`}
          >
            {state.message}
          </p>
        ) : null}
      </form>

      {/* Modal de recorte */}
      {selectedFile && enableCrop && !isSvg ? (
        <ImageCropperModal
          file={selectedFile}
          isOpen={isCropperOpen}
          defaultAspectRatio={aspectRatio}
          onClose={() => setIsCropperOpen(false)}
          onCropComplete={handleCropComplete}
        />
      ) : null}
    </>
  );
}
