"use client";

import { useActionState } from "react";
import { createPlayerAction } from "@/app/dashboard/leagues/[slug]/players/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DOMINANT_FOOT_VALUES, PLAYER_STATUS_VALUES } from "@/types/database";

type CreatePlayerFormState = {
  values: {
    full_name: string;
    birth_date: string;
    photo_url: string;
    preferred_position: string;
    dominant_foot: string;
    status: string;
  };
  fieldErrors: Partial<
    Record<"full_name" | "birth_date" | "photo_url" | "preferred_position" | "dominant_foot" | "status", string>
  >;
  formError: string | null;
};

const INITIAL_STATE: CreatePlayerFormState = {
  values: {
    full_name: "",
    birth_date: "",
    photo_url: "",
    preferred_position: "",
    dominant_foot: "",
    status: "active",
  },
  fieldErrors: {},
  formError: null,
};

interface CreatePlayerFormProps {
  leagueSlug: string;
}

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const DOMINANT_FOOT_LABELS: Record<(typeof DOMINANT_FOOT_VALUES)[number], string> = {
  left: "Izquierdo",
  right: "Derecho",
  both: "Ambos",
};

export function CreatePlayerForm({ leagueSlug }: CreatePlayerFormProps) {
  const action = createPlayerAction.bind(null, leagueSlug);
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="player-full-name" className="text-sm font-medium text-gray-700">
          Nombre completo
        </label>
        <Input
          id="player-full-name"
          name="full_name"
          required
          minLength={3}
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
          <label htmlFor="player-birth-date" className="text-sm font-medium text-gray-700">
            Fecha de nacimiento (opcional)
          </label>
          <Input
            id="player-birth-date"
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
          <label htmlFor="player-status" className="text-sm font-medium text-gray-700">
            Estado
          </label>
          <select
            id="player-status"
            name="status"
            defaultValue={state.values.status}
            disabled={isPending}
            className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          >
            {PLAYER_STATUS_VALUES.map((status) => (
              <option key={status} value={status}>
                {formatLabel(status)}
              </option>
            ))}
          </select>
          {state.fieldErrors.status ? <p className="text-sm text-red-600">{state.fieldErrors.status}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="player-photo-url" className="text-sm font-medium text-gray-700">
          URL de foto (opcional)
        </label>
        <Input
          id="player-photo-url"
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
          <label htmlFor="player-preferred-position" className="text-sm font-medium text-gray-700">
            Posición preferida (opcional)
          </label>
          <Input
            id="player-preferred-position"
            name="preferred_position"
            disabled={isPending}
            placeholder="Delantero"
            defaultValue={state.values.preferred_position}
          />
          {state.fieldErrors.preferred_position ? (
            <p className="text-sm text-red-600">{state.fieldErrors.preferred_position}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="player-dominant-foot" className="text-sm font-medium text-gray-700">
            Perfil dominante (opcional)
          </label>
          <select
            id="player-dominant-foot"
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
        {isPending ? "Creando jugador..." : "Crear jugador"}
      </Button>
    </form>
  );
}
