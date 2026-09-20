export interface PredictionScore {
  homeScore: number;
  awayScore: number;
}

export interface MatchScoreResult {
  status: string;
  homeScore?: number | null;
  awayScore?: number | null;
}

export interface PredictionEvaluation {
  points: number | null;
  isExact: boolean;
  isOutcomeCorrect: boolean;
  isCompleted: boolean;
}

export interface UserPredictionRecord {
  userId: string;
  userName: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
}

export interface MatchForRanking {
  id: string;
  status: string;
  homeScore?: number | null;
  awayScore?: number | null;
}

export interface QuinielaLeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  totalPoints: number;
  exactHits: number;
  outcomeHits: number;
  predictionsCount: number;
}

export function calculatePredictionPoints(
  prediction: PredictionScore,
  match: MatchScoreResult
): PredictionEvaluation {
  if (match.status !== "completed" || match.homeScore == null || match.awayScore == null) {
    return {
      points: null,
      isExact: false,
      isOutcomeCorrect: false,
      isCompleted: false,
    };
  }

  const exact =
    prediction.homeScore === match.homeScore && prediction.awayScore === match.awayScore;

  if (exact) {
    return {
      points: 3,
      isExact: true,
      isOutcomeCorrect: true,
      isCompleted: true,
    };
  }

  const predDiff = prediction.homeScore - prediction.awayScore;
  const actualDiff = match.homeScore - match.awayScore;

  const outcomeCorrect =
    (predDiff > 0 && actualDiff > 0) ||
    (predDiff < 0 && actualDiff < 0) ||
    (predDiff === 0 && actualDiff === 0);

  return {
    points: outcomeCorrect ? 1 : 0,
    isExact: false,
    isOutcomeCorrect: outcomeCorrect,
    isCompleted: true,
  };
}

export function calculateQuinielaLeaderboard(
  predictions: UserPredictionRecord[],
  matches: MatchForRanking[]
): QuinielaLeaderboardEntry[] {
  const matchMap = new Map(matches.map((m) => [m.id, m]));

  const userStats = new Map<
    string,
    {
      userId: string;
      userName: string;
      totalPoints: number;
      exactHits: number;
      outcomeHits: number;
      predictionsCount: number;
    }
  >();

  for (const pred of predictions) {
    let stat = userStats.get(pred.userId);
    if (!stat) {
      stat = {
        userId: pred.userId,
        userName: pred.userName,
        totalPoints: 0,
        exactHits: 0,
        outcomeHits: 0,
        predictionsCount: 0,
      };
      userStats.set(pred.userId, stat);
    }

    stat.predictionsCount += 1;
    const match = matchMap.get(pred.matchId);
    if (match) {
      const evaluation = calculatePredictionPoints(
        { homeScore: pred.homeScore, awayScore: pred.awayScore },
        match
      );

      if (evaluation.points !== null) {
        stat.totalPoints += evaluation.points;
        if (evaluation.isExact) {
          stat.exactHits += 1;
        } else if (evaluation.isOutcomeCorrect) {
          stat.outcomeHits += 1;
        }
      }
    }
  }

  const entries = Array.from(userStats.values());

  // Sort by points desc, then exactHits desc, then outcomeHits desc
  entries.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.exactHits !== a.exactHits) return b.exactHits - a.exactHits;
    if (b.outcomeHits !== a.outcomeHits) return b.outcomeHits - a.outcomeHits;
    return a.userName.localeCompare(b.userName);
  });

  return entries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}
