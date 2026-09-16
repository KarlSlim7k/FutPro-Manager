"use client";

import { useActionState } from "react";
import { purgeAuditLogsAction, type PurgeAuditState } from "@/app/dashboard/leagues/[slug]/audit/actions";

const initialState: PurgeAuditState = { success: false, message: null };

export function AuditRetentionForm({ leagueSlug }: { leagueSlug: string }) {
  const [state, formAction, isPending] = useActionState(
    purgeAuditLogsAction.bind(null, leagueSlug),
    initialState
  );

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="audit-retention-days" className="text-xs font-medium text-gray-500">
          Eliminar registros anteriores a
        </label>
        <select
          id="audit-retention-days"
          name="days"
          defaultValue="180"
          disabled={isPending}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
        >
          <option value="90">90 días</option>
          <option value="180">180 días</option>
          <option value="365">365 días</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
      >
        {isPending ? "Purgando..." : "Purgar auditoría"}
      </button>
      {state.message ? (
        <p className={`w-full text-sm ${state.success ? "text-emerald-700" : "text-red-700"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
