"use client";

import { useState } from "react";
import { QrCode, Search, CheckCircle2, AlertOctagon, X, ExternalLink, Loader2 } from "lucide-react";

export function PlayerQrScanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    if (!query.trim()) return;
    // Extract ID if a full URL was scanned/pasted
    let cleanId = query.trim();
    if (cleanId.includes("/credencial/")) {
      cleanId = cleanId.split("/credencial/")[1].split("?")[0].split("/")[0];
    }
    // Navigate directly in a clean new tab or current window
    window.open(`/credencial/${cleanId}`, "_blank");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 shadow transition-colors hover:bg-emerald-900/50 hover:text-white cursor-pointer"
      >
        <QrCode className="h-4 w-4" />
        <span>Validar Credencial QR</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <QrCode className="h-5 w-5 text-emerald-400" />
                Validador de Jugador Anti-Cachirul
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Escanea con tu lector de cámara o pega la URL / folio de la credencial digital para verificar de inmediato si el jugador está inscrito y habilitado para disputar el encuentro.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                Folio o enlace escaneado:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Pega el enlace o UUID de registro..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleVerify();
                  }}
                  className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  disabled={!query.trim() || isVerifying}
                  onClick={handleVerify}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow transition-colors hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
                >
                  <Search className="h-4 w-4" />
                  Verificar
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-3 text-[11px] text-zinc-400 space-y-1">
              <p className="font-medium text-zinc-300">💡 Tip de cancha:</p>
              <p>
                Los capitanes o delegados pueden mostrar el código QR en la pantalla de su celular desde su panel de equipo. Al escanearlo con la cámara nativa de tu teléfono, te abrirá directamente la ficha con fotografía y el estatus disciplinario oficial.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
