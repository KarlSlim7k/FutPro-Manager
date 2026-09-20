"use client";

import { useState, useTransition } from "react";
import { AlertOctagon, CheckCircle2, ShieldAlert, Search, Filter, Loader2, Sparkles } from "lucide-react";
import type { PlayerCardRecord } from "@/lib/discipline/discipline-engine";
import { togglePlayerSuspensionAction } from "@/app/dashboard/leagues/[slug]/seasons/[seasonSlug]/discipline/actions";

interface DisciplineTableProps {
  leagueSlug: string;
  seasonSlug: string;
  initialRecords: PlayerCardRecord[];
  canManage: boolean;
}

export function DisciplineTable({
  leagueSlug,
  seasonSlug,
  initialRecords,
  canManage,
}: DisciplineTableProps) {
  const [records, setRecords] = useState(initialRecords);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "suspended" | "warning">("all");
  const [isPending, startTransition] = useTransition();
  const [loadingPlayerId, setLoadingPlayerId] = useState<string | null>(null);

  const handleToggle = (record: PlayerCardRecord) => {
    if (!canManage) return;
    setLoadingPlayerId(record.playerId);

    startTransition(async () => {
      const res = await togglePlayerSuspensionAction(
        leagueSlug,
        seasonSlug,
        record.playerId,
        record.isSuspended ? "suspended" : "active"
      );

      if (res.success) {
        setRecords((prev) =>
          prev.map((r) =>
            r.playerId === record.playerId
              ? {
                  ...r,
                  isSuspended: !r.isSuspended,
                  suspensionReason: !r.isSuspended
                    ? "Suspensión administrativa activa"
                    : undefined,
                }
              : r
          )
        );
      }
      setLoadingPlayerId(null);
    });
  };

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.teamName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === "suspended") return r.isSuspended;
    if (filterType === "warning") return !!r.warningNotice && !r.isSuspended;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por jugador o equipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              filterType === "all"
                ? "bg-zinc-800 text-white"
                : "bg-zinc-900/60 text-zinc-400 hover:text-white"
            }`}
          >
            Todos ({records.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("suspended")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterType === "suspended"
                ? "bg-red-600 text-white"
                : "bg-zinc-900/60 text-red-400 hover:bg-red-950/40"
            }`}
          >
            <AlertOctagon className="h-3.5 w-3.5" />
            Suspendidos ({records.filter((r) => r.isSuspended).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("warning")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterType === "warning"
                ? "bg-amber-600 text-white"
                : "bg-zinc-900/60 text-amber-400 hover:bg-amber-950/40"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Al límite ({records.filter((r) => r.warningNotice && !r.isSuspended).length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/80 shadow-xl backdrop-blur-md">
        <table className="min-w-full divide-y divide-zinc-800 text-left text-xs text-zinc-300">
          <thead className="bg-zinc-900/80 font-bold uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-4 py-3">Jugador / Equipo</th>
              <th className="px-4 py-3 text-center">Amarillas</th>
              <th className="px-4 py-3 text-center">Rojas</th>
              <th className="px-4 py-3">Estatus Disciplinario</th>
              <th className="px-4 py-3">Causa / Observación</th>
              {canManage && <th className="px-4 py-3 text-right">Acción</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 6 : 5} className="px-4 py-8 text-center text-zinc-500">
                  No hay registros disciplinarios con los filtros actuales.
                </td>
              </tr>
            ) : (
              filtered.map((record) => (
                <tr
                  key={record.playerId}
                  className={`transition-colors hover:bg-zinc-900/40 ${
                    record.isSuspended ? "bg-red-950/10" : record.warningNotice ? "bg-amber-950/10" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {record.jerseyNumber && (
                        <span className="text-[10px] text-zinc-400 font-mono">
                          #{record.jerseyNumber}
                        </span>
                      )}
                      {record.playerName}
                    </div>
                    <div className="text-[11px] text-emerald-400/90">{record.teamName}</div>
                  </td>

                  <td className="px-4 py-3 text-center font-bold">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono">
                      {record.yellowCardsTotal}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center font-bold">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded bg-red-500/20 text-red-400 border border-red-500/40 font-mono">
                      {record.redCardsTotal}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {record.isSuspended ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400 border border-red-500/30">
                        <AlertOctagon className="h-3.5 w-3.5" />
                        SUSPENDIDO
                      </span>
                    ) : record.warningNotice ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        AL LÍMITE (2/3)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        HABILITADO
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-zinc-400 text-xs max-w-xs truncate">
                    {record.suspensionReason || record.warningNotice || "Sin sanciones vigentes"}
                  </td>

                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={loadingPlayerId === record.playerId}
                        onClick={() => handleToggle(record)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold shadow transition-colors cursor-pointer ${
                          record.isSuspended
                            ? "bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/40"
                            : "bg-red-600/30 text-red-300 hover:bg-red-600 hover:text-white border border-red-500/40"
                        }`}
                      >
                        {loadingPlayerId === record.playerId ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" />
                        ) : record.isSuspended ? (
                          "Indultar / Habilitar"
                        ) : (
                          "Suspender"
                        )}
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
