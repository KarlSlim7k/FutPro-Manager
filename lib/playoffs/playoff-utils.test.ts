import { describe, it, expect } from "vitest";
import { resolveMatchStage, buildPlayoffBracket, type PlayoffMatch } from "./playoff-utils";

describe("playoff-utils", () => {
  describe("resolveMatchStage", () => {
    it("preserves explicit stage when present and not regular_season", () => {
      expect(resolveMatchStage({ stage: "final", round_name: null })).toBe("final");
      expect(resolveMatchStage({ stage: "semi_finals", round_name: "Partido 1" })).toBe("semi_finals");
    });

    it("infers stage from round_name when stage is not set", () => {
      expect(resolveMatchStage({ stage: null, round_name: "Cuartos de Final (Ida)" })).toBe("quarter_finals");
      expect(resolveMatchStage({ stage: null, round_name: "Semifinales Vuelta" })).toBe("semi_finals");
      expect(resolveMatchStage({ stage: null, round_name: "Gran Final" })).toBe("final");
      expect(resolveMatchStage({ stage: null, round_name: "Tercer Lugar" })).toBe("third_place");
      expect(resolveMatchStage({ stage: null, round_name: "Octavos de final" })).toBe("round_of_16");
      expect(resolveMatchStage({ stage: null, round_name: "Jornada 12" })).toBe("regular_season");
    });
  });

  describe("buildPlayoffBracket", () => {
    const team1 = { id: "t1", name: "Chivas", slug: "chivas", logo_url: null };
    const team2 = { id: "t2", name: "America", slug: "america", logo_url: null };

    it("handles single-match series with winner", () => {
      const match: PlayoffMatch = {
        id: "m1",
        league_id: "l1",
        season_id: "s1",
        home_team_id: "t1",
        away_team_id: "t2",
        venue_id: null,
        referee_id: null,
        scheduled_at: "2026-05-20T10:00:00Z",
        status: "completed",
        home_score: 3,
        away_score: 1,
        round_name: "Final",
        stage: "final",
        leg: "single",
        created_at: "",
        updated_at: "",
        homeTeam: team1,
        awayTeam: team2,
      };

      const bracket = buildPlayoffBracket([match]);
      expect(bracket.hasPlayoffs).toBe(true);
      expect(bracket.final).not.toBeNull();
      expect(bracket.final?.format).toBe("single");
      expect(bracket.final?.teamAScore).toBe(3);
      expect(bracket.final?.teamBScore).toBe(1);
      expect(bracket.final?.winnerId).toBe("t1");
    });

    it("handles single-match series tied in regular time and decided by penalties", () => {
      const match: PlayoffMatch = {
        id: "m1",
        league_id: "l1",
        season_id: "s1",
        home_team_id: "t1",
        away_team_id: "t2",
        venue_id: null,
        referee_id: null,
        scheduled_at: "2026-05-20T10:00:00Z",
        status: "completed",
        home_score: 2,
        away_score: 2,
        home_penalty_score: 4,
        away_penalty_score: 5,
        round_name: "Final",
        stage: "final",
        leg: "single",
        created_at: "",
        updated_at: "",
        homeTeam: team1,
        awayTeam: team2,
      };

      const bracket = buildPlayoffBracket([match]);
      expect(bracket.final?.teamAScore).toBe(2);
      expect(bracket.final?.teamBScore).toBe(2);
      expect(bracket.final?.teamAPenalties).toBe(4);
      expect(bracket.final?.teamBPenalties).toBe(5);
      expect(bracket.final?.winnerId).toBe("t2");
    });

    it("calculates aggregate scores for two-legged series (Ida y Vuelta)", () => {
      const leg1: PlayoffMatch = {
        id: "m-leg-1",
        league_id: "l1",
        season_id: "s1",
        home_team_id: "t1",
        away_team_id: "t2",
        venue_id: null,
        referee_id: null,
        scheduled_at: "2026-05-18T10:00:00Z",
        status: "completed",
        home_score: 2,
        away_score: 0,
        round_name: "Semifinal Ida",
        stage: "semi_finals",
        leg: "first_leg",
        series_id: "semi-1",
        created_at: "",
        updated_at: "",
        homeTeam: team1,
        awayTeam: team2,
      };

      const leg2: PlayoffMatch = {
        id: "m-leg-2",
        league_id: "l1",
        season_id: "s1",
        home_team_id: "t2",
        away_team_id: "t1",
        venue_id: null,
        referee_id: null,
        scheduled_at: "2026-05-21T10:00:00Z",
        status: "completed",
        home_score: 1,
        away_score: 1,
        round_name: "Semifinal Vuelta",
        stage: "semi_finals",
        leg: "second_leg",
        series_id: "semi-1",
        created_at: "",
        updated_at: "",
        homeTeam: team2,
        awayTeam: team1,
      };

      const bracket = buildPlayoffBracket([leg1, leg2]);
      expect(bracket.semiFinals).toHaveLength(1);
      const semi = bracket.semiFinals[0];
      expect(semi.format).toBe("two_legged");
      // Team 1 had 2 goals at home (leg 1) + 1 goal away (leg 2) = 3 goals
      // Team 2 had 0 goals away (leg 1) + 1 goal at home (leg 2) = 1 goal
      expect(semi.teamAScore).toBe(3);
      expect(semi.teamBScore).toBe(1);
      expect(semi.winnerId).toBe("t1");
      expect(semi.isCompleted).toBe(true);
    });

    it("returns hasPlayoffs false when only regular season matches exist", () => {
      const match: PlayoffMatch = {
        id: "m-reg",
        league_id: "l1",
        season_id: "s1",
        home_team_id: "t1",
        away_team_id: "t2",
        venue_id: null,
        referee_id: null,
        scheduled_at: "2026-05-10T10:00:00Z",
        status: "completed",
        home_score: 1,
        away_score: 0,
        round_name: "Jornada 1",
        stage: "regular_season",
        leg: "single",
        created_at: "",
        updated_at: "",
        homeTeam: team1,
        awayTeam: team2,
      };

      const bracket = buildPlayoffBracket([match]);
      expect(bracket.hasPlayoffs).toBe(false);
      expect(bracket.quarterFinals).toEqual([]);
    });
  });
});
