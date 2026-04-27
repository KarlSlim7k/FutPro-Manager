"use client";

import { useActionState } from "react";
import { createMatchAction } from "@/app/dashboard/leagues/[slug]/matches/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MATCH_STATUS_VALUES } from "@/types/database";

type SeasonOption = { id: string; name: string };
type TeamOption = { id: string; name: string };
type VenueOption = { id: string; name: string };

type CreateMatchFormState = {
  values: {
    season_id: string;
    home_team_id: string;
    away_team_id: string;
    venue_id: string;
    scheduled_at: string;
    status: string;
    round_name: string;
  };
  fieldErrors: Partial<
    Record<
      "season_id" | "home_team_id" | "away_team_id" | "venue_id" | "scheduled_at" | "status" | "round_name",
      string
    >
  >;
  formError: string | null;
};

const INITIAL_STATE: CreateMatchFormState = {
  values: {
    season_id: "",
    home_team_id: "",
    away_team_id: "",
    venue_id: "",
    scheduled_at: "",
    status: "scheduled",
    round_name: "",
  },
  fieldErrors: {},
  formError: null,
};

function formatStatusLabel(status: string) {
  const labels: Record<string, string> = {
    scheduled: "Programado",
    in_progress: "En juego",
    completed: "Finalizado",
    postponed: "Pospuesto",
    cancelled: "Cancelado",
  };
  return labels[status] ?? status;
}

interface CreateMatchFormProps {
  leagueSlug: string;
  seasons: SeasonOption[];
  teams: TeamOption[];
  venues: VenueOption[];
}

export function CreateMatchForm({ leagueSlug, seasons, teams, venues }: CreateMatchFormProps) {
  const action = createMatchAction.bind(null, leagueSlug);
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  const hasMinTeams = teams.length >= 2;
  const hasSeasons = seasons.length > 0;
  const canSubmit = hasMinTeams && hasSeasons;

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="match-season" className="text-sm font-medium text-gray-700">
          Temporada
        </label>
        <select
          id="match-season"
          name="season_id"
          defaultValue={state.values.season_id}
          disabled={isPending || !hasSeasons}
          required
          className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
        >
          <option value="" disabled>
            {hasSeasons ? "Selecciona una temporada" : "No hay temporadas"}
          </option>
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.name}
            </option>
          ))}
        </select>
        {state.fieldErrors.season_id ? (
          <p className="text-sm text-red-600">{state.fieldErrors.season_id}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="match-home-team" className="text-sm font-medium text-gray-700">
            Equipo local
          </label>
          <select
            id="match-home-team"
            name="home_team_id"
            defaultValue={state.values.home_team_id}
            disabled={isPending || !hasMinTeams}
            required
            className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="" disabled>
              {hasMinTeams ? "Selecciona equipo local" : "No hay equipos"}
            </option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          {state.fieldErrors.home_team_id ? (
            <p className="text-sm text-red-600">{state.fieldErrors.home_team_id}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="match-away-team" className="text-sm font-medium text-gray-700">
            Equipo visitante
          </label>
          <select
            id="match-away-team"
            name="away_team_id"
            defaultValue={state.values.away_team_id}
            disabled={isPending || !hasMinTeams}
            required
            className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="" disabled>
              {hasMinTeams ? "Selecciona equipo visitante" : "No hay equipos"}
            </option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          {state.fieldErrors.away_team_id ? (
            <p className="text-sm text-red-600">{state.fieldErrors.away_team_id}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="match-venue" className="text-sm font-medium text-gray-700">
          Sede (opcional)
        </label>
        <select
          id="match-venue"
          name="venue_id"
          defaultValue={state.values.venue_id}
          disabled={isPending}
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="match-scheduled-at" className="text-sm font-medium text-gray-700">
            Fecha y hora
          </label>
          <Input
            id="match-scheduled-at"
            name="scheduled_at"
            type="datetime-local"
            required
            disabled={isPending}
            defaultValue={state.values.scheduled_at}
          />
          {state.fieldErrors.scheduled_at ? (
            <p className="text-sm text-red-600">{state.fieldErrors.scheduled_at}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="match-status" className="text-sm font-medium text-gray-700">
            Estado
          </label>
          <select
            id="match-status"
            name="status"
            defaultValue={state.values.status}
            disabled={isPending}
            required
            className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
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
      </div>

      <div className="space-y-2">
        <label htmlFor="match-round-name" className="text-sm font-medium text-gray-700">
          Jornada / Ronda (opcional)
        </label>
        <Input
          id="match-round-name"
          name="round_name"
          disabled={isPending}
          placeholder="Jornada 1"
          defaultValue={state.values.round_name}
        />
        {state.fieldErrors.round_name ? (
          <p className="text-sm text-red-600">{state.fieldErrors.round_name}</p>
        ) : null}
      </div>

      {!hasSeasons ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Necesitas al menos una temporada para programar un partido.
        </p>
      ) : null}

      {!hasMinTeams ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Necesitas al menos 2 equipos para programar un partido.
        </p>
      ) : null}

      {state.formError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.formError}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending || !canSubmit}>
        {isPending ? "Programando partido..." : "Programar partido"}
      </Button>
    </form>
  );
}
