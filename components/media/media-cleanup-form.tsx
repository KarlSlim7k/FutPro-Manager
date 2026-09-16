"use client";

import { useActionState } from "react";
import { cleanupOrphanMediaAction, type CleanupMediaState } from "@/app/dashboard/leagues/[slug]/media/actions";

const initialState: CleanupMediaState = { success: false, message: null };

export function MediaCleanupForm({ leagueSlug }: { leagueSlug: string }) {
  const [state, formAction, isPending] = useActionState(
    cleanupOrphanMediaAction.bind(null, leagueSlug),
    initialState
  );

  return (
    <form action={formAction} className="space-y-2">
      <p className="text-sm text-gray-600">
        Elimina logos y fotos reemplazados o de entidades eliminadas (archivos con más de 24 horas sin uso).
      </p>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
      >
        {isPending ? "Limpiando..." : "Limpiar archivos huérfanos"}
      </button>
      {state.message ? (
        <p className={`text-sm ${state.success ? "text-emerald-700" : "text-red-700"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
