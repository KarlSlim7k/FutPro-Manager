"use client";

import { useActionState, useState } from "react";
import { createMatchEventAction } from "@/app/dashboard/leagues/[slug]/matches/[matchId]/events/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MATCH_EVENT_TYPE_VALUES } from "@/types/database";
import type { MatchEventType } from "@/types/database";

function getEventTypeLabel(type: MatchEventType): string {
  const labels: Record<MatchEventType, string> = {
    goal: "Gol",
    own_goal: "Autogol",
    assist: "Asistencia",
    yellow_card: "Tarjeta amarilla",
    red_card: "Tarjeta roja",
    substitution: "Sustitución",
    penalty_goal: "Gol de penal",
    penalty_miss: "Penal fallado",
  };
  return labels[type];
}

type FormState = {
  values: Record<string, string>;
  fieldErrors: Partial<Record<string, string>>;
  formError: string | null;
  success: boolean;
};

interface CreateMatchEventFormProps {
  leagueSlug: string;
  matchId: string;
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
  homeTeam,
  awayTeam,
  players,
}: CreateMatchEventFormProps) {
  const action = createMatchEventAction.bind(null, leagueSlug, matchId);
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    action,
    {
      values: {
        team_id: "",
        player_id: "",
        event_type: "",
        minute: "",
        notes: "",
      },
      fieldErrors: {},
      formError: null,
      success: false,
    }
  );

  const [selectedTeamId, setSelectedTeamId] = useState(state.values.team_id);

  const homePlayers = players.filter((p) => p.team_id === homeTeam.id);
  const awayPlayers = players.filter((p) => p.team_id === awayTeam.id);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="team_id" className="text-sm font-medium text-gray-700">
          Equipo
        </label>
        <select
          id="team_id"
          name="team_id"
          required
          disabled={isPending}
          defaultValue={state.values.team_id}
          onChange={(e) => setSelectedTeamId(e.target.value)}
          className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
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
        <label htmlFor="player_id" className="text-sm font-medium text-gray-700">
          Jugador (opcional)
        </label>
        <select
          id="player_id"
          name="player_id"
          disabled={isPending}
          defaultValue={state.values.player_id}
          className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
        >
          <option value="">Sin jugador</option>
          {homePlayers.length > 0 && (
            <optgroup label={homeTeam.name}>
              {homePlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                  {p.preferred_position ? ` — ${p.preferred_position}` : ""}
                </option>
              ))}
            </optgroup>
          )}
          {awayPlayers.length > 0 && (
            <optgroup label={awayTeam.name}>
              {awayPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                  {p.preferred_position ? ` — ${p.preferred_position}` : ""}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        {state.fieldErrors.player_id ? (
          <p className="text-sm text-red-600">{state.fieldErrors.player_id}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="event_type" className="text-sm font-medium text-gray-700">
          Tipo de evento
        </label>
        <select
          id="event_type"
          name="event_type"
          required
          disabled={isPending}
          defaultValue={state.values.event_type}
          className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
        >
          <option value="">Selecciona tipo</option>
          {MATCH_EVENT_TYPE_VALUES.map((type) => (
            <option key={type} value={type}>
              {getEventTypeLabel(type)}
            </option>
          ))}
        </select>
        {state.fieldErrors.event_type ? (
          <p className="text-sm text-red-600">{state.fieldErrors.event_type}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="minute" className="text-sm font-medium text-gray-700">
          Minuto
        </label>
        <Input
          id="minute"
          name="minute"
          type="number"
          min={0}
          max={130}
          required
          disabled={isPending}
          defaultValue={state.values.minute}
        />
        {state.fieldErrors.minute ? (
          <p className="text-sm text-red-600">{state.fieldErrors.minute}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium text-gray-700">
          Notas (opcional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={500}
          disabled={isPending}
          defaultValue={state.values.notes}
          className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
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

      {state.success ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Evento registrado correctamente.
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Registrando..." : "Registrar evento"}
      </Button>
    </form>
  );
}
