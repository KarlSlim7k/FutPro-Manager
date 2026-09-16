"use client";

import { useActionState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  purgeGlobalAuditLogsAction,
  type GlobalPurgeAuditState,
} from "@/app/dashboard/audit/actions";

const initialState: GlobalPurgeAuditState = { success: false, message: null };

interface GlobalAuditRetentionProps {
  stats: {
    total: number;
    olderThan90: number;
    olderThan180: number;
    olderThan365: number;
    oldestLogAt: string | null;
  } | null;
}

export function GlobalAuditRetention({ stats }: GlobalAuditRetentionProps) {
  const [state, formAction, isPending] = useActionState(purgeGlobalAuditLogsAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retención y salud de auditoría</CardTitle>
        <p className="mt-1 text-xs text-gray-500">
          Ámbito global. La purga solo elimina logs con liga asignada; los logs globales se
          conservan. Toda purga queda auditada.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <span className="block text-xl font-black text-gray-900">
                {stats.total.toLocaleString("es-MX")}
              </span>
              <span className="text-xs text-gray-500">Logs totales</span>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <span className="block text-xl font-black text-amber-700">
                {stats.olderThan90.toLocaleString("es-MX")}
              </span>
              <span className="text-xs text-gray-500">&gt; 90 días</span>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <span className="block text-xl font-black text-orange-700">
                {stats.olderThan180.toLocaleString("es-MX")}
              </span>
              <span className="text-xs text-gray-500">&gt; 180 días</span>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <span className="block text-xl font-black text-red-700">
                {stats.olderThan365.toLocaleString("es-MX")}
              </span>
              <span className="text-xs text-gray-500">&gt; 365 días</span>
            </div>
            {stats.oldestLogAt ? (
              <p className="col-span-2 text-xs text-gray-400 sm:col-span-4">
                Registro más antiguo:{" "}
                {new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(
                  new Date(stats.oldestLogAt)
                )}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No fue posible cargar las estadísticas de auditoría.
          </p>
        )}

        <form action={formAction} className="flex flex-wrap items-end gap-3">
          <div>
            <label
              htmlFor="global-audit-retention-days"
              className="mb-1 block text-xs font-medium text-gray-500"
            >
              Purgar logs de liga anteriores a
            </label>
            <select
              id="global-audit-retention-days"
              name="days"
              defaultValue="365"
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
            >
              <option value="90">90 días</option>
              <option value="180">180 días</option>
              <option value="365">365 días</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
          >
            {isPending ? "Purgando..." : "Purgar auditoría global"}
          </button>
          {state.message ? (
            <span
              className={`text-xs ${state.success ? "text-emerald-700" : "text-red-600"}`}
            >
              {state.message}
            </span>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
