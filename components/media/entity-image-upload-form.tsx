"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";

type UploadState = { success: boolean; message: string | null };

interface EntityImageUploadFormProps {
  action: (state: UploadState, formData: FormData) => Promise<UploadState>;
  helpText: string;
  buttonText: string;
  accept?: string;
}

export function EntityImageUploadForm({
  action,
  helpText,
  buttonText,
  accept = "image/jpeg,image/png,image/webp",
}: EntityImageUploadFormProps) {
  const [state, formAction, pending] = useActionState(action, { success: false, message: null });

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="entity-image-input" className="text-sm font-medium text-gray-700">
          Imagen
        </label>
        <input
          id="entity-image-input"
          type="file"
          name="image"
          accept={accept}
          required
          className="block w-full text-sm text-gray-700"
        />
        <p className="text-xs text-gray-500">{helpText}</p>
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Subiendo..." : buttonText}
      </Button>
      {state.message ? (
        <p className={`text-sm ${state.success ? "text-emerald-700" : "text-red-700"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
