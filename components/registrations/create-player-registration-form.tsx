"use client";

import { useActionState } from "react";
import { createPlayerRegistrationAction } from "@/app/dashboard/leagues/[slug]/teams/[teamSlug]/roster/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PLAYER_REGISTRATION_STATUS_VALUES,
  type PlayerStatus,
  type SeasonStatus,
} from "@/types/database";

type CreatePlayerRegistrationFormState = {
  values: {
    season_id: string;
    player_id: string;
    jersey_number: string;
    status: string;
  };
  fieldErrors: Partial<Record<"season_id" | "player_id" | "jersey_number" | "status", string>>;
  formError: string | null;
};

const INITIAL_STATE: CreatePlayerRegistrationFormState = {
  values: {
    season_id: "",
    player_id: "",
    jersey_number: "",
    status: "active",
  },
  fieldErrors: {},
  formError: null,
};

interface RegistrationSeasonOption {
  id: string;
  name: string;
  slug: string;
  status: SeasonStatus;
}

interface RegistrationPlayerOption {
  id: string;
  full_name: string;
  status: PlayerStatus;
}

interface CreatePlayerRegistrationFormProps {
  leagueSlug: string;
  teamSlug: string;
  seasons: RegistrationSeasonOption[];
  players: RegistrationPlayerOption[];
}

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function CreatePlayerRegistrationForm({
  leagueSlug,
  teamSlug,
  seasons,
  players,
}: CreatePlayerRegistrationFormProps) {
  const action = createPlayerRegistrationAction.bind(null, leagueSlug, teamSlug);
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const hasOptions = seasons.length > 0 && players.length > 0;

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="registration-season-id" className="text-sm font-medium text-gray-700">
            Temporada
          </label>
          <select
            id="registration-season-id"
            name="season_id"
            required
            defaultValue={state.values.season_id}
            disabled={isPending || seasons.length === 0}
            className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">Selecciona una temporada</option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name} ({formatLabel(season.status)})
              </option>
            ))}
          </select>
          {state.fieldErrors.season_id ? (
            <p className="text-sm text-red-600">{state.fieldErrors.season_id}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="registration-player-id" className="text-sm font-medium text-gray-700">
            Jugador
          </label>
          <select
            id="registration-player-id"
            name="player_id"
            required
            defaultValue={state.values.player_id}
            disabled={isPending || players.length === 0}
            className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">Selecciona un jugador</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.full_name} ({formatLabel(player.status)})
              </option>
            ))}
          </select>
          {state.fieldErrors.player_id ? (
            <p className="text-sm text-red-600">{state.fieldErrors.player_id}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="registration-jersey-number" className="text-sm font-medium text-gray-700">
            Número de camiseta (opcional)
          </label>
          <Input
            id="registration-jersey-number"
            name="jersey_number"
            type="number"
            min={0}
            max={99}
            placeholder="9"
            defaultValue={state.values.jersey_number}
            disabled={isPending}
          />
          {state.fieldErrors.jersey_number ? (
            <p className="text-sm text-red-600">{state.fieldErrors.jersey_number}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="registration-status" className="text-sm font-medium text-gray-700">
            Estado del registro
          </label>
          <select
            id="registration-status"
            name="status"
            defaultValue={state.values.status}
            disabled={isPending}
            className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          >
            {PLAYER_REGISTRATION_STATUS_VALUES.map((status) => (
              <option key={status} value={status}>
                {formatLabel(status)}
              </option>
            ))}
          </select>
          {state.fieldErrors.status ? <p className="text-sm text-red-600">{state.fieldErrors.status}</p> : null}
        </div>
      </div>

      {seasons.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          No hay temporadas disponibles para registrar jugadores.
        </p>
      ) : null}

      {players.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          No hay jugadores disponibles para registrar en este equipo.
        </p>
      ) : null}

      {state.formError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.formError}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending || !hasOptions}>
        {isPending ? "Registrando jugador..." : "Registrar jugador en el equipo"}
      </Button>
    </form>
  );
}
