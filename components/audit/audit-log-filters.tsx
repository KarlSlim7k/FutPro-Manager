"use client";

import { TextLink } from "@/components/ui/text-link";

interface AuditLogFiltersProps {
  currentAction?: string;
  currentEntityType?: string;
  currentActorId?: string;
  currentFrom?: string;
  currentTo?: string;
  slug: string;
}

export function AuditLogFilters({
  currentAction,
  currentEntityType,
  currentActorId,
  currentFrom,
  currentTo,
  slug,
}: AuditLogFiltersProps) {
  return (
    <form
      method="GET"
      action={`/dashboard/leagues/${slug}/audit`}
      className="flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="audit-action" className="text-xs font-medium text-gray-500">
          Accion
        </label>
        <select
          id="audit-action"
          name="action"
          defaultValue={currentAction ?? ""}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
        >
          <option value="">Todas</option>
          <option value="member.role_updated">member.role_updated</option>
          <option value="match.referee_updated">match.referee_updated</option>
          <option value="match.referee_removed">match.referee_removed</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="audit-entity-type" className="text-xs font-medium text-gray-500">
          Tipo de entidad
        </label>
        <input
          id="audit-entity-type"
          name="entityType"
          type="text"
          defaultValue={currentEntityType ?? ""}
          placeholder="ej: match, league_member"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="audit-actor-id" className="text-xs font-medium text-gray-500">
          ID de actor
        </label>
        <input
          id="audit-actor-id"
          name="actorId"
          type="text"
          defaultValue={currentActorId ?? ""}
          placeholder="UUID del actor"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="audit-from" className="text-xs font-medium text-gray-500">
          Desde
        </label>
        <input
          id="audit-from"
          name="from"
          type="date"
          defaultValue={currentFrom ?? ""}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="audit-to" className="text-xs font-medium text-gray-500">
          Hasta
        </label>
        <input
          id="audit-to"
          name="to"
          type="date"
          defaultValue={currentTo ?? ""}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
        />
      </div>

      <div className="flex items-end gap-2">
        <button
          type="submit"
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
        >
          Filtrar
        </button>
        <TextLink href={`/dashboard/leagues/${slug}/audit`} variant="muted">
          Limpiar filtros
        </TextLink>
      </div>
    </form>
  );
}
