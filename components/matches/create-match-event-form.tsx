"use client";

import { useActionState, useState } from "react";
import {
  createMatchEventAction,
  type CreateMatchEventActionState,
} from "@/app/dashboard/leagues/[slug]/matches/[matchId]/events/actions";
import { getMatchEventTypeLabel } from "@/components/matches/match-event-type-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MATCH_EVENT_TYPE_VALUES, type MatchEventType } from "@/types/database";

interface CreateMatchEventFormProps {
  leagueSlug: string;
  matchId: string;
  isMatchCancelled: boolean;
  homeTeam: { id: string; name: string };
  awayTeam: { id: string; name: string };
  allowedTeamIds?: string[];
  players: Array<{
    id: string;
    full_name: string;
    preferred_position: string | null;
    team_id: string;
    isEligible?: boolean;
    eligibilityReason?: string;
    eligibilityWarning?: string;
  }>;
}

export function CreateMatchEventForm({
  leagueSlug,
  matchId,
  isMatchCancelled,
  homeTeam,
  awayTeam,
  allowedTeamIds,
  players,
}: CreateMatchEventFormProps) {
  const action = createMatchEventAction.bind(null, leagueSlug, matchId);
  const selectableTeams = [homeTeam, awayTeam].filter(
    (t) => !allowedTeamIds || allowedTeamIds.length === 0 || allowedTeamIds.includes(t.id)
  );
  const defaultTeamId = selectableTeams.length === 1 ? selectableTeams[0].id : "";

  const [selectedEventType, setSelectedEventType] = useState<string>("");
  const [selectedTeamId, setSelectedTeamId] = useState<string>(defaultTeamId);
  const [minute, setMinute] = useState<string>("");

  const initialState: CreateMatchEventActionState = {
    values: {
      team_id: defaultTeamId,
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
  const canSubmit = !isPending && !isMatchCancelled && hasPlayers && selectableTeams.length > 0;

  const quickTypes: Array<{ type: MatchEventType; label: string; icon: string; style: string }> = [
    { type: "goal", label: "Gol", icon: "⚽", style: "border-emerald-600 bg-emerald-50 text-emerald-900 active:bg-emerald-100" },
    { type: "yellow_card", label: "Amarilla", icon: "🟨", style: "border-amber-500 bg-amber-50 text-amber-900 active:bg-amber-100" },
    { type: "red_card", label: "Roja", icon: "🟥", style: "border-rose-600 bg-rose-50 text-rose-900 active:bg-rose-100" },
    { type: "substitution", label: "Cambio", icon: "🔄", style: "border-blue-500 bg-blue-50 text-blue-900 active:bg-blue-100" },
  ];

  const handleQuickType = (t: string) => {
    setSelectedEventType(t);
  };

  const stepMinute = (delta: number) => {
    const current = parseInt(minute, 10) || 0;
    setMinute(String(Math.max(0, Math.min(130, current + delta))));
  };

  return (
    <form action={formAction} className="space-y-5">
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs sm:text-sm text-amber-800">
        Los eventos no actualizan automáticamente el marcador ni la tabla de posiciones en esta fase.
      </p>

      {isMatchCancelled ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs sm:text-sm text-amber-700">
          No se pueden registrar eventos en un partido cancelado.
        </p>
      ) : null}

      {!hasPlayers ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs sm:text-sm text-amber-700">
          No hay jugadores registrados activos para este partido en la temporada seleccionada.
        </p>
      ) : null}

      {/* Modo Cancha: Botones Rápidos de Evento */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-2">
          Acceso Rápido Cancha
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {quickTypes.map((q) => {
            const isSelected = selectedEventType === q.type;
            return (
              <button
                key={q.type}
                type="button"
                onClick={() => handleQuickType(q.type)}
                disabled={!canSubmit}
                className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 p-2.5 text-sm font-bold transition touch-manipulation active:scale-95 ${
                  isSelected
                    ? "ring-2 ring-emerald-600 shadow-md font-black " + q.style
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                <span className="text-base" aria-hidden>{q.icon}</span>
                <span>{q.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Selector de Equipo */}
        <div className="space-y-1.5">
          <label htmlFor="match-event-team-id" className="text-xs font-semibold text-gray-700 uppercase">
            Equipo
          </label>
          <select
            id="match-event-team-id"
            name="team_id"
            required
            disabled={!canSubmit}
            value={selectedTeamId || state.values.team_id || defaultTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="flex h-12 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-base sm:text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          >
            {selectableTeams.length > 1 ? (
              <option value="">Selecciona un equipo</option>
            ) : null}
            {selectableTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          {state.fieldErrors.team_id ? (
            <p className="text-xs text-red-600">{state.fieldErrors.team_id}</p>
          ) : null}
        </div>

        {/* Tipo de evento */}
        <div className="space-y-1.5">
          <label htmlFor="match-event-type" className="text-xs font-semibold text-gray-700 uppercase">
            Tipo de evento
          </label>
          <select
            id="match-event-type"
            name="event_type"
            required
            disabled={!canSubmit}
            value={selectedEventType || state.values.event_type}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="flex h-12 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-base sm:text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">Selecciona tipo</option>
            {MATCH_EVENT_TYPE_VALUES.map((eventType) => (
              <option key={eventType} value={eventType}>
                {getMatchEventTypeLabel(eventType)}
              </option>
            ))}
          </select>
          {state.fieldErrors.event_type ? (
            <p className="text-xs text-red-600">{state.fieldErrors.event_type}</p>
          ) : null}
        </div>
      </div>

      {/* Selector de Jugador */}
      <div className="space-y-1.5">
        <label htmlFor="match-event-player-id" className="text-xs font-semibold text-gray-700 uppercase">
          Jugador
        </label>
        <select
          id="match-event-player-id"
          name="player_id"
          required
          disabled={!canSubmit}
          defaultValue={state.values.player_id}
          className="flex h-12 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-base sm:text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
        >
          <option value="">Selecciona un jugador</option>
          {selectableTeams.some((t) => t.id === homeTeam.id) && homePlayers.length > 0 ? (
            <optgroup label={homeTeam.name}>
              {homePlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.isEligible === false ? "[No elegible] " : player.eligibilityWarning ? "[!] " : ""}
                  {player.full_name}
                  {player.preferred_position ? ` - ${player.preferred_position}` : ""}
                  {player.isEligible === false && player.eligibilityReason ? ` (${player.eligibilityReason})` : ""}
                </option>
              ))}
            </optgroup>
          ) : null}
          {selectableTeams.some((t) => t.id === awayTeam.id) && awayPlayers.length > 0 ? (
            <optgroup label={awayTeam.name}>
              {awayPlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.isEligible === false ? "[No elegible] " : player.eligibilityWarning ? "[!] " : ""}
                  {player.full_name}
                  {player.preferred_position ? ` - ${player.preferred_position}` : ""}
                  {player.isEligible === false && player.eligibilityReason ? ` (${player.eligibilityReason})` : ""}
                </option>
              ))}
            </optgroup>
          ) : null}
        </select>
        {state.fieldErrors.player_id ? (
          <p className="text-xs text-red-600">{state.fieldErrors.player_id}</p>
        ) : null}
      </div>

      {/* Minuto con atajos */}
      <div className="space-y-1.5">
        <label htmlFor="match-event-minute" className="text-xs font-semibold text-gray-700 uppercase">
          Minuto de partido
        </label>
        <div className="flex items-center gap-2">
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
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className="h-12 text-base font-bold"
            placeholder="Minuto (ej. 45)"
          />
          <button
            type="button"
            onClick={() => stepMinute(1)}
            disabled={!canSubmit}
            className="flex h-12 min-w-[50px] items-center justify-center rounded-xl border border-gray-300 bg-gray-50 text-xs font-bold text-gray-800 transition active:bg-gray-200 touch-manipulation"
          >
            +1&apos;
          </button>
          <button
            type="button"
            onClick={() => stepMinute(5)}
            disabled={!canSubmit}
            className="flex h-12 min-w-[50px] items-center justify-center rounded-xl border border-gray-300 bg-gray-50 text-xs font-bold text-gray-800 transition active:bg-gray-200 touch-manipulation"
          >
            +5&apos;
          </button>
        </div>
        {state.fieldErrors.minute ? (
          <p className="text-xs text-red-600">{state.fieldErrors.minute}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="match-event-notes" className="text-xs font-semibold text-gray-700 uppercase">
          Notas del evento (opcional)
        </label>
        <textarea
          id="match-event-notes"
          name="notes"
          rows={2}
          maxLength={280}
          disabled={!canSubmit}
          defaultValue={state.values.notes}
          className="flex w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-base sm:text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          placeholder="Comentarios adicionales del árbitro..."
        />
        {state.fieldErrors.notes ? (
          <p className="text-xs text-red-600">{state.fieldErrors.notes}</p>
        ) : null}
      </div>

      {state.formError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs sm:text-sm text-red-700">
          {state.formError}
        </p>
      ) : null}

      {/* Sticky Action Bar con safe-area */}
      <div className="sticky bottom-0 z-20 -mx-4 -mb-4 border-t border-gray-200 bg-white/95 p-4 backdrop-blur-md safe-area-pb sm:static sm:mx-0 sm:mb-0 sm:border-0 sm:bg-transparent sm:p-0">
        <Button
          type="submit"
          disabled={!canSubmit}
          className="w-full sm:w-auto h-12 text-base font-bold shadow-md touch-manipulation"
        >
          {isPending ? "Registrando evento..." : "Registrar evento en cancha"}
        </Button>
      </div>
    </form>
  );
}
