"use client";

import Image from "next/image";
import { Shield, CheckCircle2, AlertOctagon, Printer, Share2 } from "lucide-react";

interface PlayerCredentialCardProps {
  leagueName: string;
  seasonName: string;
  playerName: string;
  playerPhotoUrl?: string | null;
  teamName: string;
  teamLogoUrl?: string | null;
  jerseyNumber?: number | null;
  position?: string | null;
  dominantFoot?: string | null;
  status: "active" | "suspended" | "inactive" | "released" | "transferred";
  qrSvg: string;
  folioNumber: string;
}

export function PlayerCredentialCard({
  leagueName,
  seasonName,
  playerName,
  playerPhotoUrl,
  teamName,
  teamLogoUrl,
  jerseyNumber,
  position,
  dominantFoot,
  status,
  qrSvg,
  folioNumber,
}: PlayerCredentialCardProps) {
  const isSuspended = status === "suspended";
  const isActive = status === "active";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Printable Credential Card */}
      <div className="relative w-full max-w-sm rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900 p-5 shadow-2xl text-zinc-100 overflow-hidden print:border-black print:text-black print:shadow-none">
        {/* Top Header Background Banner */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 opacity-90" />

        {/* Header Branding */}
        <div className="relative z-10 flex items-center justify-between pb-3 text-white">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-300 drop-shadow" />
            <div>
              <h3 className="font-extrabold text-sm tracking-wide uppercase">{leagueName}</h3>
              <p className="text-[10px] text-emerald-100 font-medium tracking-tight">
                {seasonName} · Credencial Oficial
              </p>
            </div>
          </div>
          {jerseyNumber && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/50 border border-white/20 font-black text-xl text-emerald-300 shadow">
              {jerseyNumber}
            </div>
          )}
        </div>

        {/* Main Body */}
        <div className="relative z-10 mt-3 flex gap-4 items-start">
          {/* Player Photo */}
          <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 border-zinc-700 bg-zinc-800 shadow-md">
            {playerPhotoUrl ? (
              <Image
                src={playerPhotoUrl}
                alt={playerName}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-600 text-xs font-bold">
                Sin foto
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-1.5 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                Futbolista
              </span>
              <p className="font-extrabold text-base text-white leading-tight truncate">
                {playerName}
              </p>
            </div>

            <div className="flex items-center gap-1.5 pt-0.5">
              {teamLogoUrl && (
                <div className="relative h-5 w-5 flex-shrink-0 overflow-hidden rounded-full">
                  <Image src={teamLogoUrl} alt={teamName} fill className="object-cover" unoptimized />
                </div>
              )}
              <p className="font-semibold text-emerald-400 truncate">{teamName}</p>
            </div>

            <div className="grid grid-cols-2 gap-1 text-[11px] pt-1">
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase">Posición</span>
                <span className="font-medium text-zinc-200 capitalize">
                  {position || "No especificada"}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase">Perfil</span>
                <span className="font-medium text-zinc-200 capitalize">
                  {dominantFoot || "No definido"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: QR Code and Status Badge */}
        <div className="relative z-10 mt-4 flex items-center justify-between rounded-xl bg-zinc-900/90 border border-zinc-800 p-3">
          {/* Status Badge */}
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">
              Estatus Disciplinario
            </span>
            {isActive ? (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>HABILITADO</span>
              </div>
            ) : isSuspended ? (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400 border border-red-500/30">
                <AlertOctagon className="h-3.5 w-3.5" />
                <span>SUSPENDIDO</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-500/10 px-2.5 py-1 text-xs font-bold text-zinc-400 border border-zinc-500/30 capitalize">
                <span>{status}</span>
              </div>
            )}
            <p className="text-[10px] font-mono text-zinc-500 pt-0.5">Folio: {folioNumber}</p>
          </div>

          {/* QR Code SVG container */}
          <div
            className="h-16 w-16 flex-shrink-0 bg-white p-1 rounded-lg shadow"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
        </div>

        {/* Watermark Footer */}
        <div className="mt-3 text-center text-[9px] text-zinc-500 font-mono tracking-widest">
          SISTEMA OFICIAL DE VALIDACIÓN FUTPRO MANAGER
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white cursor-pointer"
        >
          <Printer className="h-4 w-4 text-zinc-400" />
          Imprimir Credencial
        </button>
      </div>
    </div>
  );
}
