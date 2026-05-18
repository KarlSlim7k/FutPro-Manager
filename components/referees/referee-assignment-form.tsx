"use client";

import { useActionState } from "react";
import { updateMatchRefereeAction } from "@/app/dashboard/leagues/[slug]/matches/[matchId]/referee/actions";

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
      <select
        name="refereeId"
        defaultValue={currentRefereeId ?? ""}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      >
        <option value="">Sin arbitro (quitar asignacion)</option>
        {availableReferees.map((referee) => (
          <option key={referee.id} value={referee.id}>
            {referee.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-emerald-600 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {isPending ? "..." : "Asignar"}
      </button>
      {state.message && (
        <p
          className={`text-xs ${state.success ? "text-emerald-600" : "text-red-600"}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
