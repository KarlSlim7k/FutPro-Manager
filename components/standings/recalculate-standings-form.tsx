"use client";

import { useActionState } from "react";
import { recalculateStandingsAction } from "@/app/dashboard/leagues/[slug]/seasons/[seasonSlug]/standings/actions";
import { Button } from "@/components/ui/button";

type RecalculateFormState = {
  formError: string | null;
  success: boolean;
  message: string | null;
  teamsCount: number;
  matchesCount: number;
};

interface RecalculateStandingsFormProps {
  leagueSlug: string;
  seasonSlug: string;
}

export function RecalculateStandingsForm({
  leagueSlug,
  seasonSlug,
}: RecalculateStandingsFormProps) {
  const action = recalculateStandingsAction.bind(null, leagueSlug, seasonSlug);
  const [state, formAction, isPending] = useActionState<RecalculateFormState, FormData>(
    action,
    {
      formError: null,
      success: false,
      message: null,
      teamsCount: 0,
      matchesCount: 0,
    }
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          La tabla se calcula usando partidos con estado <span className="font-medium text-gray-900">completed</span>.
        </p>
        <Button type="submit" disabled={isPending} variant="primary" size="sm">
          {isPending ? "Recalculando..." : "Recalcular tabla"}
        </Button>
      </div>

      {state.formError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.formError}
        </p>
      ) : null}

      {state.success && state.message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}