"use client";

import { useState } from "react";
import { DollarSign, Check, Copy, CheckCircle2, AlertCircle, Share2, Users, Wallet } from "lucide-react";

export type CooperachaPlayer = {
  id: string;
  name: string;
  jerseyNumber?: number | null;
  paid: boolean;
  amountPaid: number;
};

interface TeamCooperachaManagerProps {
  teamName: string;
  players: Array<{ id: string; full_name: string; preferred_number?: number | null }>;
}

export function TeamCooperachaManager({ teamName, players }: TeamCooperachaManagerProps) {
  const [concept, setConcept] = useState("Arbitraje del fin de semana");
  const [targetAmount, setTargetAmount] = useState(600);
  const [feePerPlayer, setFeePerPlayer] = useState(50);
  const [copied, setCopied] = useState(false);

  const [playerList, setPlayerList] = useState<CooperachaPlayer[]>(
    players.map((p) => ({
      id: p.id,
      name: p.full_name,
      jerseyNumber: p.preferred_number,
      paid: false,
      amountPaid: 0,
    }))
  );

  const togglePaid = (id: string) => {
    setPlayerList((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextPaid = !p.paid;
          return {
            ...p,
            paid: nextPaid,
            amountPaid: nextPaid ? feePerPlayer : 0,
          };
        }
        return p;
      })
    );
  };

  const updateAmount = (id: string, amount: number) => {
    setPlayerList((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            paid: amount > 0,
            amountPaid: amount,
          };
        }
        return p;
      })
    );
  };

  const totalCollected = playerList.reduce((sum, p) => sum + p.amountPaid, 0);
  const paidCount = playerList.filter((p) => p.paid).length;
  const pendingCount = playerList.length - paidCount;
  const difference = totalCollected - targetAmount;

  const handleCopyReport = () => {
    const paidList = playerList.filter((p) => p.paid);
    const pendingList = playerList.filter((p) => !p.paid);

    const text = `💰 *Control de Cooperacha - ${teamName}*
📌 *Concepto:* ${concept}
🎯 *Meta a cubrir:* $${targetAmount} MXN ($${feePerPlayer} c/u)
💵 *Recaudado:* $${totalCollected} MXN ${
      difference >= 0 ? `(¡Meta cubierta! Sobrante: +$${difference})` : `(Faltan: $${Math.abs(difference)} MXN)`
    }

✅ *Pagaron (${paidList.length}):*
${paidList.map((p, i) => `${i + 1}. ${p.name} ($${p.amountPaid})`).join("\n") || "Ninguno todavía"}

⏳ *Pendientes (${pendingList.length}):*
${pendingList.map((p, i) => `${i + 1}. ${p.name} ($${feePerPlayer})`).join("\n") || "¡Todos al corriente! 🎉"}

_FutPro Manager · Control de Club_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header Card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <Wallet className="h-6 w-6 text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Cooperacha y Finanzas: {teamName}</h2>
              <p className="text-xs text-zinc-400">
                Control semanal de cobro de arbitraje, hidratación y cuotas de jugadores.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyReport}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow transition-colors hover:bg-emerald-500 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-white" />
                ¡Copiado para WhatsApp!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar Reporte para WhatsApp
              </>
            )}
          </button>
        </div>

        {/* Inputs row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Concepto del Gasto:
            </label>
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Total a Pagar ($ MXN):
            </label>
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Cuota sugerida por jugador ($):
            </label>
            <input
              type="number"
              value={feePerPlayer}
              onChange={(e) => setFeePerPlayer(Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Financial Progress Bar */}
        <div className="mt-6 rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-300">Progreso de Recaudación:</span>
            <span className="font-mono font-bold text-sm">
              <span className={difference >= 0 ? "text-emerald-400" : "text-amber-400"}>
                ${totalCollected}
              </span>{" "}
              / ${targetAmount} MXN
            </span>
          </div>

          <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                difference >= 0 ? "bg-emerald-500" : "bg-gradient-to-r from-amber-500 to-emerald-500"
              }`}
              style={{
                width: `${Math.min(100, targetAmount > 0 ? (totalCollected / targetAmount) * 100 : 0)}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
            <span>
              ✅ {paidCount} han pagado · ⏳ {pendingCount} pendientes
            </span>
            <span>
              {difference >= 0 ? (
                <strong className="text-emerald-400">¡Arbitraje cubierto al 100%!</strong>
              ) : (
                <strong className="text-amber-400">Faltan ${Math.abs(difference)} MXN</strong>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Players Collection Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/80 shadow-xl backdrop-blur-md">
        <table className="min-w-full divide-y divide-zinc-800 text-left text-xs text-zinc-300">
          <thead className="bg-zinc-900/80 font-bold uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-4 py-3">Jugador</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3 text-right">Monto Aportado</th>
              <th className="px-4 py-3 text-right">Acción Rápida</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-medium">
            {playerList.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  No hay jugadores registrados en la plantilla del club.
                </td>
              </tr>
            ) : (
              playerList.map((player) => (
                <tr
                  key={player.id}
                  className={`transition-colors ${
                    player.paid ? "bg-emerald-950/10 hover:bg-emerald-950/20" : "hover:bg-zinc-900/40"
                  }`}
                >
                  <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                    {player.jerseyNumber && (
                      <span className="text-zinc-500 font-mono text-[10px]">
                        #{player.jerseyNumber}
                      </span>
                    )}
                    <span>{player.name}</span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    {player.paid ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" />
                        PAGADO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
                        PENDIENTE
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right font-mono">
                    <input
                      type="number"
                      value={player.amountPaid}
                      onChange={(e) => updateAmount(player.id, Number(e.target.value))}
                      className="w-20 rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-right text-xs text-zinc-100 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => togglePaid(player.id)}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                        player.paid
                          ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                          : "bg-emerald-600 text-white hover:bg-emerald-500 shadow"
                      }`}
                    >
                      {player.paid ? "Desmarcar" : "Marcar Pagado"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
