import type { Match, MatchStage } from "@/types/database";

export type PlayoffTeam = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
};

export type PlayoffMatch = Match & {
  homeTeam: PlayoffTeam;
  awayTeam: PlayoffTeam;
};

export type PlayoffSeries = {
  id: string;
  stage: MatchStage;
  format: "single" | "two_legged";
  teamA: PlayoffTeam;
  teamB: PlayoffTeam;
  teamAScore: number;
  teamBScore: number;
  teamAPenalties: number | null;
  teamBPenalties: number | null;
  winnerId: string | null;
  isCompleted: boolean;
  matches: PlayoffMatch[];
};

export type PlayoffBracketData = {
  roundOf16: PlayoffSeries[];
  quarterFinals: PlayoffSeries[];
  semiFinals: PlayoffSeries[];
  thirdPlace: PlayoffSeries | null;
  final: PlayoffSeries | null;
  hasPlayoffs: boolean;
};

/**
 * Infiere o valida la etapa de liguilla de un partido (por stage o round_name).
 */
export function resolveMatchStage(match: Pick<Match, "stage" | "round_name">): MatchStage {
  if (match.stage && match.stage !== "regular_season") {
    return match.stage;
  }

  const round = (match.round_name ?? "").toLowerCase().trim();
  if (round.includes("octavo") || round.includes("16")) return "round_of_16";
  if (round.includes("cuarto")) return "quarter_finals";
  if (round.includes("semi")) return "semi_finals";
  if (round.includes("tercer") || round.includes("3er")) return "third_place";
  if (round.includes("final") && !round.includes("semi") && !round.includes("cuarto")) return "final";

  return "regular_season";
}

/**
 * Agrupa y calcula las series eliminatorias a partir de los partidos de playoffs.
 */
export function buildPlayoffBracket(matches: PlayoffMatch[]): PlayoffBracketData {
  const playoffMatches = matches.filter((m) => {
    const stage = resolveMatchStage(m);
    return stage !== "regular_season";
  });

  if (playoffMatches.length === 0) {
    return {
      roundOf16: [],
      quarterFinals: [],
      semiFinals: [],
      thirdPlace: null,
      final: null,
      hasPlayoffs: false,
    };
  }

  // Agrupar por series_id o crear llave única por par de equipos y etapa
  const seriesMap = new Map<string, PlayoffMatch[]>();

  for (const match of playoffMatches) {
    const stage = resolveMatchStage(match);
    // Si no tiene series_id explícito, agrupar por etapa y par de equipos ordenados
    const pairKey = [match.home_team_id, match.away_team_id].sort().join("-");
    const groupKey = match.series_id || `${stage}_${pairKey}`;

    const list = seriesMap.get(groupKey) ?? [];
    list.push(match);
    seriesMap.set(groupKey, list);
  }

  const allSeries: PlayoffSeries[] = [];

  for (const [key, seriesMatches] of seriesMap.entries()) {
    // Ordenar partidos de la serie por fecha programada o leg
    seriesMatches.sort((a, b) => {
      if (a.leg === "first_leg") return -1;
      if (b.leg === "first_leg") return 1;
      return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
    });

    const firstMatch = seriesMatches[0];
    const stage = resolveMatchStage(firstMatch);
    const isTwoLegged = seriesMatches.length > 1 || firstMatch.leg === "first_leg";

    // Designar Equipo A (local en el primer partido) y Equipo B (visitante en el primer partido)
    const teamA = firstMatch.homeTeam;
    const teamB = firstMatch.awayTeam;

    let teamAScore = 0;
    let teamBScore = 0;
    let teamAPenalties: number | null = null;
    let teamBPenalties: number | null = null;
    let isCompleted = true;

    for (const m of seriesMatches) {
      if (m.status !== "completed") {
        isCompleted = false;
      }

      if (m.home_team_id === teamA.id) {
        teamAScore += m.home_score;
        teamBScore += m.away_score;
        if (m.home_penalty_score !== undefined && m.home_penalty_score !== null) {
          teamAPenalties = m.home_penalty_score;
          teamBPenalties = m.away_penalty_score ?? 0;
        }
      } else {
        teamAScore += m.away_score;
        teamBScore += m.home_score;
        if (m.away_penalty_score !== undefined && m.away_penalty_score !== null) {
          teamAPenalties = m.away_penalty_score;
          teamBPenalties = m.home_penalty_score ?? 0;
        }
      }
    }

    // Determinar ganador si la serie concluyó
    let winnerId: string | null = null;
    if (isCompleted) {
      if (teamAScore > teamBScore) {
        winnerId = teamA.id;
      } else if (teamBScore > teamAScore) {
        winnerId = teamB.id;
      } else if (teamAPenalties !== null && teamBPenalties !== null) {
        if (teamAPenalties > teamBPenalties) winnerId = teamA.id;
        else if (teamBPenalties > teamAPenalties) winnerId = teamB.id;
      }
    }

    allSeries.push({
      id: key,
      stage,
      format: isTwoLegged ? "two_legged" : "single",
      teamA,
      teamB,
      teamAScore,
      teamBScore,
      teamAPenalties,
      teamBPenalties,
      winnerId,
      isCompleted,
      matches: seriesMatches,
    });
  }

  const roundOf16 = allSeries.filter((s) => s.stage === "round_of_16");
  const quarterFinals = allSeries.filter((s) => s.stage === "quarter_finals");
  const semiFinals = allSeries.filter((s) => s.stage === "semi_finals");
  const thirdPlace = allSeries.find((s) => s.stage === "third_place") ?? null;
  const final = allSeries.find((s) => s.stage === "final") ?? null;

  return {
    roundOf16,
    quarterFinals,
    semiFinals,
    thirdPlace,
    final,
    hasPlayoffs: allSeries.length > 0,
  };
}
