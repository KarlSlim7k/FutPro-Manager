"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Radio } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MatchStatusBadge } from "@/components/matches/match-status-badge";
import type { Match, MatchStatus } from "@/types/database";

interface PublicLiveMatchHeaderProps {
  initialMatch: Pick<Match, "id" | "status" | "home_score" | "away_score" | "home_team_id" | "away_team_id" | "scheduled_at" | "round_name">;
  homeTeam: { id: string; name: string; slug: string; logo_url: string | null };
  awayTeam: { id: string; name: string; slug: string; logo_url: string | null };
}

export function PublicLiveMatchHeader({
  initialMatch,
  homeTeam,
  awayTeam,
}: PublicLiveMatchHeaderProps) {
  const [matchStatus, setMatchStatus] = useState<MatchStatus>(initialMatch.status);
  const [homeScore, setHomeScore] = useState<number>(initialMatch.home_score);
  const [awayScore, setAwayScore] = useState<number>(initialMatch.away_score);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [hasScoreFlash, setHasScoreFlash] = useState<boolean>(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`live_match_${initialMatch.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matches",
          filter: `id=eq.${initialMatch.id}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const updated = payload.new as Partial<Match>;
          if (updated.status && updated.status !== matchStatus) {
            setMatchStatus(updated.status);
          }
          if (updated.home_score !== undefined && updated.home_score !== homeScore) {
            setHomeScore(updated.home_score);
            setHasScoreFlash(true);
            setTimeout(() => setHasScoreFlash(false), 2500);
          }
          if (updated.away_score !== undefined && updated.away_score !== awayScore) {
            setAwayScore(updated.away_score);
            setHasScoreFlash(true);
            setTimeout(() => setHasScoreFlash(false), 2500);
          }
        }
      )
      .subscribe((status: string) => {
        setIsLiveConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialMatch.id, matchStatus, homeScore, awayScore]);

  const isLive = matchStatus === "in_progress";

  return (
    <div className="rounded-2xl bg-gradient-to-b from-gray-900 via-gray-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden border border-gray-800">
      {/* Indicador de conexión en tiempo real */}
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-gray-800/80">
        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-400 ring-1 ring-emerald-500/40 animate-pulse">
              <Radio className="h-3 w-3" />
              EN VIVO
            </span>
          ) : (
            <MatchStatusBadge status={matchStatus} />
          )}
          {initialMatch.round_name && (
            <span className="text-xs text-gray-400">• {initialMatch.round_name}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <span
            className={`h-2 w-2 rounded-full ${
              isLiveConnected ? "bg-emerald-400" : "bg-amber-400 animate-ping"
            }`}
          />
          <span className="hidden sm:inline">
            {isLiveConnected ? "Actualización en tiempo real activa" : "Conectando..."}
          </span>
        </div>
      </div>

      {/* Tablero central de Marcador */}
      <div className="py-6 flex items-center justify-between gap-4">
        {/* Equipo Local */}
        <div className="flex-1 flex flex-col items-center text-center">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full bg-gray-800 border-2 border-gray-700 shadow-md mb-2">
            {homeTeam.logo_url ? (
              <Image src={homeTeam.logo_url} alt={homeTeam.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-bold text-gray-400">
                {homeTeam.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h2 className="text-sm sm:text-base font-bold text-gray-100 max-w-[140px] truncate">
            {homeTeam.name}
          </h2>
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">Local</span>
        </div>

        {/* Marcador En Vivo */}
        <div className={`flex flex-col items-center px-4 transition-transform duration-300 ${
          hasScoreFlash ? "scale-110" : "scale-100"
        }`}>
          <div className="flex items-center gap-3 sm:gap-4 font-black text-4xl sm:text-6xl tracking-tight">
            <span className={hasScoreFlash ? "text-emerald-400" : "text-white"}>
              {homeScore}
            </span>
            <span className="text-gray-500 text-3xl sm:text-5xl font-light">-</span>
            <span className={hasScoreFlash ? "text-emerald-400" : "text-white"}>
              {awayScore}
            </span>
          </div>
          {isLive && (
            <span className="mt-2 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
              Minuto a minuto activo
            </span>
          )}
        </div>

        {/* Equipo Visitante */}
        <div className="flex-1 flex flex-col items-center text-center">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full bg-gray-800 border-2 border-gray-700 shadow-md mb-2">
            {awayTeam.logo_url ? (
              <Image src={awayTeam.logo_url} alt={awayTeam.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-bold text-gray-400">
                {awayTeam.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h2 className="text-sm sm:text-base font-bold text-gray-100 max-w-[140px] truncate">
            {awayTeam.name}
          </h2>
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">Visitante</span>
        </div>
      </div>
    </div>
  );
}
