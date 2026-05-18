"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { MatchEvent, Player, Team } from "@/types/database";

type MatchEventItem = Pick<
  MatchEvent,
  "id" | "team_id" | "player_id" | "event_type" | "minute" | "notes" | "created_at"
>;
type TeamItem = Pick<Team, "id" | "name" | "slug">;
type PlayerItem = Pick<Player, "id" | "full_name">;

type EventFilter = "all" | "goals" | "cards" | "substitutions" | "penalties";

type PublicMatchEventsProps = {
  events: MatchEventItem[];
  teams: TeamItem[];
  players: PlayerItem[];
  homeTeamId?: string;
  awayTeamId?: string;
  leagueSlug: string;
};

type EventSummary = {
  total: number;
  goals: number;
  cards: number;
  substitutions: number;
  penalties: number;
};

const filterOptions: { key: EventFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "goals", label: "Goles" },
  { key: "cards", label: "Tarjetas" },
  { key: "substitutions", label: "Sustituciones" },
  { key: "penalties", label: "Penales" },
];

function formatEventType(eventType: MatchEventItem["event_type"]): string {
  const labels: Record<MatchEventItem["event_type"], string> = {
    goal: "Gol",
    own_goal: "Autogol",
    assist: "Asistencia",
    yellow_card: "Tarjeta amarilla",
    red_card: "Tarjeta roja",
    substitution: "Sustitución",
    penalty_goal: "Gol de penal",
    penalty_miss: "Penal fallado",
  };

  return labels[eventType];
}

function getEventVisual(eventType: MatchEventItem["event_type"]) {
  const visuals: Record<MatchEventItem["event_type"], { icon: string; className: string }> = {
    goal: { icon: "⚽", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    own_goal: { icon: "🥅", className: "border-orange-200 bg-orange-50 text-orange-700" },
    assist: { icon: "🎯", className: "border-sky-200 bg-sky-50 text-sky-700" },
    yellow_card: { icon: "🟨", className: "border-amber-200 bg-amber-50 text-amber-700" },
    red_card: { icon: "🟥", className: "border-rose-200 bg-rose-50 text-rose-700" },
    substitution: { icon: "🔁", className: "border-violet-200 bg-violet-50 text-violet-700" },
    penalty_goal: { icon: "✅", className: "border-teal-200 bg-teal-50 text-teal-700" },
    penalty_miss: { icon: "❌", className: "border-red-200 bg-red-50 text-red-700" },
  };

  return visuals[eventType];
}

function isGoalEvent(event: MatchEventItem): boolean {
  return event.event_type === "goal" || event.event_type === "own_goal";
}

function isCardEvent(event: MatchEventItem): boolean {
  return event.event_type === "yellow_card" || event.event_type === "red_card";
}

function isPenaltyEvent(event: MatchEventItem): boolean {
  return event.event_type === "penalty_goal" || event.event_type === "penalty_miss";
}

function matchesFilter(event: MatchEventItem, filter: EventFilter): boolean {
  if (filter === "all") return true;
  if (filter === "goals") return isGoalEvent(event);
  if (filter === "cards") return isCardEvent(event);
  if (filter === "substitutions") return event.event_type === "substitution";
  return isPenaltyEvent(event);
}

function resolveSideLabel(teamId: string | null, homeTeamId?: string, awayTeamId?: string): string | null {
  if (!teamId || !homeTeamId || !awayTeamId) return null;
  if (teamId === homeTeamId) return "Local";
  if (teamId === awayTeamId) return "Visitante";
  return null;
}

function buildSummary(events: MatchEventItem[]): EventSummary {
  return {
    total: events.length,
    goals: events.filter(isGoalEvent).length,
    cards: events.filter(isCardEvent).length,
    substitutions: events.filter((event) => event.event_type === "substitution").length,
    penalties: events.filter(isPenaltyEvent).length,
  };
}

export function PublicMatchEvents({
  events,
  teams,
  players,
  homeTeamId,
  awayTeamId,
  leagueSlug,
}: PublicMatchEventsProps) {
  const [activeFilter, setActiveFilter] = useState<EventFilter>("all");

  const teamsMap = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);
  const playersMap = useMemo(() => new Map(players.map((player) => [player.id, player])), [players]);

  const summary = useMemo(() => buildSummary(events), [events]);

  const filteredEvents = useMemo(
    () => events.filter((event) => matchesFilter(event, activeFilter)),
    [events, activeFilter]
  );

  const activeFilterLabel = filterOptions.find((option) => option.key === activeFilter)?.label ?? "Todos";

  if (events.length === 0) {
    return (
      <EmptyState
        title="Sin eventos registrados"
        description="Cuando se registren goles, tarjetas o sustituciones, aparecerán aquí."
      />
    );
  }

  return (
    <section className="space-y-4" aria-label="Eventos públicos del partido">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {[
          { label: "Total", value: summary.total },
          { label: "Goles", value: summary.goals },
          { label: "Tarjetas", value: summary.cards },
          { label: "Sustituciones", value: summary.substitutions },
          { label: "Penales", value: summary.penalties },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-3 text-center">
            <p className="text-xs text-gray-600">{item.label}</p>
            <p className="text-lg font-semibold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtros de eventos">
        {filterOptions.map((option) => {
          const selected = activeFilter === option.key;

          return (
            <button
              key={option.key}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={`Filtrar por ${option.label}`}
              onClick={() => setActiveFilter(option.key)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                selected
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-emerald-500 hover:text-emerald-700"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {filteredEvents.length === 0 ? (
        <EmptyState
          title={`Sin eventos para el filtro “${activeFilterLabel}”`}
          description="Prueba con otro filtro para ver más acciones del partido."
        />
      ) : (
        <div className="relative">
          <div className="absolute bottom-2 left-4 top-2 w-px bg-gray-200" aria-hidden />

          <ul className="space-y-4" aria-live="polite">
            {filteredEvents.map((event) => {
              const eventTypeLabel = formatEventType(event.event_type);
              const eventVisual = getEventVisual(event.event_type);
              const team = event.team_id ? teamsMap.get(event.team_id) : null;
              const player = event.player_id ? playersMap.get(event.player_id) : null;
              const side = resolveSideLabel(event.team_id, homeTeamId, awayTeamId);

              return (
                <li key={event.id} className="relative flex items-start gap-4">
                  <span
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm shadow-sm ${eventVisual.className}`}
                    title={eventTypeLabel}
                    aria-label={eventTypeLabel}
                  >
                    <span aria-hidden>{eventVisual.icon}</span>
                  </span>

                  <article className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Eyebrow as="span" tone="brand">
                        {event.minute}&apos;
                      </Eyebrow>
                      <span className="text-sm font-medium text-gray-900">{eventTypeLabel}</span>
                      {side ? (
                        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                          {side}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600">
                      <span className="break-words">Equipo: {team?.name ?? "No especificado"}</span>
                      <span className="break-words">
                        Jugador:{" "}
                        {player ? (
                          <Link
                            className="font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
                            href={`/liga/${leagueSlug}/players/${player.id}`}
                          >
                            {player.full_name}
                          </Link>
                        ) : (
                          "No especificado"
                        )}
                      </span>
                    </div>

                    {event.notes ? (
                      <p className="mt-1 break-words text-xs text-gray-500">Notas: {event.notes}</p>
                    ) : null}
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
