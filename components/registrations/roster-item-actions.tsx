"use client";

import { useActionState } from "react";
import {
  updatePlayerRegistrationStatusAction,
  deletePlayerRegistrationAction,
  type UpdateRosterActionState,
} from "@/app/dashboard/leagues/[slug]/teams/[teamSlug]/roster/actions";
import { Button } from "@/components/ui/button";
import {
  PLAYER_REGISTRATION_STATUS_VALUES,
  type PlayerRegistrationStatus,
} from "@/types/database";

interface RosterItemActionsProps {
  leagueSlug: string;
  teamSlug: string;
  registrationId: string;
  currentStatus: PlayerRegistrationStatus;
  currentJerseyNumber: number | null;
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function RosterItemActions({
  leagueSlug,
  teamSlug,
  registrationId,
  currentStatus,
  currentJerseyNumber,
}: RosterItemActionsProps) {
  const boundUpdate = updatePlayerRegistrationStatusAction.bind(null, leagueSlug, teamSlug);
  const [updateState, formUpdateAction, isUpdating] = useActionState<UpdateRosterActionState, FormData>(
    boundUpdate,
    { success: false, message: null }
  );

  const boundDelete = deletePlayerRegistrationAction.bind(null, leagueSlug, teamSlug);
  const [deleteState, formDeleteAction, isDeleting] = useActionState<UpdateRosterActionState, FormData>(
    boundDelete,
    { success: false, message: null }
  );

  const isPending = isUpdating || isDeleting;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <form action={formUpdateAction} className="flex flex-wrap items-center gap-1.5">
          <input type="hidden" name="registrationId" value={registrationId} />
          <label htmlFor={`roster-status-${registrationId}`} className="sr-only">
            Estado del registro
          </label>
          <select
            id={`roster-status-${registrationId}`}
            name="status"
            defaultValue={currentStatus}
            disabled={isPending}
            className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          >
            {PLAYER_REGISTRATION_STATUS_VALUES.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>

          <label htmlFor={`roster-jersey-${registrationId}`} className="sr-only">
            Dorsal
          </label>
          <input
            id={`roster-jersey-${registrationId}`}
            type="number"
            name="jerseyNumber"
            min={0}
            max={99}
            defaultValue={currentJerseyNumber ?? ""}
            placeholder="#"
            disabled={isPending}
            className="w-14 rounded-md border border-gray-300 px-2 py-1 text-xs text-center focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          />

          <Button type="submit" size="sm" disabled={isPending}>
            {isUpdating ? "..." : "Actualizar"}
          </Button>
        </form>

        <form action={formDeleteAction}>
          <input type="hidden" name="registrationId" value={registrationId} />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={isPending}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={(e) => {
              if (!window.confirm("¿Seguro que deseas remover a este jugador de la plantilla?")) {
                e.preventDefault();
              }
            }}
          >
            {isDeleting ? "..." : "Baja"}
          </Button>
        </form>
      </div>

      {updateState.message ? (
        <p className={`text-xs ${updateState.success ? "text-emerald-600" : "text-red-600"}`}>
          {updateState.message}
        </p>
      ) : null}

      {deleteState.message ? (
        <p className={`text-xs ${deleteState.success ? "text-emerald-600" : "text-red-600"}`}>
          {deleteState.message}
        </p>
      ) : null}
    </div>
  );
}
