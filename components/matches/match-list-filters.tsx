"use client";

import { useRouter, useSearchParams } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "scheduled", label: "Programado" },
  { value: "in_progress", label: "En juego" },
  { value: "completed", label: "Finalizado" },
  { value: "postponed", label: "Pospuesto" },
  { value: "cancelled", label: "Cancelado" },
];

export function MatchListFilters({
  teams,
  currentStatus,
  currentTeamId,
  currentRound,
  showMyMatchesFilter = false,
  onlyMyMatches = false,
}: {
  teams: Array<{ id: string; name: string }>;
  currentStatus?: string;
  currentTeamId?: string;
  currentRound?: string;
  showMyMatchesFilter?: boolean;
  onlyMyMatches?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  const hasActiveFilters = Boolean(currentStatus || currentTeamId || currentRound || onlyMyMatches);

  function clearFilters() {
    router.replace("?", { scroll: false });
  }

  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end">
      <div className="flex flex-col gap-1 w-full lg:w-auto">
        <label htmlFor="match-filter-status" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Estado
        </label>
        <select
          id="match-filter-status"
          defaultValue={currentStatus ?? ""}
          onChange={(e) => updateParam("status", e.target.value)}
          className="h-11 w-full rounded-lg border border-gray-200 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1 w-full lg:w-auto">
        <label htmlFor="match-filter-team" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Equipo
        </label>
        <select
          id="match-filter-team"
          defaultValue={currentTeamId ?? ""}
          onChange={(e) => updateParam("teamId", e.target.value)}
          className="h-11 w-full rounded-lg border border-gray-200 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
        >
          <option value="">Todos los equipos</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1 w-full lg:w-auto">
        <label htmlFor="match-filter-round" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Jornada / Ronda
        </label>
        <input
          id="match-filter-round"
          type="text"
          defaultValue={currentRound ?? ""}
          placeholder="Ej: Jornada 5"
          onChange={(e) => updateParam("round", e.target.value)}
          className="h-11 w-full rounded-lg border border-gray-200 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
        />
      </div>

      {showMyMatchesFilter ? (
        <div className="flex items-center min-h-[44px]">
          <label className="flex cursor-pointer items-center gap-2 select-none text-xs font-medium text-gray-700 touch-manipulation">
            <input
              type="checkbox"
              defaultChecked={onlyMyMatches}
              onChange={(e) => updateParam("myMatches", e.target.checked ? "1" : "")}
              className="h-5 w-5 rounded border-gray-300 text-emerald-700 focus:ring-emerald-700"
            />
            <span className="font-semibold text-gray-900">Solo mis partidos asignados</span>
          </label>
        </div>
      ) : null}

      {hasActiveFilters ? (
        <div className="flex items-center min-h-[44px]">
          <button
            type="button"
            onClick={clearFilters}
            className="flex min-h-[44px] items-center text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline touch-manipulation"
          >
            Limpiar filtros
          </button>
        </div>
      ) : null}
    </div>
  );
}
