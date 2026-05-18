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

const filterLabels: Record<EventFilter, string> = {
  all: "Todos",
  goals: "Goles",
  cards: "Tarjetas",
  substitutions: "Sustituciones",
  penalties: "Penales",
};

function formatEventType(eventType: MatchEventItem["event_type"]) {
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

function eventDisplay(eventType: MatchEventItem["event_type"]) {
  const styles: Record<MatchEventItem["event_type"], { icon: string; color: string }> = {
    goal: { icon: "⚽", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    own_goal: { icon: "🥅", color: "bg-orange-50 text-orange-700 border-orange-200" },
    assist: { icon: "🎯", color: "bg-sky-50 text-sky-700 border-sky-200" },
    yellow_card: { icon: "🟨", color: "bg-amber-50 text-amber-700 border-amber-200" },
    red_card: { icon: "🟥", color: "bg-rose-50 text-rose-700 border-rose-200" },
    substitution: { icon: "🔁", color: "bg-violet-50 text-violet-700 border-violet-200" },
    penalty_goal: { icon: "✅", color: "bg-teal-50 text-teal-700 border-teal-200" },
    penalty_miss: { icon: "❌", color: "bg-red-50 text-red-700 border-red-200" },
  };
  return styles[eventType];
}

function matchesFilter(event: MatchEventItem, filter: EventFilter) {
  if (filter === "all") return true;
  if (filter === "goals") return ["goal", "own_goal"].includes(event.event_type);
  if (filter === "cards") return ["yellow_card", "red_card"].includes(event.event_type);
  if (filter === "substitutions") return event.event_type === "substitution";
  return ["penalty_goal", "penalty_miss"].includes(event.event_type);
}

function teamLabel(teamId: string | null, homeTeamId?: string, awayTeamId?: string): string | null {
  if (!teamId || !homeTeamId || !awayTeamId) return null;
  if (teamId === homeTeamId) return "Local";
  if (teamId === awayTeamId) return "Visitante";
  return null;
}

export function PublicMatchEvents({ events, teams, players, homeTeamId, awayTeamId, leagueSlug }: PublicMatchEventsProps) {
  const [filter, setFilter] = useState<EventFilter>("all");
  const teamsMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const playersMap = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);

  const summary = useMemo(() => ({
    total: events.length,
    goals: events.filter((e) => ["goal", "own_goal"].includes(e.event_type)).length,
    cards: events.filter((e) => ["yellow_card", "red_card"].includes(e.event_type)).length,
    substitutions: events.filter((e) => e.event_type === "substitution").length,
    penalties: events.filter((e) => ["penalty_goal", "penalty_miss"].includes(e.event_type)).length,
  }), [events]);

  const filteredEvents = useMemo(() => events.filter((event) => matchesFilter(event, filter)), [events, filter]);

  if (events.length === 0) {
    return <EmptyState title="Sin eventos registrados" description="Cuando se registren goles, tarjetas o sustituciones, aparecerán aquí." />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {[{ label: "Total", value: summary.total }, { label: "Goles", value: summary.goals }, { label: "Tarjetas", value: summary.cards }, { label: "Sustituciones", value: summary.substitutions }, { label: "Penales", value: summary.penalties }].map((item) => (
          <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-3 text-center">
            <p className="text-xs text-gray-600">{item.label}</p>
            <p className="text-lg font-semibold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(filterLabels) as EventFilter[]).map((option) => (
          <button key={option} type="button" onClick={() => setFilter(option)} className={`rounded-full border px-3 py-1.5 text-sm ${filter === option ? "border-emerald-700 bg-emerald-700 text-white" : "border-gray-300 bg-white text-gray-700 hover:border-emerald-500 hover:text-emerald-700"}`} aria-label={`Filtrar eventos: ${filterLabels[option]}`}>
            {filterLabels[option]}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <EmptyState title={`Sin eventos en filtro: ${filterLabels[filter]}`} description="Prueba otro filtro para visualizar otros eventos del partido." />
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-200" />
          <div className="space-y-4">
            {filteredEvents.map((event) => {
              const team = event.team_id ? teamsMap.get(event.team_id) : null;
              const player = event.player_id ? playersMap.get(event.player_id) : null;
              const sideLabel = teamLabel(event.team_id, homeTeamId, awayTeamId);
              const display = eventDisplay(event.event_type);

              return (
                <div key={event.id} className="relative flex items-start gap-4">
                  <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm shadow-sm ${display.color}`} title={formatEventType(event.event_type)} aria-label={formatEventType(event.event_type)}>
                    <span aria-hidden>{display.icon}</span>
                  </div>

                  <div className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Eyebrow as="span" tone="brand">{event.minute}&apos;</Eyebrow>
                      <span className="text-sm font-medium text-gray-900">{formatEventType(event.event_type)}</span>
                      {sideLabel ? <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{sideLabel}</span> : null}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600">
                      <span className="break-words">Equipo: {team?.name ?? "No especificado"}</span>
                      <span className="break-words">Jugador: {player ? <Link className="font-medium text-emerald-700 hover:text-emerald-800 hover:underline" href={`/liga/${leagueSlug}/players/${player.id}`}>{player.full_name}</Link> : "No especificado"}</span>
                    </div>
                    {event.notes ? <p className="mt-1 break-words text-xs text-gray-500">Notas: {event.notes}</p> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
