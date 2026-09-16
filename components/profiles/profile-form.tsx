"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { ProfileDetailsState } from "@/app/dashboard/profile/actions";

interface ProfileFormProps {
  initialDisplayName: string | null;
  initialFullName: string | null;
  initialPhone: string | null;
  action: (state: ProfileDetailsState, formData: FormData) => Promise<ProfileDetailsState>;
}

export function ProfileForm({
  initialDisplayName,
  initialFullName,
  initialPhone,
  action,
}: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(action, {
    success: false,
    message: null,
  });

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
          Nombre para mostrar
        </label>
        <input
          id="displayName"
          type="text"
          name="displayName"
          defaultValue={initialDisplayName || ""}
          placeholder="Ej. Coach Carlos"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Este nombre se mostrará en los encabezados y asignaciones.
        </p>
      </div>

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Nombre completo
        </label>
        <input
          id="fullName"
          type="text"
          name="fullName"
          defaultValue={initialFullName || ""}
          placeholder="Ej. Carlos Martínez López"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Teléfono de contacto
        </label>
        <input
          id="phone"
          type="tel"
          name="phone"
          defaultValue={initialPhone || ""}
          placeholder="Ej. +52 55 1234 5678"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Guardando..." : "Guardar información"}
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
