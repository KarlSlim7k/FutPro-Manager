import { MatchEventTypeBadge } from "@/components/matches/match-event-type-badge";
import { DeleteMatchEventButton } from "./delete-match-event-button";
import type { MatchEvent } from "@/types/database";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

interface MatchEventCardProps {
  event: MatchEvent;
  teamName: string | null;
  playerName: string | null;
  canDelete?: boolean;
  leagueSlug?: string;
  matchId?: string;
}

export function MatchEventCard({
  event,
  teamName,
  playerName,
  canDelete = false,
  leagueSlug,
  matchId,
}: MatchEventCardProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700">
          {event.minute}&apos;
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <MatchEventTypeBadge type={event.event_type} />
            <span className="break-words text-xs font-medium text-gray-600">{teamName ?? "Equipo no disponible"}</span>
          </div>
          <p className="mt-1 break-words text-sm font-medium text-gray-900">{playerName ?? "Jugador no disponible"}</p>
          {event.notes ? (
            <p className="mt-1 break-words text-sm text-gray-600">{event.notes}</p>
          ) : null}
          <p className="mt-2 text-xs text-gray-500">Registrado: {formatDateTime(event.created_at)}</p>
        </div>
      </div>

      {canDelete && leagueSlug && matchId ? (
        <DeleteMatchEventButton
          leagueSlug={leagueSlug}
          matchId={matchId}
          eventId={event.id}
        />
      ) : null}
    </div>
  );
}
