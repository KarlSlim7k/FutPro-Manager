"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, Trophy } from "lucide-react";

interface RosterItem {
  id: string;
  player_id: string;
  jersey_number: number | null;
  player?: {
    full_name: string;
  };
}

interface MobileCedulaTabsProps {
  homeTeamName: string;
  awayTeamName: string;
  homeRoster: RosterItem[];
  awayRoster: RosterItem[];
  playerGoals: Record<string, number>;
  playerYellows: Record<string, number>;
  playerReds: Record<string, number>;
  leagueSlug: string;
  matchId: string;
}

export function MobileCedulaTabs({
  homeTeamName,
  awayTeamName,
  homeRoster,
  awayRoster,
  playerGoals,
  playerYellows,
  playerReds,
  leagueSlug,
  matchId,
}: MobileCedulaTabsProps) {
  const [activeTab, setActiveTab] = useState<"home" | "away">("home");

  const currentRoster = activeTab === "home" ? homeRoster : awayRoster;
  const currentTeam = activeTab === "home" ? homeTeamName : awayTeamName;

  return (
    <div className="space-y-4 md:hidden print:hidden">
      {/* Selector de equipo para Modo Cancha móvil */}
      <div className="flex rounded-xl bg-gray-900 p-1 text-white">
        <button
          type="button"
          onClick={() => setActiveTab("home")}
          className={`flex-1 min-h-[44px] rounded-lg py-2 text-xs sm:text-sm font-bold transition touch-manipulation active:scale-95 ${
            activeTab === "home"
              ? "bg-emerald-600 text-white shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {homeTeamName} ({homeRoster.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("away")}
          className={`flex-1 min-h-[44px] rounded-lg py-2 text-xs sm:text-sm font-bold transition touch-manipulation active:scale-95 ${
            activeTab === "away"
              ? "bg-emerald-600 text-white shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {awayTeamName} ({awayRoster.length})
        </button>
      </div>

      {/* Lista de Jugadores - Modo Cancha Alta Legibilidad */}
      <div className="rounded-xl border-2 border-gray-900 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-900">
            Plantilla: {currentTeam}
          </span>
          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            {currentRoster.length} Jugadores
          </span>
        </div>

        <div className="divide-y divide-gray-100 space-y-1">
          {currentRoster.map((item) => {
            const goals = playerGoals[item.player_id] ?? 0;
            const yellows = playerYellows[item.player_id] ?? 0;
            const reds = playerReds[item.player_id] ?? 0;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 px-1 text-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 border border-gray-300 font-mono text-xs font-black text-gray-900">
                    {item.jersey_number ?? "-"}
                  </span>
                  <p className="truncate font-semibold text-gray-900 text-sm">
                    {item.player?.full_name ?? "Sin nombre"}
                  </p>
                </div>

                {/* Badges de incidencias */}
                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  {goals > 0 && (
                    <span className="inline-flex items-center gap-0.5 rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-bold text-emerald-800">
                      ⚽ {goals}
                    </span>
                  )}
                  {yellows > 0 && (
                    <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-bold text-amber-800">
                      🟨 {yellows}
                    </span>
                  )}
                  {reds > 0 && (
                    <span className="inline-flex items-center gap-0.5 rounded bg-rose-100 px-1.5 py-0.5 text-xs font-bold text-rose-800">
                      🟥 {reds}
                    </span>
                  )}
                  {goals === 0 && yellows === 0 && reds === 0 && (
                    <span className="text-xs text-gray-300">-</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Action Bar en Cancha para Árbitros */}
      <div className="sticky bottom-0 z-20 -mx-4 -mb-4 flex gap-2 border-t border-gray-200 bg-white/95 p-3 backdrop-blur-md safe-area-pb">
        <Link
          href={`/dashboard/leagues/${leagueSlug}/matches/${matchId}/events`}
          className="flex flex-1 min-h-[48px] items-center justify-center gap-1.5 rounded-xl bg-gray-900 px-3 py-2.5 text-xs font-bold text-white shadow-md active:bg-gray-800 touch-manipulation"
        >
          <Activity className="h-4 w-4 text-emerald-400" />
          <span>Registrar Eventos</span>
        </Link>
        <Link
          href={`/dashboard/leagues/${leagueSlug}/matches/${matchId}/result`}
          className="flex flex-1 min-h-[48px] items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white shadow-md active:bg-emerald-800 touch-manipulation"
        >
          <Trophy className="h-4 w-4 text-white" />
          <span>Capturar Marcador</span>
        </Link>
      </div>
    </div>
  );
}
