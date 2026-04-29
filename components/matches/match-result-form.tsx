"use client";

import { useActionState } from "react";
import {
  updateMatchResultAction,
  type UpdateMatchResultActionState,
} from "@/app/dashboard/leagues/[slug]/matches/[matchId]/result/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const initialState: UpdateMatchResultActionState = {
    values: {
      home_score: String(initialHomeScore),
      away_score: String(initialAwayScore),
    },
    fieldErrors: {},
    formError: null,
  };

  const [state, formAction, isPending] = useActionState<UpdateMatchResultActionState, FormData>(
    action,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
        Esta acción marcará el partido como completado. Los eventos y tabla de posiciones se
        implementarán en una fase posterior.
      </div>

      {matchStatus === "completed" ? (
        <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          Este partido ya está finalizado. Puedes corregir el marcador de forma administrativa.
        </p>
      ) : null}

      {isCancelledMatch ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          No se puede capturar resultado de un partido cancelado.
        </p>
      ) : null}

      {!hasValidTeams ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          No se puede capturar resultado porque el partido no tiene ambos equipos válidos.
        </p>
      ) : null}

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Marcador final</p>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <div className="space-y-2">
            <label htmlFor="match-result-home-score" className="text-sm font-medium text-gray-700">
              {homeTeamName}
            </label>
            <Input
              id="match-result-home-score"
              name="home_score"
              type="number"
              min={0}
              max={99}
              step={1}
              inputMode="numeric"
              required
              disabled={isPending || !canSubmit}
              defaultValue={state.values.home_score}
            />
            {state.fieldErrors.home_score ? (
              <p className="text-sm text-red-600">{state.fieldErrors.home_score}</p>
            ) : null}
          </div>

          <p className="hidden pb-3 text-center text-lg font-semibold text-gray-700 sm:block">-</p>

          <div className="space-y-2">
            <label htmlFor="match-result-away-score" className="text-sm font-medium text-gray-700">
              {awayTeamName}
            </label>
            <Input
              id="match-result-away-score"
              name="away_score"
              type="number"
              min={0}
              max={99}
              step={1}
              inputMode="numeric"
              required
              disabled={isPending || !canSubmit}
              defaultValue={state.values.away_score}
            />
            {state.fieldErrors.away_score ? (
              <p className="text-sm text-red-600">{state.fieldErrors.away_score}</p>
            ) : null}
          </div>
        </div>
      </div>

      {state.formError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.formError}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending || !canSubmit}>
        {isPending ? "Guardando resultado..." : "Guardar resultado"}
      </Button>
    </form>
  );
}
