import type { SupabaseClient } from "@supabase/supabase-js";
import type { TopScorerItem } from "./get-season-stats";

/**
 * Consulta optimizada para obtener exclusivamente al líder de goleo individual (top 1).
 * Evita transferir todas las tarjetas, fair-play, lista global de equipos y lista global
 * de jugadores que getSeasonStats realiza.
 */
export async function getSeasonTopScorer({
  supabase,
  leagueId,
  seasonId,
}: {
  supabase: SupabaseClient;
  leagueId: string;
  seasonId: string;
}): Promise<TopScorerItem | null> {
  // 1. Obtener partidos de la temporada
  const { data: matchesData, error: matchesError } = await supabase
    .from("matches")
    .select("id")
    .eq("league_id", leagueId)
    .eq("season_id", seasonId);

  if (matchesError || !matchesData || matchesData.length === 0) {
    return null;
  }

  const matchIds = matchesData.map((m) => m.id);

  // 2. Solo consultar eventos de gol (usa idx_match_events_match_id)
  const { data: eventsData, error: eventsError } = await supabase
    .from("match_events")
    .select("player_id, team_id, event_type")
    .in("match_id", matchIds)
    .in("event_type", ["goal", "penalty_goal"])
    .not("player_id", "is", null);

  if (eventsError || !eventsData || eventsData.length === 0) {
    return null;
  }

  // 3. Contabilizar goles por jugador
  const scorerMap = new Map<
    string,
    {
      playerId: string;
      teamId: string | null;
      goals: number;
      penaltyGoals: number;
      totalGoals: number;
    }
  >();

  for (const event of eventsData) {
    if (!event.player_id) continue;
    const existing = scorerMap.get(event.player_id) ?? {
      playerId: event.player_id,
      teamId: event.team_id ?? null,
      goals: 0,
      penaltyGoals: 0,
      totalGoals: 0,
    };

    if (event.event_type === "goal") {
      existing.goals += 1;
    } else if (event.event_type === "penalty_goal") {
      existing.penaltyGoals += 1;
    }
    existing.totalGoals = existing.goals + existing.penaltyGoals;
    if (event.team_id) {
      existing.teamId = event.team_id;
    }
    scorerMap.set(event.player_id, existing);
  }

  // 4. Ordenar y seleccionar únicamente el primer goleador (top 1)
  const sorted = [...scorerMap.values()].sort((a, b) => {
    if (b.totalGoals !== a.totalGoals) return b.totalGoals - a.totalGoals;
    return a.penaltyGoals - b.penaltyGoals;
  });

  const best = sorted[0];
  if (!best || best.totalGoals === 0) {
    return null;
  }

  // 5. Consultar dirigida y puntualmente solo los datos del jugador y su equipo
  const [playerRes, teamRes] = await Promise.all([
    supabase
      .from("players")
      .select("id, full_name, photo_url")
      .eq("id", best.playerId)
      .maybeSingle(),
    best.teamId
      ? supabase
          .from("teams")
          .select("id, name, slug, logo_url")
          .eq("id", best.teamId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const player = playerRes.data;
  const team = teamRes.data;

  return {
    playerId: best.playerId,
    playerName: player?.full_name ?? "Jugador desconocido",
    playerPhoto: player?.photo_url ?? null,
    teamId: best.teamId,
    teamName: team?.name ?? "Sin equipo",
    teamSlug: team?.slug ?? "",
    teamLogo: team?.logo_url ?? null,
    goals: best.goals,
    penaltyGoals: best.penaltyGoals,
    totalGoals: best.totalGoals,
  };
}
