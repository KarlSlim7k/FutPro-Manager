"use client";

import { useActionState, useState } from "react";
import {
  updateMatchResultAction,
  type UpdateMatchResultActionState,
} from "@/app/dashboard/leagues/[slug]/matches/[matchId]/result/actions";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trophy } from "lucide-react";
import type { MatchStatus } from "@/types/database";

interface MatchResultFormProps {
  leagueSlug: string;
  matchId: string;
  matchStatus: MatchStatus;
  homeTeamName: string;
  awayTeamName: string;
  initialHomeScore: number;
  initialAwayScore: number;
  hasValidTeams: boolean;
}

export function MatchResultForm({
  leagueSlug,
  matchId,
  matchStatus,
  homeTeamName,
  awayTeamName,
  initialHomeScore,
  initialAwayScore,
  hasValidTeams,
}: MatchResultFormProps) {
  const action = updateMatchResultAction.bind(null, leagueSlug, matchId);
  const isCancelledMatch = matchStatus === "cancelled";
  const canSubmit = !isCancelledMatch && hasValidTeams;

  const [homeScore, setHomeScore] = useState<number>(initialHomeScore);
  const [awayScore, setAwayScore] = useState<number>(initialAwayScore);

  const initialState: UpdateMatchResultActionState = {
    values: {
      home_score: String(initialHomeScore),
      away_score: String(initialAwayScore),
    },
    fieldErrors: {},
    formError: null,
    success: false,
    standingsWarning: null,
  };

  const [state, formAction, isPending] = useActionState<UpdateMatchResultActionState, FormData>(
    action,
    initialState
  );

  const stepScore = (team: "home" | "away", delta: number) => {
    if (team === "home") {
      setHomeScore((prev) => Math.max(0, Math.min(99, prev + delta)));
    } else {
      setAwayScore((prev) => Math.max(0, Math.min(99, prev + delta)));
    }
  };

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs sm:text-sm text-emerald-800">
        Esta acción marcará el partido como completado y recalculará automáticamente la tabla de
        posiciones de la temporada.
      </div>

      {matchStatus === "completed" ? (
        <p className="rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs sm:text-sm text-blue-700">
          Este partido ya está finalizado. Puedes corregir el marcador de forma administrativa.
        </p>
      ) : null}

      {isCancelledMatch ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs sm:text-sm text-amber-700">
          No se puede capturar resultado de un partido cancelado.
        </p>
      ) : null}

      {!hasValidTeams ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs sm:text-sm text-amber-700">
          No se puede capturar resultado porque el partido no tiene ambos equipos válidos.
        </p>
      ) : null}

      {/* Modo Cancha: Stepper de Marcador de Alto Contraste */}
      <div className="rounded-2xl border-2 border-gray-900 bg-white p-4 sm:p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-900">
            <Trophy className="h-4 w-4 text-emerald-700" />
            Marcador Oficial
          </span>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Modo Cancha Activo
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
          {/* Equipo Local */}
          <div className="flex flex-col items-center rounded-xl bg-gray-50 border border-gray-200 p-4">
            <label htmlFor="match-result-home-score" className="text-center font-bold text-gray-900 text-sm sm:text-base break-words">
              {homeTeamName} (Local)
            </label>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => stepScore("home", -1)}
                disabled={isPending || !canSubmit || homeScore <= 0}
                aria-label={`Restar gol a ${homeTeamName}`}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border-2 border-gray-300 text-gray-900 text-xl font-black shadow-sm transition hover:border-gray-900 active:scale-95 active:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none touch-manipulation"
              >
                <Minus className="h-5 w-5" />
              </button>

              <div className="flex h-16 w-20 items-center justify-center rounded-xl bg-white border-2 border-gray-900 text-3xl sm:text-4xl font-black text-gray-900 shadow-inner">
                {homeScore}
              </div>

              <button
                type="button"
                onClick={() => stepScore("home", 1)}
                disabled={isPending || !canSubmit || homeScore >= 99}
                aria-label={`Sumar gol a ${homeTeamName}`}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 border-2 border-emerald-700 text-white text-xl font-black shadow-sm transition hover:bg-emerald-700 active:scale-95 active:bg-emerald-800 disabled:opacity-40 disabled:pointer-events-none touch-manipulation"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {/* Input oculto / sincronizado para envío del formulario */}
            <input
              id="match-result-home-score"
              name="home_score"
              type="number"
              min={0}
              max={99}
              value={homeScore}
              onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
              className="sr-only"
            />
            {state.fieldErrors.home_score ? (
              <p className="mt-2 text-xs text-red-600">{state.fieldErrors.home_score}</p>
            ) : null}
          </div>

          {/* Equipo Visitante */}
          <div className="flex flex-col items-center rounded-xl bg-gray-50 border border-gray-200 p-4">
            <label htmlFor="match-result-away-score" className="text-center font-bold text-gray-900 text-sm sm:text-base break-words">
              {awayTeamName} (Visitante)
            </label>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => stepScore("away", -1)}
                disabled={isPending || !canSubmit || awayScore <= 0}
                aria-label={`Restar gol a ${awayTeamName}`}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border-2 border-gray-300 text-gray-900 text-xl font-black shadow-sm transition hover:border-gray-900 active:scale-95 active:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none touch-manipulation"
              >
                <Minus className="h-5 w-5" />
              </button>

              <div className="flex h-16 w-20 items-center justify-center rounded-xl bg-white border-2 border-gray-900 text-3xl sm:text-4xl font-black text-gray-900 shadow-inner">
                {awayScore}
              </div>

              <button
                type="button"
                onClick={() => stepScore("away", 1)}
                disabled={isPending || !canSubmit || awayScore >= 99}
                aria-label={`Sumar gol a ${awayTeamName}`}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 border-2 border-emerald-700 text-white text-xl font-black shadow-sm transition hover:bg-emerald-700 active:scale-95 active:bg-emerald-800 disabled:opacity-40 disabled:pointer-events-none touch-manipulation"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {/* Input oculto / sincronizado para envío del formulario */}
            <input
              id="match-result-away-score"
              name="away_score"
              type="number"
              min={0}
              max={99}
              value={awayScore}
              onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
              className="sr-only"
            />
            {state.fieldErrors.away_score ? (
              <p className="mt-2 text-xs text-red-600">{state.fieldErrors.away_score}</p>
            ) : null}
          </div>
        </div>
      </div>

      {state.formError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.formError}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Resultado guardado correctamente.
        </p>
      ) : null}

      {state.success && state.standingsWarning ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {state.standingsWarning}
        </p>
      ) : null}

      {/* Barra de Acción Sticky con Safe-Area en móvil */}
      <div className="sticky bottom-0 z-20 -mx-4 -mb-4 border-t border-gray-200 bg-white/95 p-4 backdrop-blur-md safe-area-pb sm:static sm:mx-0 sm:mb-0 sm:border-0 sm:bg-transparent sm:p-0">
        <Button
          type="submit"
          disabled={isPending || !canSubmit}
          className="w-full sm:w-auto h-12 text-base font-bold shadow-lg touch-manipulation"
        >
          {isPending ? "Guardando resultado..." : "Guardar resultado final"}
        </Button>
      </div>
    </form>
  );
}
