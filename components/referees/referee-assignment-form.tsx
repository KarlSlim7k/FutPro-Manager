"use client";

import { useActionState } from "react";
import { updateMatchRefereeAction } from "@/app/dashboard/leagues/[slug]/matches/[matchId]/referee/actions";
import { Button } from "@/components/ui/button";

interface RefereeAssignmentFormProps {
  leagueSlug: string;
  matchId: string;
  currentRefereeId: string | null;
  availableReferees: { id: string; name: string }[];
}

export function RefereeAssignmentForm({
  leagueSlug,
  matchId,
  currentRefereeId,
  availableReferees,
}: RefereeAssignmentFormProps) {
  const boundAction = updateMatchRefereeAction.bind(null, leagueSlug, matchId);
  const [state, formAction, isPending] = useActionState(boundAction, {
    success: false,
    message: null,
  });

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <label htmlFor="referee-select" className="sr-only">
        Árbitro
      </label>
      <select
        id="referee-select"
        name="refereeId"
        defaultValue={currentRefereeId ?? ""}
        disabled={isPending}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
      >
        <option value="">Sin árbitro (quitar asignación)</option>
        {availableReferees.map((referee) => (
          <option key={referee.id} value={referee.id}>
            {referee.name}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Guardando..." : "Asignar"}
      </Button>
      {state.message ? (
        <p className={`text-xs ${state.success ? "text-emerald-600" : "text-red-600"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
