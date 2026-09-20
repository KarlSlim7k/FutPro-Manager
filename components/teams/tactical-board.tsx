"use client";

import { useState } from "react";
import { Copy, Check, Sparkles, RotateCcw, Users } from "lucide-react";

export type TacticalPosition = {
  id: string;
  roleCode: string; // "POR", "DFI", "DFC", "DFD", "MCD", "MC", "MCO", "EI", "ED", "DC"
  label: string;
  top: number; // percentage from top (0-100)
  left: number; // percentage from left (0-100)
  playerId?: string | null;
};

export type FormationKey = "4-3-3" | "4-4-2" | "3-5-2" | "5-3-2" | "4-2-3-1";

export const FORMATIONS: Record<FormationKey, Array<Omit<TacticalPosition, "playerId">>> = {
  "4-3-3": [
    { id: "pos-1", roleCode: "POR", label: "Portero", top: 88, left: 50 },
    { id: "pos-2", roleCode: "LI", label: "Lat. Izquierdo", top: 70, left: 16 },
    { id: "pos-3", roleCode: "DFC", label: "Def. Central", top: 74, left: 38 },
    { id: "pos-4", roleCode: "DFC", label: "Def. Central", top: 74, left: 62 },
    { id: "pos-5", roleCode: "LD", label: "Lat. Derecho", top: 70, left: 84 },
    { id: "pos-6", roleCode: "MC", label: "Medio Centro", top: 48, left: 28 },
    { id: "pos-7", roleCode: "MCD", label: "Pivote", top: 56, left: 50 },
    { id: "pos-8", roleCode: "MC", label: "Medio Centro", top: 48, left: 72 },
    { id: "pos-9", roleCode: "EI", label: "Extremo Izq.", top: 22, left: 20 },
    { id: "pos-10", roleCode: "DC", label: "Delantero Centro", top: 16, left: 50 },
    { id: "pos-11", roleCode: "ED", label: "Extremo Der.", top: 22, left: 80 },
  ],
  "4-4-2": [
    { id: "pos-1", roleCode: "POR", label: "Portero", top: 88, left: 50 },
    { id: "pos-2", roleCode: "LI", label: "Lat. Izquierdo", top: 70, left: 16 },
    { id: "pos-3", roleCode: "DFC", label: "Def. Central", top: 74, left: 38 },
    { id: "pos-4", roleCode: "DFC", label: "Def. Central", top: 74, left: 62 },
    { id: "pos-5", roleCode: "LD", label: "Lat. Derecho", top: 70, left: 84 },
    { id: "pos-6", roleCode: "MI", label: "Medio Izquierdo", top: 46, left: 16 },
    { id: "pos-7", roleCode: "MC", label: "Medio Centro", top: 50, left: 38 },
    { id: "pos-8", roleCode: "MC", label: "Medio Centro", top: 50, left: 62 },
    { id: "pos-9", roleCode: "MD", label: "Medio Derecho", top: 46, left: 84 },
    { id: "pos-10", roleCode: "DC", label: "Delantero", top: 20, left: 38 },
    { id: "pos-11", roleCode: "DC", label: "Delantero", top: 20, left: 62 },
  ],
  "3-5-2": [
    { id: "pos-1", roleCode: "POR", label: "Portero", top: 88, left: 50 },
    { id: "pos-2", roleCode: "DFC", label: "Stopper Izq.", top: 72, left: 24 },
    { id: "pos-3", roleCode: "LIB", label: "Líbero Central", top: 75, left: 50 },
    { id: "pos-4", roleCode: "DFC", label: "Stopper Der.", top: 72, left: 76 },
    { id: "pos-5", roleCode: "CAR", label: "Carrilero Izq.", top: 46, left: 14 },
    { id: "pos-6", roleCode: "MC", label: "Volante Mixto", top: 52, left: 36 },
    { id: "pos-7", roleCode: "MCD", label: "Contención", top: 58, left: 50 },
    { id: "pos-8", roleCode: "MC", label: "Volante Mixto", top: 52, left: 64 },
    { id: "pos-9", roleCode: "CAR", label: "Carrilero Der.", top: 46, left: 86 },
    { id: "pos-10", roleCode: "DC", label: "Delantero", top: 18, left: 38 },
    { id: "pos-11", roleCode: "DC", label: "Delantero", top: 18, left: 62 },
  ],
  "5-3-2": [
    { id: "pos-1", roleCode: "POR", label: "Portero", top: 88, left: 50 },
    { id: "pos-2", roleCode: "CAR", label: "Carrilero Izq.", top: 66, left: 12 },
    { id: "pos-3", roleCode: "DFC", label: "Central Izq.", top: 74, left: 30 },
    { id: "pos-4", roleCode: "LIB", label: "Líbero", top: 76, left: 50 },
    { id: "pos-5", roleCode: "DFC", label: "Central Der.", top: 74, left: 70 },
    { id: "pos-6", roleCode: "CAR", label: "Carrilero Der.", top: 66, left: 88 },
    { id: "pos-7", roleCode: "MC", label: "Medio", top: 48, left: 30 },
    { id: "pos-8", roleCode: "MCD", label: "Pivote", top: 52, left: 50 },
    { id: "pos-9", roleCode: "MC", label: "Medio", top: 48, left: 70 },
    { id: "pos-10", roleCode: "DC", label: "Delantero", top: 18, left: 38 },
    { id: "pos-11", roleCode: "DC", label: "Delantero", top: 18, left: 62 },
  ],
  "4-2-3-1": [
    { id: "pos-1", roleCode: "POR", label: "Portero", top: 88, left: 50 },
    { id: "pos-2", roleCode: "LI", label: "Lat. Izquierdo", top: 70, left: 16 },
    { id: "pos-3", roleCode: "DFC", label: "Def. Central", top: 74, left: 38 },
    { id: "pos-4", roleCode: "DFC", label: "Def. Central", top: 74, left: 62 },
    { id: "pos-5", roleCode: "LD", label: "Lat. Derecho", top: 70, left: 84 },
    { id: "pos-6", roleCode: "MCD", label: "Doble Pivote", top: 56, left: 36 },
    { id: "pos-7", roleCode: "MCD", label: "Doble Pivote", top: 56, left: 64 },
    { id: "pos-8", roleCode: "MI", label: "Mediapunta Izq.", top: 34, left: 20 },
    { id: "pos-9", roleCode: "MCO", label: "Enganche", top: 32, left: 50 },
    { id: "pos-10", roleCode: "MD", label: "Mediapunta Der.", top: 34, left: 80 },
    { id: "pos-11", roleCode: "DC", label: "Centrodelantero", top: 14, left: 50 },
  ],
};

