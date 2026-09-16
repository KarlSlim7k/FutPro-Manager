"use client";

import { useActionState } from "react";
import { updateMatchRefereeAction } from "@/app/dashboard/leagues/[slug]/matches/[matchId]/referee/actions";
import { Button } from "@/components/ui/button";

export interface CurrentRefereeAssignments {
  headRefereeId?: string | null;
  firstAssistantId?: string | null;
  secondAssistantId?: string | null;
  fourthOfficialId?: string | null;
}

export interface AvailableRefereeItem {
  id: string;
  name: string;
  isUnavailable?: boolean;
  availabilityNote?: string | null;
}

interface RefereeAssignmentFormProps {
  leagueSlug: string;
  matchId: string;
  currentAssignments?: CurrentRefereeAssignments;
  currentRefereeId?: string | null;
  availableReferees: AvailableRefereeItem[];
}

export function RefereeAssignmentForm({
  leagueSlug,
  matchId,
  currentAssignments,
  currentRefereeId,
  availableReferees,
}: RefereeAssignmentFormProps) {
  const boundAction = updateMatchRefereeAction.bind(null, leagueSlug, matchId);
  const [state, formAction, isPending] = useActionState(boundAction, {
    success: false,
    message: null,
  });

  const headId = currentAssignments?.headRefereeId ?? currentRefereeId ?? "";
  const firstId = currentAssignments?.firstAssistantId ?? "";
  const secondId = currentAssignments?.secondAssistantId ?? "";
  const fourthId = currentAssignments?.fourthOfficialId ?? "";

  return (
    <form action={formAction} className="space-y-4 pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="headRefereeId" className="block text-xs font-semibold text-gray-700 mb-1">
            Árbitro central
          </label>
          <select
            id="headRefereeId"
            name="headRefereeId"
            defaultValue={headId}
            disabled={isPending}
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">Sin asignar (quitar central)</option>
            {availableReferees.map((referee) => (
              <option key={referee.id} value={referee.id}>
                {referee.name}
                {referee.isUnavailable
                  ? ` (No disponible${referee.availabilityNote ? `: ${referee.availabilityNote}` : ""})`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="firstAssistantId" className="block text-xs font-semibold text-gray-700 mb-1">
            Primer asistente (Línea 1)
          </label>
          <select
            id="firstAssistantId"
            name="firstAssistantId"
            defaultValue={firstId}
            disabled={isPending}
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">Sin asignar</option>
            {availableReferees.map((referee) => (
              <option key={referee.id} value={referee.id}>
                {referee.name}
                {referee.isUnavailable
                  ? ` (No disponible${referee.availabilityNote ? `: ${referee.availabilityNote}` : ""})`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="secondAssistantId" className="block text-xs font-semibold text-gray-700 mb-1">
            Segundo asistente (Línea 2)
          </label>
          <select
            id="secondAssistantId"
            name="secondAssistantId"
            defaultValue={secondId}
            disabled={isPending}
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">Sin asignar</option>
            {availableReferees.map((referee) => (
              <option key={referee.id} value={referee.id}>
                {referee.name}
                {referee.isUnavailable
                  ? ` (No disponible${referee.availabilityNote ? `: ${referee.availabilityNote}` : ""})`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="fourthOfficialId" className="block text-xs font-semibold text-gray-700 mb-1">
            Cuarto oficial
          </label>
          <select
            id="fourthOfficialId"
            name="fourthOfficialId"
            defaultValue={fourthId}
            disabled={isPending}
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">Sin asignar</option>
            {availableReferees.map((referee) => (
              <option key={referee.id} value={referee.id}>
                {referee.name}
                {referee.isUnavailable
                  ? ` (No disponible${referee.availabilityNote ? `: ${referee.availabilityNote}` : ""})`
                  : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar cuerpo arbitral"}
        </Button>
        {state.message ? (
          <p className={`text-xs ${state.success ? "text-emerald-600" : "text-red-600"}`}>
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
