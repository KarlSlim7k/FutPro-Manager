"use client";

import { useActionState } from "react";
import {
  purgeContactMessagesAction,
  type PurgeContactMessagesState,
} from "@/app/dashboard/contact-messages/actions";

const initialState: PurgeContactMessagesState = { success: false, message: null };

interface ContactRetentionProps {
  stats: { total: number; last30Days: number } | null;
}

export function ContactRetention({ stats }: ContactRetentionProps) {
  const [state, formAction, isPending] = useActionState(purgeContactMessagesAction, initialState);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xs sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Retención de mensajes</h3>
        {stats ? (
          <p className="mt-0.5 text-xs text-gray-500">
            {stats.total.toLocaleString("es-MX")} mensaje(s) en total ·{" "}
            {stats.last30Days.toLocaleString("es-MX")} en los últimos 30 días. Toda purga queda
            auditada.
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-gray-400">
            Estadísticas no disponibles (¿migración pendiente?).
          </p>
        )}
      </div>
      <form action={formAction} className="flex flex-wrap items-end gap-2">
        <div>
          <label htmlFor="contact-retention-days" className="mb-1 block text-xs text-gray-500">
            Eliminar anteriores a
          </label>
          <select
            id="contact-retention-days"
            name="days"
            defaultValue="365"
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700"
          >
            <option value="90">90 días</option>
            <option value="180">180 días</option>
            <option value="365">365 días</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
        >
          {isPending ? "Purgando..." : "Purgar"}
        </button>
        {state.message ? (
          <span className={`text-xs ${state.success ? "text-emerald-700" : "text-red-600"}`}>
            {state.message}
          </span>
        ) : null}
      </form>
    </div>
  );
}
