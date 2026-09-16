"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { BatchUploadState } from "@/app/dashboard/leagues/[slug]/media/actions";

interface MultiImageUploadFormProps {
  action: (state: BatchUploadState, formData: FormData) => Promise<BatchUploadState>;
  helpText?: string;
  buttonText?: string;
}

export function MultiImageUploadForm({
  action,
  helpText = "Formatos JPG, PNG o WebP. Máx. 4 MB por imagen.",
  buttonText = "Subir imágenes",
}: MultiImageUploadFormProps) {
  const [state, formAction, pending] = useActionState(action, {
    success: false,
    message: null,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Array<{ name: string; size: number; url: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Combinar archivos nuevos sin duplicados por nombre y tamaño
    setSelectedFiles((prev) => {
      const combined = [...prev];
      for (const f of files) {
        if (!combined.some((item) => item.name === f.name && item.size === f.size)) {
          combined.push(f);
        }
      }
      return combined;
    });

    const newPreviews = files.map((f) => ({
      name: f.name,
      size: f.size,
      url: URL.createObjectURL(f),
    }));

    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const item = prev[index];
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((_, i) => i !== index);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearAll = () => {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setSelectedFiles([]);
    setPreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form
      action={async (formData) => {
        // Limpiar images y agregar explícitamente los archivos seleccionados actuales
        formData.delete("images");
        for (const file of selectedFiles) {
          formData.append("images", file);
        }
        await formAction(formData);
        if (state.success) {
          handleClearAll();
        }
      }}
      className="space-y-4"
    >
      <div className="space-y-1">
        <label htmlFor="multi-image-input" className="block text-sm font-medium text-gray-700">
          Seleccionar una o más imágenes
        </label>
        <input
          id="multi-image-input"
          ref={fileInputRef}
          type="file"
          name="images"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFilesChange}
          className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-gray-700 hover:file:bg-gray-200"
        />
        <p className="text-xs text-gray-500">{helpText}</p>
      </div>

      {previews.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-gray-700">
            <span>{previews.length} archivo(s) seleccionado(s)</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700 hover:underline"
            >
              Quitar todos
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {previews.map((preview, index) => (
              <div
                key={`${preview.name}-${index}`}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-1 text-center shadow-sm"
              >
                <div className="relative h-24 w-full overflow-hidden rounded bg-white">
                  <Image
                    src={preview.url}
                    alt={preview.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <p className="mt-1 truncate px-1 text-[11px] font-medium text-gray-800" title={preview.name}>
                  {preview.name}
                </p>
                <p className="text-[10px] text-gray-500">{(preview.size / 1024).toFixed(0)} KB</p>

                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  aria-label={`Quitar imagen ${preview.name}`}
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white opacity-90 transition hover:bg-black group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending || selectedFiles.length === 0}>
          {pending
            ? `Subiendo ${selectedFiles.length} imagen(es)...`
            : `${buttonText} (${selectedFiles.length})`}
        </Button>
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
  );
}
