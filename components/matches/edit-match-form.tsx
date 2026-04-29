"use client";

import { useActionState } from "react";
import {
  updateMatchAction,
  type UpdateMatchActionState,
} from "@/app/dashboard/leagues/[slug]/matches/[matchId]/edit/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MatchStatus } from "@/types/database";

type VenueOption = { id: string; name: string };

type MatchEditableValues = {
  scheduled_at: string;
  venue_id: string | null;
  round_name: string | null;
  status: MatchStatus;
};

const EDITABLE_MATCH_STATUS_VALUES = ["scheduled", "postponed", "cancelled"] as const;
type EditableMatchStatus = (typeof EDITABLE_MATCH_STATUS_VALUES)[number];

const EDITABLE_MATCH_STATUS_LABELS: Record<EditableMatchStatus, string> = {
  scheduled: "Programado",
  postponed: "Pospuesto",
  cancelled: "Cancelado",
};

function toDateTimeLocalValue(isoValue: string) {
  const date = new Date(isoValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

interface EditMatchFormProps {
  leagueSlug: string;
  matchId: string;
  currentMatch: MatchEditableValues;
  venues: VenueOption[];
}

export function EditMatchForm({ leagueSlug, matchId, currentMatch, venues }: EditMatchFormProps) {
  const action = updateMatchAction.bind(null, leagueSlug, matchId);
  const isEditableMatch = EDITABLE_MATCH_STATUS_VALUES.includes(currentMatch.status as EditableMatchStatus);
  const initialStatus = EDITABLE_MATCH_STATUS_VALUES.includes(currentMatch.status as EditableMatchStatus)
    ? (currentMatch.status as EditableMatchStatus)
    : "scheduled";

  const initialState: UpdateMatchActionState = {
    values: {
      scheduled_at: toDateTimeLocalValue(currentMatch.scheduled_at),
      venue_id: currentMatch.venue_id ?? "",
      round_name: currentMatch.round_name ?? "",
      status: initialStatus,
    },
    fieldErrors: {},
    formError: null,
  };

  const [state, formAction, isPending] = useActionState<UpdateMatchActionState, FormData>(
    action,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="edit-match-scheduled-at" className="text-sm font-medium text-gray-700">
          Fecha y hora programada
        </label>
        <Input
          id="edit-match-scheduled-at"
          name="scheduled_at"
          type="datetime-local"
          required
          disabled={isPending || !isEditableMatch}
          defaultValue={state.values.scheduled_at}
        />
        {state.fieldErrors.scheduled_at ? (
          <p className="text-sm text-red-600">{state.fieldErrors.scheduled_at}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="edit-match-venue" className="text-sm font-medium text-gray-700">
          Sede / Cancha (opcional)
        </label>
        <select
          id="edit-match-venue"
          name="venue_id"
          defaultValue={state.values.venue_id}
          disabled={isPending || !isEditableMatch}
          className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
        >
          <option value="">Sin sede asignada</option>
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>
        {state.fieldErrors.venue_id ? (
          <p className="text-sm text-red-600">{state.fieldErrors.venue_id}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="edit-match-round-name" className="text-sm font-medium text-gray-700">
          Jornada / Ronda (opcional)
        </label>
        <Input
          id="edit-match-round-name"
          name="round_name"
          maxLength={80}
          disabled={isPending || !isEditableMatch}
          placeholder="Jornada 1"
          defaultValue={state.values.round_name}
        />
        {state.fieldErrors.round_name ? (
          <p className="text-sm text-red-600">{state.fieldErrors.round_name}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="edit-match-status" className="text-sm font-medium text-gray-700">
          Estado
        </label>
        <select
          id="edit-match-status"
          name="status"
          defaultValue={state.values.status}
          disabled={isPending || !isEditableMatch}
          required
          className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
        >
          {EDITABLE_MATCH_STATUS_VALUES.map((status) => (
            <option key={status} value={status}>
              {EDITABLE_MATCH_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        {state.fieldErrors.status ? <p className="text-sm text-red-600">{state.fieldErrors.status}</p> : null}
      </div>

      {state.formError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.formError}
        </p>
      ) : null}

      {!isEditableMatch ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Este partido está en juego o finalizado y no puede editarse desde este módulo.
        </p>
      ) : null}

      <Button type="submit" disabled={isPending || !isEditableMatch}>
        {isPending ? "Guardando cambios..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
