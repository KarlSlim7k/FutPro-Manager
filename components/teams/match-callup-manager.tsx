"use client";

import { useState } from "react";
import { Users, Copy, Check, Calendar, MapPin, Shirt, CheckCircle2, Clock, XCircle } from "lucide-react";

export type CallupPlayer = {
  id: string;
  name: string;
  jerseyNumber?: number | null;
  position?: string | null;
  isCalledUp: boolean;
  status: "confirmed" | "pending" | "declined";
};

export type MatchOption = {
  id: string;
  opponentName: string;
  roundName: string;
  scheduledAt: string;
  venueName?: string | null;
  isHome: boolean;
};

interface MatchCallupManagerProps {
  teamName: string;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  upcomingMatches: MatchOption[];
  rosterPlayers: Array<{
    id: string;
    full_name: string;
    preferred_number?: number | null;
    preferred_position?: string | null;
  }>;
}

export function MatchCallupManager({
  teamName,
  primaryColor,
  secondaryColor,
  upcomingMatches,
  rosterPlayers,
}: MatchCallupManagerProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    upcomingMatches[0]?.id || ""
  );
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState("Llegar 30 minutos antes para calentamiento.");

  const [players, setPlayers] = useState<CallupPlayer[]>(
    rosterPlayers.map((p) => ({
      id: p.id,
      name: p.full_name,
      jerseyNumber: p.preferred_number,
      position: p.preferred_position,
      isCalledUp: true,
      status: "confirmed",
    }))
  );

  const selectedMatch = upcomingMatches.find((m) => m.id === selectedMatchId);

  const toggleCallup = (id: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isCalledUp: !p.isCalledUp } : p))
    );
  };

  const updateStatus = (id: string, status: "confirmed" | "pending" | "declined") => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  };

  const selectAll = (call: boolean) => {
    setPlayers((prev) => prev.map((p) => ({ ...p, isCalledUp: call })));
  };

  const calledUpList = players.filter((p) => p.isCalledUp);

  const handleCopyWhatsApp = () => {
    if (!selectedMatch) return;

    const dateFormatted = new Date(selectedMatch.scheduledAt).toLocaleString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });

    const confirmed = calledUpList.filter((p) => p.status === "confirmed");
    const pending = calledUpList.filter((p) => p.status === "pending");
    const declined = calledUpList.filter((p) => p.status === "declined");

    const text = `📋 *CONVOCATORIA OFICIAL: ${teamName}*
━━━━━━━━━━━━━━━━━━━━
🏆 *${selectedMatch.roundName}*
🆚 *vs ${selectedMatch.opponentName}* (${selectedMatch.isHome ? "Local" : "Visitante"})
📅 *Fecha:* ${dateFormatted}
📍 *Cancha:* ${selectedMatch.venueName || "Por definir"}
🎽 *Uniforme:* ${selectedMatch.isHome ? "Titular" : "Visitante"}

👥 *Jugadores Convocados (${calledUpList.length}):*
${confirmed.map((p, i) => `✅ ${i + 1}. ${p.name} ${p.jerseyNumber ? `(#${p.jerseyNumber})` : ""}`).join("\n")}
${pending.length > 0 ? `\n⏳ *Por Confirmar:*\n${pending.map((p) => `• ${p.name}`).join("\n")}` : ""}
${declined.length > 0 ? `\n⛔ *Bajas / No asisten:*\n${declined.map((p) => `• ${p.name}`).join("\n")}` : ""}

⚠️ *Indicaciones:* ${notes}
━━━━━━━━━━━━━━━━━━━━
_FutPro Manager · Sistema de Gestión de Clubes_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Match Selector Card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <Users className="h-6 w-6 text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Convocatorias Pre-Partido: {teamName}</h2>
              <p className="text-xs text-zinc-400">
                Selecciona la nómina citada para el fin de semana y notifica al grupo por WhatsApp.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={!selectedMatch || calledUpList.length === 0}
            onClick={handleCopyWhatsApp}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow transition-colors hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-white" />
                ¡Convocatoria Copiada!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar para WhatsApp
              </>
            )}
          </button>
        </div>

        {/* Match Selection Dropdown */}
        {upcomingMatches.length === 0 ? (
          <p className="text-xs text-zinc-500">No hay partidos próximos programados para este equipo.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Selecciona el Encuentro:
              </label>
              <select
                value={selectedMatchId}
                onChange={(e) => setSelectedMatchId(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              >
                {upcomingMatches.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.roundName} vs {m.opponentName} ({m.isHome ? "Local" : "Visita"}) -{" "}
                    {new Date(m.scheduledAt).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                    })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Indicaciones de Cuerpo Técnico:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Players Selection Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white">Plantilla de Convocados</span>
            <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-xs font-mono font-bold">
              {calledUpList.length} convocados
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => selectAll(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
            >
              Convocar a todos
            </button>
            <span className="text-zinc-600">·</span>
            <button
              type="button"
              onClick={() => selectAll(false)}
              className="text-xs text-zinc-400 hover:text-white font-medium cursor-pointer"
            >
              Desmarcar todos
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <div
              key={player.id}
              className={`rounded-xl border p-3 text-xs transition-all ${
                player.isCalledUp
                  ? "border-emerald-500/40 bg-zinc-900/90 shadow"
                  : "border-zinc-800/80 bg-zinc-950/50 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 cursor-pointer select-none truncate">
                  <input
                    type="checkbox"
                    checked={player.isCalledUp}
                    onChange={() => toggleCallup(player.id)}
                    className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-white truncate">{player.name}</span>
                </label>
                {player.jerseyNumber && (
                  <span className="font-mono text-zinc-400 font-bold bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">
                    #{player.jerseyNumber}
                  </span>
                )}
              </div>

              {player.isCalledUp && (
                <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-1 text-[11px]">
                  <span className="text-zinc-400">Asistencia:</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => updateStatus(player.id, "confirmed")}
                      className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                        player.status === "confirmed"
                          ? "bg-emerald-600 text-white font-bold"
                          : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(player.id, "pending")}
                      className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                        player.status === "pending"
                          ? "bg-amber-600 text-white font-bold"
                          : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Duda
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(player.id, "declined")}
                      className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                        player.status === "declined"
                          ? "bg-red-600 text-white font-bold"
                          : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
