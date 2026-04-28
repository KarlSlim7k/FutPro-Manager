"use client";

import { useActionState } from "react";
import {
  updatePlayerAction,
  type UpdatePlayerActionState,
} from "@/app/dashboard/leagues/[slug]/players/[playerId]/edit/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DOMINANT_FOOT_VALUES,
  PLAYER_STATUS_VALUES,
  type Player,
} from "@/types/database";

type EditablePlayer = Pick<
  Player,
  "id" | "full_name" | "birth_date" | "photo_url" | "preferred_position" | "dominant_foot" | "status"
>;

interface EditPlayerFormProps {
  leagueSlug: string;
  playerId: string;
  currentPlayer: EditablePlayer;
}

const DOMINANT_FOOT_LABELS: Record<(typeof DOMINANT_FOOT_VALUES)[number], string> = {
  left: "Izquierdo",
  right: "Derecho",
  both: "Ambos",
};

function formatStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function EditPlayerForm({ leagueSlug, playerId, currentPlayer }: EditPlayerFormProps) {
  const action = updatePlayerAction.bind(null, leagueSlug, playerId);
  const initialState: UpdatePlayerActionState = {
    values: {
      full_name: currentPlayer.full_name,
      birth_date: currentPlayer.birth_date ?? "",
      photo_url: currentPlayer.photo_url ?? "",
      preferred_position: currentPlayer.preferred_position ?? "",
      dominant_foot: currentPlayer.dominant_foot ?? "",
      status: currentPlayer.status,
    },
    fieldErrors: {},
    formError: null,
  };

  const [state, formAction, isPending] = useActionState<UpdatePlayerActionState, FormData>(
    action,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="edit-player-full-name" className="text-sm font-medium text-gray-700">
          Nombre completo
        </label>
        <Input
          id="edit-player-full-name"
          name="full_name"
          required
          minLength={2}
          disabled={isPending}
          placeholder="Juan Pérez"
          defaultValue={state.values.full_name}
        />
        {state.fieldErrors.full_name ? (
          <p className="text-sm text-red-600">{state.fieldErrors.full_name}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="edit-player-birth-date" className="text-sm font-medium text-gray-700">
            Fecha de nacimiento (opcional)
          </label>
          <Input
            id="edit-player-birth-date"
            name="birth_date"
            type="date"
            disabled={isPending}
            defaultValue={state.values.birth_date}
          />
          {state.fieldErrors.birth_date ? (
            <p className="text-sm text-red-600">{state.fieldErrors.birth_date}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="edit-player-status" className="text-sm font-medium text-gray-700">
            Estado
          </label>
          <select
            id="edit-player-status"
            name="status"
            defaultValue={state.values.status}
            disabled={isPending}
            className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          >
            {PLAYER_STATUS_VALUES.map((status) => (
              <option key={status} value={status}>
                {formatStatusLabel(status)}
              </option>
            ))}
          </select>
          {state.fieldErrors.status ? <p className="text-sm text-red-600">{state.fieldErrors.status}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="edit-player-photo-url" className="text-sm font-medium text-gray-700">
          URL de foto (opcional)
        </label>
        <Input
          id="edit-player-photo-url"
          name="photo_url"
          type="url"
          disabled={isPending}
          placeholder="https://..."
          defaultValue={state.values.photo_url}
        />
        {state.fieldErrors.photo_url ? <p className="text-sm text-red-600">{state.fieldErrors.photo_url}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="edit-player-preferred-position" className="text-sm font-medium text-gray-700">
            Posición preferida (opcional)
          </label>
          <Input
            id="edit-player-preferred-position"
            name="preferred_position"
            maxLength={50}
            disabled={isPending}
            placeholder="Delantero"
            defaultValue={state.values.preferred_position}
          />
          {state.fieldErrors.preferred_position ? (
            <p className="text-sm text-red-600">{state.fieldErrors.preferred_position}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="edit-player-dominant-foot" className="text-sm font-medium text-gray-700">
            Perfil dominante (opcional)
          </label>
          <select
            id="edit-player-dominant-foot"
            name="dominant_foot"
            defaultValue={state.values.dominant_foot}
            disabled={isPending}
            className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">Sin definir</option>
            {DOMINANT_FOOT_VALUES.map((foot) => (
              <option key={foot} value={foot}>
                {DOMINANT_FOOT_LABELS[foot]}
              </option>
            ))}
          </select>
          {state.fieldErrors.dominant_foot ? (
            <p className="text-sm text-red-600">{state.fieldErrors.dominant_foot}</p>
          ) : null}
        </div>
      </div>

      {state.formError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.formError}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando cambios..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
