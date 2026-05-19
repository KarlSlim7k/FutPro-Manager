"use client";

import { useActionState } from "react";

type UploadState = { success: boolean; message: string | null };

interface EntityImageUploadFormProps {
  action: (state: UploadState, formData: FormData) => Promise<UploadState>;
  helpText: string;
  buttonText: string;
}

export function EntityImageUploadForm({ action, helpText, buttonText }: EntityImageUploadFormProps) {
  const [state, formAction, pending] = useActionState(action, { success: false, message: null });

  return (
    <form action={formAction} className="space-y-3">
      <input
        type="file"
        name="image"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        required
        className="block w-full text-sm text-gray-700"
      />
      <p className="text-xs text-gray-500">{helpText}</p>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {pending ? "Subiendo..." : buttonText}
      </button>
      {state.message ? (
        <p className={`text-sm ${state.success ? "text-emerald-700" : "text-red-700"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
