import type { SupabaseClient } from "@supabase/supabase-js";

export type TopScorerItem = {
  playerId: string;
  playerName: string;
  playerPhoto: string | null;
  teamId: string | null;
  teamName: string;
  teamSlug: string;
  teamLogo: string | null;
  goals: number;
  penaltyGoals: number;
  totalGoals: number;
};

export type FairPlayTeamItem = {
  teamId: string;
  teamName: string;
  teamSlug: string;
  teamLogo: string | null;
  yellowCards: number;
  redCards: number;
  points: number;
};

export type FairPlayPlayerItem = {
  playerId: string;
  playerName: string;
  playerPhoto: string | null;
  teamName: string;
  yellowCards: number;
  redCards: number;
  points: number;
};

export type SeasonStatsResult = {
  topScorers: TopScorerItem[];
  fairPlayTeams: FairPlayTeamItem[];
  fairPlayPlayers: FairPlayPlayerItem[];
};

export async function getSeasonStats({
  supabase,
  leagueId,
  seasonId,
}: {
  supabase: SupabaseClient;
  leagueId: string;
  seasonId: string;
}): Promise<SeasonStatsResult> {
  // 1. Obtener partidos de la temporada
  const { data: matchesData, error: matchesError } = await supabase
    .from("matches")
    .select("id")
    .eq("league_id", leagueId)
    .eq("season_id", seasonId);

  if (matchesError || !matchesData || matchesData.length === 0) {
    return { topScorers: [], fairPlayTeams: [], fairPlayPlayers: [] };
  }

  const matchIds = matchesData.map((m) => m.id);

  // 2. Obtener eventos de los partidos de la temporada
  const { data: eventsData, error: eventsError } = await supabase
    .from("match_events")
    .select("id, match_id, team_id, player_id, event_type")
    .in("match_id", matchIds);

  if (eventsError || !eventsData || eventsData.length === 0) {
    return { topScorers: [], fairPlayTeams: [], fairPlayPlayers: [] };
  }

  // 3. Obtener equipos de la liga para resolver nombres, slugs y logos
  const { data: teamsData } = await supabase
    .from("teams")
    .select("id, name, slug, logo_url")
    .eq("league_id", leagueId);

  const teamMap = new Map<string, { id: string; name: string; slug: string; logo_url: string | null }>();
  for (const team of teamsData ?? []) {
    teamMap.set(team.id, team);
  }

  // 4. Identificar jugadores participantes en eventos para resolver sus datos
  const playerIds = [...new Set(eventsData.map((e) => e.player_id).filter(Boolean))] as string[];

  const playerMap = new Map<string, { id: string; full_name: string; photo_url: string | null }>();
  if (playerIds.length > 0) {
    const { data: playersData } = await supabase
      .from("players")
      .select("id, full_name, photo_url")
      .in("id", playerIds);

    for (const player of playersData ?? []) {
      playerMap.set(player.id, player);
    }
  }

  // 5. Agregación de Goleo
  const scorerMap = new Map<string, {
    playerId: string;
    playerName: string;
    playerPhoto: string | null;
    teamId: string | null;
    goals: number;
    penaltyGoals: number;
  }>();

  // 6. Agregación de Fair Play (Equipos y Jugadores)
  const teamCardsMap = new Map<string, { yellowCards: number; redCards: number }>();
  for (const team of teamsData ?? []) {
    teamCardsMap.set(team.id, { yellowCards: 0, redCards: 0 });
  }

  const playerCardsMap = new Map<string, {
    playerId: string;
    playerName: string;
    playerPhoto: string | null;
    teamName: string;
    yellowCards: number;
    redCards: number;
  }>();

  for (const event of eventsData) {
    const team = event.team_id ? teamMap.get(event.team_id) : null;
    const player = event.player_id ? playerMap.get(event.player_id) : null;

    // Goles
    if ((event.event_type === "goal" || event.event_type === "penalty_goal") && event.player_id) {
      const existing = scorerMap.get(event.player_id) ?? {
        playerId: event.player_id,
        playerName: player?.full_name ?? "Jugador desconocido",
        playerPhoto: player?.photo_url ?? null,
        teamId: event.team_id ?? null,
        goals: 0,
        penaltyGoals: 0,
      };

      if (event.event_type === "goal") {
        existing.goals += 1;
      } else if (event.event_type === "penalty_goal") {
        existing.penaltyGoals += 1;
      }

      if (event.team_id) {
        existing.teamId = event.team_id;
      }

      scorerMap.set(event.player_id, existing);
    }

    // Tarjetas por equipo
    if (event.team_id) {
      const teamCard = teamCardsMap.get(event.team_id) ?? { yellowCards: 0, redCards: 0 };
      if (event.event_type === "yellow_card") {
        teamCard.yellowCards += 1;
      } else if (event.event_type === "red_card") {
        teamCard.redCards += 1;
      }
      teamCardsMap.set(event.team_id, teamCard);
    }

    // Tarjetas por jugador
    if (event.player_id && (event.event_type === "yellow_card" || event.event_type === "red_card")) {
      const playerCard = playerCardsMap.get(event.player_id) ?? {
        playerId: event.player_id,
        playerName: player?.full_name ?? "Jugador desconocido",
        playerPhoto: player?.photo_url ?? null,
        teamName: team?.name ?? "Equipo sin asignar",
        yellowCards: 0,
        redCards: 0,
      };

      if (event.event_type === "yellow_card") {
        playerCard.yellowCards += 1;
      } else if (event.event_type === "red_card") {
        playerCard.redCards += 1;
      }

      playerCardsMap.set(event.player_id, playerCard);
    }
  }

  // Lista de Goleadores ordenada desc
  const topScorers: TopScorerItem[] = Array.from(scorerMap.values())
    .map((s) => {
      const team = s.teamId ? teamMap.get(s.teamId) : null;
      return {
        playerId: s.playerId,
        playerName: s.playerName,
        playerPhoto: s.playerPhoto,
        teamId: s.teamId,
        teamName: team?.name ?? "Sin equipo",
        teamSlug: team?.slug ?? "",
        teamLogo: team?.logo_url ?? null,
        goals: s.goals,
        penaltyGoals: s.penaltyGoals,
        totalGoals: s.goals + s.penaltyGoals,
      };
    })
    .sort((a, b) => {
      if (b.totalGoals !== a.totalGoals) return b.totalGoals - a.totalGoals;
      if (b.goals !== a.goals) return b.goals - a.goals; // Favorecer goles de campo sobre penales
      return a.playerName.localeCompare(b.playerName, "es");
    });

  // Lista Fair Play Equipos (menor puntaje = mejor juego limpio)
  // Puntos: Amarilla = 1, Roja = 3
  const fairPlayTeams: FairPlayTeamItem[] = Array.from(teamCardsMap.entries())
    .map(([teamId, cards]) => {
      const team = teamMap.get(teamId);
      const points = cards.yellowCards * 1 + cards.redCards * 3;
      return {
        teamId,
        teamName: team?.name ?? "Equipo desconocido",
        teamSlug: team?.slug ?? "",
        teamLogo: team?.logo_url ?? null,
        yellowCards: cards.yellowCards,
        redCards: cards.redCards,
        points,
      };
    })
    .sort((a, b) => {
      if (a.points !== b.points) return a.points - b.points;
      if (a.redCards !== b.redCards) return a.redCards - b.redCards;
      return a.teamName.localeCompare(b.teamName, "es");
    });

  // Lista Fair Play Jugadores (más amonestados arriba)
  const fairPlayPlayers: FairPlayPlayerItem[] = Array.from(playerCardsMap.values())
    .map((p) => ({
      playerId: p.playerId,
      playerName: p.playerName,
      playerPhoto: p.playerPhoto,
      teamName: p.teamName,
      yellowCards: p.yellowCards,
      redCards: p.redCards,
      points: p.yellowCards * 1 + p.redCards * 3,
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.redCards !== a.redCards) return b.redCards - a.redCards;
      return a.playerName.localeCompare(b.playerName, "es");
    });

  return {
    topScorers,
    fairPlayTeams,
    fairPlayPlayers,
  };
}