interface TacticalBoardProps {
  teamName: string;
  players: Array<{
    id: string;
    full_name: string;
    preferred_number?: number | null;
    preferred_position?: string | null;
  }>;
}

export function TacticalBoard({ teamName, players }: TacticalBoardProps) {
  const [formation, setFormation] = useState<FormationKey>("4-3-3");
  const [lineup, setLineup] = useState<Record<string, string>>({}); // positionId -> playerId
  const [copied, setCopied] = useState(false);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);

  const playersMap = new Map(players.map((p) => [p.id, p]));
  const positions = FORMATIONS[formation];

  const handleAssignPlayer = (positionId: string, playerId: string) => {
    setLineup((prev) => {
      const next = { ...prev };
      // Remove player from other slot if already assigned
      Object.keys(next).forEach((key) => {
        if (next[key] === playerId) {
          delete next[key];
        }
      });
      if (playerId === "none") {
        delete next[positionId];
      } else {
        next[positionId] = playerId;
      }
      return next;
    });
    setActiveSlot(null);
  };

  const handleAutoFill = () => {
    const next: Record<string, string> = {};
    positions.forEach((pos, idx) => {
      if (players[idx]) {
        next[pos.id] = players[idx].id;
      }
    });
    setLineup(next);
  };

  const handleClear = () => {
    setLineup({});
  };

  const handleCopyLineup = () => {
    const lines = positions.map((pos) => {
      const playerId = lineup[pos.id];
      const player = playerId ? playersMap.get(playerId) : null;
      const numStr = player?.preferred_number ? `#${player.preferred_number} ` : "";
      return `• ${pos.roleCode}: ${numStr}${player?.full_name || "(Vacante)"}`;
    });

    const text = `⚽ *ALINEACIÓN TÁCTICA: ${teamName}*
📐 *Formación:* ${formation}
━━━━━━━━━━━━━━━━━━━━
${lines.join("\n")}
━━━━━━━━━━━━━━━━━━━━
_FutPro Manager · Pizarra Táctica de Director Técnico_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-400" />
              Pizarra Táctica de Director Técnico: {teamName}
            </h2>
            <p className="text-xs text-zinc-400">
              Diseña el parado táctico en cancha, asigna titulares por posición y compártelo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoFill}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              Autocompletar
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpiar
            </button>
            <button
              type="button"
              onClick={handleCopyLineup}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  ¡Copiada!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar Alineación
                </>
              )}
            </button>
          </div>
        </div>

        {/* Formation Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 pr-2">
            Esquema:
          </span>
          {(Object.keys(FORMATIONS) as FormationKey[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFormation(f);
                setLineup({});
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                formation === f
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950"
                  : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Football Pitch Container */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Visual Football Field */}
        <div className="lg:col-span-2">
          <div className="relative mx-auto aspect-[3/4] max-w-lg w-full rounded-2xl border-4 border-emerald-900/60 bg-gradient-to-b from-emerald-800 via-emerald-700 to-emerald-800 p-4 shadow-2xl overflow-hidden select-none">
            {/* Pitch Markings */}
            <div className="absolute inset-4 border-2 border-white/40 rounded pointer-events-none" />
            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-28 w-28 rounded-full border-2 border-white/40 pointer-events-none" />
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/40 pointer-events-none" />
            {/* Top Penalty Box */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-48 h-20 border-2 border-white/40 border-t-0 pointer-events-none" />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-8 border-2 border-white/40 border-t-0 pointer-events-none" />
            {/* Bottom Penalty Box */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-20 border-2 border-white/40 border-b-0 pointer-events-none" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-8 border-2 border-white/40 border-b-0 pointer-events-none" />

            {/* Players on pitch */}
            {positions.map((pos) => {
              const assignedPlayerId = lineup[pos.id];
              const player = assignedPlayerId ? playersMap.get(assignedPlayerId) : null;
              const isSelected = activeSlot === pos.id;

              return (
                <div
                  key={pos.id}
                  onClick={() => setActiveSlot(pos.id)}
                  style={{
                    top: `${pos.top}%`,
                    left: `${pos.left}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  className={`absolute flex flex-col items-center cursor-pointer transition-all ${
                    isSelected ? "scale-125 z-30" : "hover:scale-110 z-20"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full border-2 font-black text-xs shadow-xl transition-all ${
                      player
                        ? "bg-zinc-950 text-white border-emerald-400 shadow-emerald-950/60"
                        : "bg-black/60 text-emerald-300 border-white/60 border-dashed"
                    } ${isSelected ? "ring-4 ring-emerald-400 ring-offset-2 ring-offset-zinc-900" : ""}`}
                  >
                    {player?.preferred_number ? (
                      `#${player.preferred_number}`
                    ) : (
                      <span className="text-[10px] font-bold">{pos.roleCode}</span>
                    )}
                  </div>
                  <div className="mt-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white max-w-[80px] truncate text-center backdrop-blur-sm border border-white/20">
                    {player ? player.full_name.split(" ")[0] : pos.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Player Assignment Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-xl backdrop-blur-md">
            <h3 className="font-bold text-sm text-white mb-1">
              {activeSlot
                ? `Asignar para: ${positions.find((p) => p.id === activeSlot)?.label} (${
                    positions.find((p) => p.id === activeSlot)?.roleCode
                  })`
                : "Haz clic en una posición en el campo"}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              {activeSlot
                ? "Selecciona el jugador que ocupará esta posición:"
                : "Toca cualquiera de los 11 círculos para asignarle un jugador."}
            </p>

            {activeSlot ? (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => handleAssignPlayer(activeSlot, "none")}
                  className="w-full rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 p-2 text-xs text-zinc-400 hover:text-white text-left cursor-pointer"
                >
                  ✕ Dejar posición vacía
                </button>
                {players.map((p) => {
                  const isAssigned = Object.values(lineup).includes(p.id);
                  const isAssignedToThis = lineup[activeSlot] === p.id;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleAssignPlayer(activeSlot, p.id)}
                      className={`w-full flex items-center justify-between rounded-lg p-2.5 text-xs text-left transition-colors cursor-pointer border ${
                        isAssignedToThis
                          ? "bg-emerald-600/30 border-emerald-500 text-white font-bold"
                          : isAssigned
                          ? "bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                          : "bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-zinc-700 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {p.preferred_number && (
                          <span className="font-mono text-zinc-400 text-[10px] font-bold">
                            #{p.preferred_number}
                          </span>
                        )}
                        <span className="truncate">{p.full_name}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 capitalize">
                        {p.preferred_position || ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg bg-zinc-900/40 border border-zinc-800 p-4 text-center text-xs text-zinc-500">
                Selecciona una posición en el campo para desplegar la nómina de jugadores.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
