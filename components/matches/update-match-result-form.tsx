"use client";

import { useActionState } from "react";
import { updateMatchResultAction } from "@/app/dashboard/leagues/[slug]/matches/[matchId]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MATCH_STATUS_VALUES } from "@/types/database";
import type { MatchStatus } from "@/types/database";

type UpdateResultFormState = {
  values: {
    home_score: string;
    away_score: string;
    status: string;
  };
  fieldErrors: Partial<Record<"home_score" | "away_score" | "status", string>>;
  formError: string | null;
  success: boolean;
  standingsWarning: string | null;
};

function formatStatusLabel(status: MatchStatus) {
  const labels: Record<MatchStatus, string> = {
    scheduled: "Programado",
    in_progress: "En juego",
    completed: "Finalizado",
    postponed: "Pospuesto",
    cancelled: "Cancelado",
  };
  return labels[status];
}

interface UpdateMatchResultFormProps {
  leagueSlug: string;
  matchId: string;
  initialHomeScore: number;
  initialAwayScore: number;
  initialStatus: MatchStatus;
}

export function UpdateMatchResultForm({
  leagueSlug,
  matchId,
  initialHomeScore,
  initialAwayScore,
  initialStatus,
}: UpdateMatchResultFormProps) {
  const action = updateMatchResultAction.bind(null, leagueSlug, matchId);
  const [state, formAction, isPending] = useActionState<UpdateResultFormState, FormData>(
    action,
    {
      values: {
        home_score: String(initialHomeScore),
        away_score: String(initialAwayScore),
        status: initialStatus,
      },
      fieldErrors: {},
      formError: null,
      success: false,
      standingsWarning: null,
    }
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="home_score" className="text-sm font-medium text-gray-700">
            Equipo local
          </label>
          <Input
            id="home_score"
            name="home_score"
            type="number"
            min={0}
            max={99}
            required
            disabled={isPending}
            defaultValue={state.values.home_score}
          />
          {state.fieldErrors.home_score ? (
            <p className="text-sm text-red-600">{state.fieldErrors.home_score}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="away_score" className="text-sm font-medium text-gray-700">
            Equipo visitante
          </label>
          <Input
            id="away_score"
            name="away_score"
            type="number"
            min={0}
            max={99}
            required
            disabled={isPending}
            defaultValue={state.values.away_score}
          />
          {state.fieldErrors.away_score ? (
            <p className="text-sm text-red-600">{state.fieldErrors.away_score}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="status" className="text-sm font-medium text-gray-700">
          Estado
        </label>
        <select
          id="status"
          name="status"
          defaultValue={state.values.status}
          disabled={isPending}
          required
          className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
        >
          {MATCH_STATUS_VALUES.map((status) => (
            <option key={status} value={status}>
              {formatStatusLabel(status)}
            </option>
          ))}
        </select>
        {state.fieldErrors.status ? (
          <p className="text-sm text-red-600">{state.fieldErrors.status}</p>
        ) : null}
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

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar resultado"}
      </Button>
    </form>
  );
}
