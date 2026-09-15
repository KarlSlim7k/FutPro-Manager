import type { PlayerStatus, MatchEvent } from "@/types/database";

export interface PlayerEligibilityCheck {
  playerId: string;
  fullName: string;
  status: PlayerStatus;
}

export interface PlayerEligibilityResult {
  isEligible: boolean;
  status: PlayerStatus;
  reason?: string;
  warning?: string;
  yellowCardCount: number;
  hasRedCardSuspension: boolean;
}

export function checkPlayerEligibility({
  player,
  seasonEvents = [],
  currentMatchId,
}: {
  player: PlayerEligibilityCheck;
  seasonEvents?: Array<Pick<MatchEvent, "id" | "match_id" | "player_id" | "event_type" | "created_at">>;
  currentMatchId?: string;
}): PlayerEligibilityResult {
  // 1. Validaciones por estado administrativo directo
  if (player.status === "suspended") {
    return {
      isEligible: false,
      status: player.status,
      reason: "Jugador suspendido administrativamente.",
      yellowCardCount: 0,
      hasRedCardSuspension: false,
    };
  }

  if (player.status === "injured") {
    return {
      isEligible: false,
      status: player.status,
      reason: "Jugador no disponible por lesión.",
      yellowCardCount: 0,
      hasRedCardSuspension: false,
    };
  }

  if (player.status === "retired" || player.status === "inactive") {
    return {
      isEligible: false,
      status: player.status,
      reason: `Jugador ${player.status === "retired" ? "retirado" : "inactivo"}.`,
      yellowCardCount: 0,
      hasRedCardSuspension: false,
    };
  }

  // 2. Filtro de eventos del jugador en otros partidos de la temporada
  const playerEvents = seasonEvents
    .filter((e) => e.player_id === player.playerId && (!currentMatchId || e.match_id !== currentMatchId))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const yellowCards = playerEvents.filter((e) => e.event_type === "yellow_card");

  // Si el evento más reciente de tarjeta fue una roja, aplica suspensión inmediata
  const lastCard = playerEvents.find((e) => e.event_type === "red_card" || e.event_type === "yellow_card");
  const hasRedCardSuspension = lastCard?.event_type === "red_card";

  if (hasRedCardSuspension) {
    return {
      isEligible: false,
      status: "suspended",
      reason: "Sanción activa por tarjeta roja directa o expulsión en el encuentro anterior.",
      yellowCardCount: yellowCards.length,
      hasRedCardSuspension: true,
    };
  }

  // Si acumula 3 o 5 amarillas sin cumplir sanción
  const yellowCardCount = yellowCards.length;
  if (yellowCardCount > 0 && yellowCardCount % 3 === 0) {
    return {
      isEligible: false,
      status: "suspended",
      reason: `Sanción por acumulación de ${yellowCardCount} tarjetas amarillas en el torneo.`,
      yellowCardCount,
      hasRedCardSuspension: false,
    };
  }

  // Advertencia de prevención (si está a una amarilla de suspensión)
  let warning: string | undefined;
  if ((yellowCardCount + 1) % 3 === 0) {
    warning = `Precaución: El jugador tiene ${yellowCardCount} amarillas acumuladas y está al límite de suspensión.`;
  }

  return {
    isEligible: true,
    status: player.status,
    warning,
    yellowCardCount,
    hasRedCardSuspension: false,
  };
}
