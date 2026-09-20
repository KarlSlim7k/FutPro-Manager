"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, X, Filter } from "lucide-react";
import type { AppRole } from "@/types/database";
import { ALLOWED_TUTORIAL_TAGS, APP_ROLE_LABELS } from "@/lib/tutorials/roles";

export interface TutorialFiltersProps {
  availableRoles: AppRole[];
  currentRole?: string;
  currentTag?: string;
  currentQ?: string;
}

export function TutorialFilters({
  availableRoles,
  currentRole = "",
  currentTag = "",
  currentQ = "",
}: TutorialFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value.trim() === "") {
          params.delete(key);
        } else {
          params.set(key, value.trim());
        }
      });

      startTransition(() => {
        const queryStr = params.toString();
        router.replace(queryStr ? `${pathname}?${queryStr}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const hasActiveFilters = Boolean(currentQ || currentRole || currentTag);

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Input de búsqueda textual */}
        <div className="relative flex-1">
          <label htmlFor="search-tutorials" className="sr-only">
            Buscar tutoriales
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </div>
          <input
            id="search-tutorials"
            type="text"
            defaultValue={currentQ}
            placeholder="Buscar por título o palabra clave..."
            maxLength={100}
            onChange={(e) => updateFilters({ q: e.target.value })}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Selectores de Rol y Tag */}
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          {/* Filtro por rol */}
          <div className="relative min-w-[150px] flex-1 sm:flex-initial">
            <label htmlFor="filter-role" className="sr-only">
              Filtrar por rol
            </label>
            <select
              id="filter-role"
              value={currentRole}
              onChange={(e) => updateFilters({ rol: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos mis roles</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {APP_ROLE_LABELS[role] ?? role}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por tag */}
          <div className="relative min-w-[150px] flex-1 sm:flex-initial">
            <label htmlFor="filter-tag" className="sr-only">
              Filtrar por etiqueta
            </label>
            <select
              id="filter-tag"
              value={currentTag}
              onChange={(e) => updateFilters({ tag: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todas las etiquetas</option>
              {ALLOWED_TUTORIAL_TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          </div>

          {/* Limpiar filtros */}
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => updateFilters({ q: null, rol: null, tag: null })}
              disabled={isPending}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Limpiar</span>
            </button>
          ) : null}
        </div>
      </div>

      {isPending && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Filter className="h-3 w-3 animate-spin" aria-hidden="true" />
          <span>Actualizando resultados...</span>
        </div>
      )}
    </div>
  );
}
