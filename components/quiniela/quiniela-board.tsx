"use client";

import { useState, useEffect } from "react";
import { Trophy, CheckCircle2, Sparkles, Share2, AlertCircle } from "lucide-react";
import {
  calculatePredictionPoints,
  type PredictionEvaluation,
} from "@/lib/quiniela/quiniela-engine";
import {
  getStoredPredictions,
  saveStoredPrediction,
  type SavedPrediction,
} from "@/lib/quiniela/quiniela-storage";
import { buildWhatsAppShareUrl } from "@/lib/social/share-formatter";

export interface QuinielaMatchItem {
  id: string;
  roundName?: string | null;
  scheduledAt: string;
  status: string;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeam: { id: string; name: string; logoUrl?: string | null };
  awayTeam: { id: string; name: string; logoUrl?: string | null };
}

interface QuinielaBoardProps {
  leagueSlug: string;
  leagueName: string;
  matches: QuinielaMatchItem[];
}

export function QuinielaBoard({
  leagueSlug,
  leagueName,
  matches,
}: QuinielaBoardProps) {
  const [predictions, setPredictions] = useState<Record<string, SavedPrediction>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPredictions(getStoredPredictions(leagueSlug));
  }, [leagueSlug]);

  const handleScoreChange = (
    matchId: string,
    field: "home" | "away",
    valStr: string
  ) => {
    const val = parseInt(valStr, 10);
    const score = isNaN(val) ? 0 : Math.max(0, Math.min(val, 99));

    const current = predictions[matchId] || {
      matchId,
      homeScore: 0,
      awayScore: 0,
      updatedAt: new Date().toISOString(),
    };

    const newHome = field === "home" ? score : current.homeScore;
    const newAway = field === "away" ? score : current.awayScore;

    saveStoredPrediction(leagueSlug, matchId, newHome, newAway);
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        matchId,
        homeScore: newHome,
        awayScore: newAway,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  // Calculate user total points
  let totalUserPoints = 0;
  let exactHits = 0;
  let evaluatedCount = 0;

  for (const match of matches) {
    const pred = predictions[match.id];
    if (pred && match.status === "completed") {
      const evalResult = calculatePredictionPoints(
        { homeScore: pred.homeScore, awayScore: pred.awayScore },
        { status: match.status, homeScore: match.homeScore, awayScore: match.awayScore }
      );
      if (evalResult.points !== null) {
        totalUserPoints += evalResult.points;
        evaluatedCount += 1;
        if (evalResult.isExact) exactHits += 1;
      }
    }
  }

  const handleShareMyQuiniela = () => {
    const filledCount = Object.keys(predictions).length;
    const lines = [
      `⚽ *Mi Quiniela para ${leagueName}* 🎯`,
      `Puntos acumulados: *${totalUserPoints} pts* (${exactHits} plenos)`,
      "",
    ];

    for (const m of matches.slice(0, 5)) {
      const p = predictions[m.id];
      if (p) {
        lines.push(`• ${m.homeTeam.name} *${p.homeScore} - ${p.awayScore}* ${m.awayTeam.name}`);
      }
    }

    if (filledCount > 5) {
      lines.push(`... y ${filledCount - 5} partidos más.`);
    }

    lines.push(`\n👉 ¡Arma tus pronósticos gratis aquí:`);
    lines.push(typeof window !== "undefined" ? window.location.href : "");

    const url = buildWhatsAppShareUrl(lines.join("\n"));
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer legal SEGOB */}
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-300">
        <Sparkles className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-emerald-200">
            Quiniela Recreativa Comunitaria — 100% Gratuita
          </p>
          <p className="text-emerald-400/90 leading-relaxed">
            Participa por la gloria entre aficionados. No involucra apuestas en dinero ni azar mercantil conforme a la legislación de la SEGOB. Sistema de puntuación: 3 pts por acertar el marcador exacto, 1 pt por acertar el ganador/empate.
          </p>
        </div>
      </div>

      {/* Resumen del Aficionado */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-center">
          <span className="text-xs text-gray-400 font-medium">Tus Puntos</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{totalUserPoints} pts</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-center">
          <span className="text-xs text-gray-400 font-medium">Plenos Exactos (3 pts)</span>
          <p className="text-2xl font-black text-teal-300 mt-1">{exactHits}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-center">
          <span className="text-xs text-gray-400 font-medium">Pronósticos Hechos</span>
          <p className="text-2xl font-black text-white mt-1">
            {mounted ? Object.keys(predictions).length : 0} / {matches.length}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={handleShareMyQuiniela}
            className="w-full h-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 px-3 transition shadow"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Compartir</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Partidos */}
      <div className="space-y-3">
        {matches.map((match) => {
          const pred = predictions[match.id] || { homeScore: 0, awayScore: 0 };
          const isCompleted = match.status === "completed";
          let evalResult: PredictionEvaluation | null = null;

          if (isCompleted && pred) {
            evalResult = calculatePredictionPoints(
              { homeScore: pred.homeScore, awayScore: pred.awayScore },
              { status: match.status, homeScore: match.homeScore, awayScore: match.awayScore }
            );
          }

          return (
            <div
              key={match.id}
              className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 sm:p-5 backdrop-blur-md shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              {/* Info de jornada y fecha */}
              <div className="min-w-[140px] text-xs text-gray-400 space-y-0.5">
                <span className="font-semibold text-emerald-400 block">
                  {match.roundName ?? "Jornada"}
                </span>
                <span>
                  {new Date(match.scheduledAt).toLocaleDateString("es-MX", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {isCompleted && (
                  <span className="inline-block rounded-full bg-gray-800 px-2 py-0.5 text-[10px] text-gray-300 font-semibold mt-1">
                    Finalizado
                  </span>
                )}
              </div>

              {/* Controles de Pronóstico */}
              <div className="flex-1 flex items-center justify-center gap-3 sm:gap-6">
                {/* Local */}
                <div className="flex-1 flex items-center justify-end gap-2 text-right">
                  <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[120px] sm:max-w-[160px]">
                    {match.homeTeam.name}
                  </span>
                  {match.homeTeam.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={match.homeTeam.logoUrl}
                      alt={match.homeTeam.name}
                      className="h-6 w-6 rounded object-contain shrink-0"
                    />
                  ) : null}
                </div>

                {/* Marcador Pronóstico */}
                <div className="flex items-center gap-2 shrink-0 bg-white/5 border border-white/10 rounded-xl p-1.5">
                  <input
                    type="number"
                    min="0"
                    max="99"
                    disabled={isCompleted}
                    value={mounted ? pred.homeScore : 0}
                    onChange={(e) => handleScoreChange(match.id, "home", e.target.value)}
                    className="w-10 sm:w-12 h-9 text-center bg-slate-950/80 border border-white/20 rounded-lg text-sm font-bold text-white focus:border-emerald-400 focus:outline-none disabled:opacity-75"
                  />
                  <span className="text-xs text-gray-400 font-bold">:</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    disabled={isCompleted}
                    value={mounted ? pred.awayScore : 0}
                    onChange={(e) => handleScoreChange(match.id, "away", e.target.value)}
                    className="w-10 sm:w-12 h-9 text-center bg-slate-950/80 border border-white/20 rounded-lg text-sm font-bold text-white focus:border-emerald-400 focus:outline-none disabled:opacity-75"
                  />
                </div>

                {/* Visitante */}
                <div className="flex-1 flex items-center justify-start gap-2 text-left">
                  {match.awayTeam.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={match.awayTeam.logoUrl}
                      alt={match.awayTeam.name}
                      className="h-6 w-6 rounded object-contain shrink-0"
                    />
                  ) : null}
                  <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[120px] sm:max-w-[160px]">
                    {match.awayTeam.name}
                  </span>
                </div>
              </div>

              {/* Resultado real o Estado del pronóstico */}
              <div className="min-w-[130px] flex md:flex-col items-center md:items-end justify-between md:justify-center gap-1 text-right">
                {isCompleted ? (
                  <>
                    <div className="text-xs text-gray-400">
                      Oficial: <span className="font-bold text-white">{match.homeScore} - {match.awayScore}</span>
                    </div>
                    {evalResult?.isExact ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-400 ring-1 ring-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" /> +3 pts (Exacto)
                      </span>
                    ) : evalResult?.isOutcomeCorrect ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/20 px-2 py-0.5 text-[11px] font-bold text-teal-300 ring-1 ring-teal-500/30">
                        +1 pt (Acertó)
                      </span>
                    ) : (
                      <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-400">
                        0 pts
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-[11px] text-gray-400 italic">
                    Pronóstico guardado
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
