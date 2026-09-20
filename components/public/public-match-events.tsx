"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Radio, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow } from "@/components/ui/eyebrow";
import { EventIcon, getMatchEventVisual } from "@/components/ui/event-icon";
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
  matchId?: string;
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
  return getMatchEventVisual(eventType);
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
  matchId,
}: PublicMatchEventsProps) {
  const [eventsList, setEventsList] = useState<MatchEventItem[]>(events);
  const [activeFilter, setActiveFilter] = useState<EventFilter>("all");
  const [liveAlert, setLiveAlert] = useState<string | null>(null);

  useEffect(() => {
    setEventsList(events);
  }, [events]);

  useEffect(() => {
    if (!matchId) return;
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`live_events_${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_events",
          filter: `match_id=eq.${matchId}`,
        },
        (payload: { eventType: string; new: Record<string, unknown>; old?: Record<string, unknown> }) => {
          if (payload.eventType === "INSERT") {
            const newEv = payload.new as unknown as MatchEventItem;
            setEventsList((prev) => {
              if (prev.some((e) => e.id === newEv.id)) return prev;
              const next = [...prev, newEv];
              return next.sort((a, b) => (b.minute ?? 0) - (a.minute ?? 0));
            });
            const eventTypeLabel = formatEventType(newEv.event_type);
            setLiveAlert(`⚡ ¡Incidencia en vivo: ${eventTypeLabel} (${newEv.minute}')!`);
            setTimeout(() => setLiveAlert(null), 5000);
          } else if (payload.eventType === "DELETE") {
            const oldId = (payload.old as { id?: string } | undefined)?.id;
            if (oldId) {
              setEventsList((prev) => prev.filter((e) => e.id !== oldId));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  const teamsMap = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);
  const playersMap = useMemo(() => new Map(players.map((player) => [player.id, player])), [players]);

  const summary = useMemo(() => buildSummary(eventsList), [eventsList]);

  const filteredEvents = useMemo(
    () => eventsList.filter((event) => matchesFilter(event, activeFilter)),
    [eventsList, activeFilter]
  );

  const activeFilterLabel = filterOptions.find((option) => option.key === activeFilter)?.label ?? "Todos";

  if (eventsList.length === 0) {
    return (
      <EmptyState
        title="Sin eventos registrados"
        description="Cuando se registren goles, tarjetas o sustituciones en la cédula, aparecerán aquí en vivo."
      />
    );
  }

  return (
    <section className="space-y-5" aria-label="Eventos públicos del partido">
      {liveAlert && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-4 py-2.5 text-xs sm:text-sm font-bold text-emerald-300 shadow-lg animate-bounce">
          <Radio className="h-4 w-4 animate-pulse text-emerald-400" />
          <span>{liveAlert}</span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {[
          { label: "Total", value: summary.total },
          { label: "Goles", value: summary.goals },
          { label: "Tarjetas", value: summary.cards },
          { label: "Sustituciones", value: summary.substitutions },
          { label: "Penales", value: summary.penalties },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-white/10 bg-slate-900/60 p-3 text-center backdrop-blur-md">
            <p className="text-xs text-gray-400">{item.label}</p>
            <p className="text-xl font-bold text-white mt-0.5">{item.value}</p>
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
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                selected
                  ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300 shadow-sm"
                  : "border-white/10 bg-white/5 text-gray-300 hover:border-emerald-500/30 hover:text-white hover:bg-white/10"
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
          <div className="absolute bottom-2 left-4 top-2 w-px bg-white/10" aria-hidden />

          <ul className="space-y-3.5" aria-live="polite">
            {filteredEvents.map((event) => {
              const eventTypeLabel = formatEventType(event.event_type);
              const eventVisual = getEventVisual(event.event_type);
              const team = event.team_id ? teamsMap.get(event.team_id) : null;
              const player = event.player_id ? playersMap.get(event.player_id) : null;
              const side = resolveSideLabel(event.team_id, homeTeamId, awayTeamId);

              return (
                <li key={event.id} className="relative flex items-start gap-3.5">
                  <EventIcon
                    type={event.event_type}
                    className={eventVisual.className}
                  />

                  <article className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900/60 p-3.5 shadow-md backdrop-blur-md">
                    <div className="flex flex-wrap items-center gap-2">
                      <Eyebrow as="span" tone="brand" className="text-emerald-400 font-mono">
                        {event.minute}&apos;
                      </Eyebrow>
                      <span className="text-sm font-semibold text-white">{eventTypeLabel}</span>
                      {side ? (
                        <span className="inline-flex rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-gray-300">
                          {side}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-300">
                      <span className="break-words">
                        Equipo: <span className="text-white font-medium">{team?.name ?? "No especificado"}</span>
                      </span>
                      <span className="break-words">
                        Jugador:{" "}
                        {player ? (
                          <Link
                            className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
                            href={`/liga/${leagueSlug}/players/${player.id}`}
                          >
                            {player.full_name}
                          </Link>
                        ) : (
                          <span className="text-gray-400">No especificado</span>
                        )}
                      </span>
                    </div>

                    {event.notes ? (
                      <p className="mt-1.5 break-words text-xs text-gray-400">Notas: {event.notes}</p>
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
