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

  return (
    <div className="flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="match-filter-status" className="text-xs font-medium text-gray-500">
          Estado
        </label>
        <select
          id="match-filter-status"
          defaultValue={currentStatus ?? ""}
          onChange={(e) => updateParam("status", e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="match-filter-team" className="text-xs font-medium text-gray-500">
          Equipo
        </label>
        <select
          id="match-filter-team"
          defaultValue={currentTeamId ?? ""}
          onChange={(e) => updateParam("teamId", e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
        >
          <option value="">Todos los equipos</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="match-filter-round" className="text-xs font-medium text-gray-500">
          Jornada / Ronda
        </label>
        <input
          id="match-filter-round"
          type="text"
          defaultValue={currentRound ?? ""}
          placeholder="Ej: Jornada 5"
          onChange={(e) => updateParam("round", e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
        />
      </div>

      {showMyMatchesFilter ? (
        <div className="flex flex-col justify-end pb-2">
          <label className="flex cursor-pointer items-center gap-2 select-none text-xs font-medium text-gray-700">
            <input
              type="checkbox"
              defaultChecked={onlyMyMatches}
              onChange={(e) => updateParam("myMatches", e.target.checked ? "1" : "")}
              className="h-4 w-4 rounded border-gray-300 text-emerald-700 focus:ring-emerald-700"
            />
            <span>Solo mis partidos asignados</span>
          </label>
        </div>
      ) : null}
    </div>
  );
}
