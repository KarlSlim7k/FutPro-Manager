import { describe, it, expect } from "vitest";
import {
  calculatePredictionPoints,
  calculateQuinielaLeaderboard,
  type UserPredictionRecord,
  type MatchForRanking,
} from "./quiniela-engine";

describe("quiniela-engine", () => {
  describe("calculatePredictionPoints", () => {
    it("returns null points when match is not completed", () => {
      const result = calculatePredictionPoints(
        { homeScore: 2, awayScore: 1 },
        { status: "scheduled", homeScore: 0, awayScore: 0 }
      );
      expect(result.points).toBeNull();
      expect(result.isCompleted).toBe(false);
    });

    it("awards 3 points for exact score", () => {
      const result = calculatePredictionPoints(
        { homeScore: 2, awayScore: 1 },
        { status: "completed", homeScore: 2, awayScore: 1 }
      );
      expect(result.points).toBe(3);
      expect(result.isExact).toBe(true);
      expect(result.isOutcomeCorrect).toBe(true);
    });

    it("awards 1 point for correct winner but non-exact score", () => {
      const result = calculatePredictionPoints(
        { homeScore: 3, awayScore: 0 },
        { status: "completed", homeScore: 2, awayScore: 1 }
      );
      expect(result.points).toBe(1);
      expect(result.isExact).toBe(false);
      expect(result.isOutcomeCorrect).toBe(true);
    });

    it("awards 1 point for correct draw prediction with different scores", () => {
      const result = calculatePredictionPoints(
        { homeScore: 1, awayScore: 1 },
        { status: "completed", homeScore: 2, awayScore: 2 }
      );
      expect(result.points).toBe(1);
      expect(result.isExact).toBe(false);
      expect(result.isOutcomeCorrect).toBe(true);
    });

    it("awards 0 points when winner/outcome is wrong", () => {
      const result = calculatePredictionPoints(
        { homeScore: 2, awayScore: 0 },
        { status: "completed", homeScore: 1, awayScore: 3 }
      );
      expect(result.points).toBe(0);
      expect(result.isExact).toBe(false);
      expect(result.isOutcomeCorrect).toBe(false);
    });
  });

  describe("calculateQuinielaLeaderboard", () => {
    it("ranks users correctly based on points and exact hits", () => {
      const matches: MatchForRanking[] = [
        { id: "m1", status: "completed", homeScore: 2, awayScore: 1 },
        { id: "m2", status: "completed", homeScore: 1, awayScore: 1 },
      ];

      const predictions: UserPredictionRecord[] = [
        // User A: exact on m1 (3 pts) + outcome on m2 (1 pt) = 4 pts
        { userId: "u1", userName: "Juan", matchId: "m1", homeScore: 2, awayScore: 1 },
        { userId: "u1", userName: "Juan", matchId: "m2", homeScore: 0, awayScore: 0 },

        // User B: exact on m1 (3 pts) + exact on m2 (3 pts) = 6 pts
        { userId: "u2", userName: "Maria", matchId: "m1", homeScore: 2, awayScore: 1 },
        { userId: "u2", userName: "Maria", matchId: "m2", homeScore: 1, awayScore: 1 },

        // User C: wrong on both = 0 pts
        { userId: "u3", userName: "Pedro", matchId: "m1", homeScore: 0, awayScore: 2 },
        { userId: "u3", userName: "Pedro", matchId: "m2", homeScore: 3, awayScore: 1 },
      ];

      const leaderboard = calculateQuinielaLeaderboard(predictions, matches);

      expect(leaderboard).toHaveLength(3);
      expect(leaderboard[0].userName).toBe("Maria");
      expect(leaderboard[0].totalPoints).toBe(6);
      expect(leaderboard[0].exactHits).toBe(2);
      expect(leaderboard[0].rank).toBe(1);

      expect(leaderboard[1].userName).toBe("Juan");
      expect(leaderboard[1].totalPoints).toBe(4);
      expect(leaderboard[1].rank).toBe(2);

      expect(leaderboard[2].userName).toBe("Pedro");
      expect(leaderboard[2].totalPoints).toBe(0);
      expect(leaderboard[2].rank).toBe(3);
    });
  });
});
