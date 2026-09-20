"use client";

import { useState } from "react";
import { DollarSign, CheckCircle2, Clock, Wallet, ChevronDown, ChevronUp } from "lucide-react";
import type { RefereeEarningsSummary } from "@/lib/referees/referee-fees";

interface RefereePayoutSummaryProps {
  summary: RefereeEarningsSummary;
}

export function RefereePayoutSummary({ summary }: RefereePayoutSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-xl backdrop-blur-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Honorarios y Liquidación Arbitral</h3>
            <p className="text-xs text-zinc-400">Balance de honorarios devengados en la temporada.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
        >
          <span>{isExpanded ? "Ocultar desglose" : "Ver desglose por partido"}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Total Devengado
          </span>
          <p className="mt-1 text-xl font-black text-white font-mono">${summary.totalEarned} MXN</p>
          <span className="text-[10px] text-zinc-500">{summary.totalMatches} partidos asignados</span>
        </div>

        <div className="rounded-lg bg-emerald-950/20 border border-emerald-900/40 p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            Honorarios Cobrados
          </span>
          <p className="mt-1 text-xl font-black text-emerald-400 font-mono">${summary.totalPaid} MXN</p>
          <span className="text-[10px] text-emerald-300/70">Liquidado por la liga/clubes</span>
        </div>

        <div className="rounded-lg bg-amber-950/20 border border-amber-900/40 p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
            Saldo Pendiente
          </span>
          <p className="mt-1 text-xl font-black text-amber-400 font-mono">${summary.totalPending} MXN</p>
          <span className="text-[10px] text-amber-300/70">Por cobrar este fin de semana</span>
        </div>
      </div>

      {/* Detailed breakdown list */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-zinc-800 space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
            Detalle de Encuentros y Tarifas:
          </span>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {summary.assignments.length === 0 ? (
              <p className="text-xs text-zinc-500">No hay partidos registrados aún.</p>
            ) : (
              summary.assignments.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg bg-zinc-900/40 border border-zinc-800 p-2.5 text-xs"
                >
                  <div>
                    <span className="font-bold text-white">
                      {item.homeTeamName} vs {item.awayTeamName}
                    </span>
                    <div className="text-[10px] text-zinc-400">
                      {item.roundName || "Partido"} · Rol:{" "}
                      <strong className="text-emerald-400 capitalize">
                        {item.role === "head_referee" ? "Central" : "Asistente"}
                      </strong>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-white text-sm">
                      ${item.feeAmount} MXN
                    </span>
                    <div>
                      {item.isPaid ? (
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          ✓ Cobrado
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 font-semibold">
                          ⏳ Pendiente
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
