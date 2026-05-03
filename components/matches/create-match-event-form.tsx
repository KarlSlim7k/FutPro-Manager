"use client";

import { useActionState } from "react";
import {
  createMatchEventAction,
  type CreateMatchEventActionState,
} from "@/app/dashboard/leagues/[slug]/matches/[matchId]/events/actions";
import { getMatchEventTypeLabel } from "@/components/matches/match-event-type-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MATCH_EVENT_TYPE_VALUES } from "@/types/database";

interface CreateMatchEventFormProps {
  leagueSlug: string;
  matchId: string;
  isMatchCancelled: boolean;
  homeTeam: { id: string; name: string };
  awayTeam: { id: string; name: string };
  players: Array<{
    id: string;
    full_name: string;
    preferred_position: string | null;
    team_id: string;
  }>;
}

export function CreateMatchEventForm({
  leagueSlug,
  matchId,
  isMatchCancelled,
  homeTeam,
  awayTeam,
  players,
}: CreateMatchEventFormProps) {
  const action = createMatchEventAction.bind(null, leagueSlug, matchId);
  const initialState: CreateMatchEventActionState = {
    values: {
      team_id: "",
      player_id: "",
      event_type: "",
      minute: "",
      notes: "",
    },
    fieldErrors: {},
    formError: null,
  };

  const [state, formAction, isPending] = useActionState<CreateMatchEventActionState, FormData>(
    action,
    initialState
  );

  const homePlayers = players.filter((player) => player.team_id === homeTeam.id);
  const awayPlayers = players.filter((player) => player.team_id === awayTeam.id);
  const hasPlayers = players.length > 0;
  const canSubmit = !isPending && !isMatchCancelled && hasPlayers;

  return (
    <form action={formAction} className="space-y-4">
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
        Los eventos no actualizan automáticamente el marcador ni la tabla de posiciones en esta
        fase.
      </p>

      {isMatchCancelled ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          No se pueden registrar eventos en un partido cancelado.
        </p>
      ) : null}

      {!hasPlayers ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          No hay jugadores registrados activos para este partido en la temporada seleccionada.
        </p>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="match-event-team-id" className="text-sm font-medium text-gray-700">
          Equipo
        </label>
        <select
          id="match-event-team-id"
          name="team_id"
          required
          disabled={!canSubmit}
          defaultValue={state.values.team_id}
          className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
        >
          <option value="">Selecciona un equipo</option>
          <option value={homeTeam.id}>{homeTeam.name}</option>
          <option value={awayTeam.id}>{awayTeam.name}</option>
        </select>
        {state.fieldErrors.team_id ? (
          <p className="text-sm text-red-600">{state.fieldErrors.team_id}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="match-event-player-id" className="text-sm font-medium text-gray-700">
          Jugador
        </label>
        <select
          id="match-event-player-id"
          name="player_id"
          required
          disabled={!canSubmit}
          defaultValue={state.values.player_id}
          className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
        >
          <option value="">Selecciona un jugador</option>
          {homePlayers.length > 0 ? (
            <optgroup label={homeTeam.name}>
              {homePlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.full_name}
                  {player.preferred_position ? ` - ${player.preferred_position}` : ""}
                </option>
              ))}
            </optgroup>
          ) : null}
          {awayPlayers.length > 0 ? (
            <optgroup label={awayTeam.name}>
              {awayPlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.full_name}
                  {player.preferred_position ? ` - ${player.preferred_position}` : ""}
                </option>
              ))}
            </optgroup>
          ) : null}
        </select>
        {state.fieldErrors.player_id ? (
          <p className="text-sm text-red-600">{state.fieldErrors.player_id}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="match-event-type" className="text-sm font-medium text-gray-700">
          Tipo de evento
        </label>
        <select
          id="match-event-type"
          name="event_type"
          required
          disabled={!canSubmit}
          defaultValue={state.values.event_type}
          className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
        >
          <option value="">Selecciona tipo</option>
          {MATCH_EVENT_TYPE_VALUES.map((eventType) => (
            <option key={eventType} value={eventType}>
              {getMatchEventTypeLabel(eventType)}
            </option>
          ))}
        </select>
        {state.fieldErrors.event_type ? (
          <p className="text-sm text-red-600">{state.fieldErrors.event_type}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="match-event-minute" className="text-sm font-medium text-gray-700">
          Minuto
        </label>
        <Input
          id="match-event-minute"
          name="minute"
          type="number"
          min={0}
          max={130}
          step={1}
          inputMode="numeric"
          required
          disabled={!canSubmit}
          defaultValue={state.values.minute}
        />
        {state.fieldErrors.minute ? (
          <p className="text-sm text-red-600">{state.fieldErrors.minute}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="match-event-notes" className="text-sm font-medium text-gray-700">
          Notas (opcional)
        </label>
        <textarea
          id="match-event-notes"
          name="notes"
          rows={3}
          maxLength={280}
          disabled={!canSubmit}
          defaultValue={state.values.notes}
          className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          placeholder="Describe el evento (opcional)"
        />
        {state.fieldErrors.notes ? (
          <p className="text-sm text-red-600">{state.fieldErrors.notes}</p>
        ) : null}
      </div>

      {state.formError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.formError}
        </p>
      ) : null}

      <Button type="submit" disabled={!canSubmit}>
        {isPending ? "Registrando evento..." : "Registrar evento"}
      </Button>
    </form>
  );
}
