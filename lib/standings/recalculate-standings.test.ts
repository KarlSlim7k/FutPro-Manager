import { describe, it, expect, vi } from "vitest";
import { recalculateStandingsForSeason } from "./recalculate-standings";
import type { SupabaseClient } from "@supabase/supabase-js";

function createMockSupabaseStandings({
  teams = [] as { id: string }[],
  teamsError = null as unknown,
  matches = [] as { home_team_id: string; away_team_id: string; home_score: number; away_score: number }[],
  matchesError = null as unknown,
  upsertError = null as unknown,
} = {}) {
  const upsertSpy = vi.fn().mockResolvedValue({ error: upsertError });

  const client = {
    from: vi.fn((table: string) => {
      if (table === "teams") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              neq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: teamsError ? null : teams,
                  error: teamsError,
                }),
              }),
            }),
          }),
        };
      }
      if (table === "matches") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  data: matchesError ? null : matches,
                  error: matchesError,
                }),
              }),
            }),
          }),
        };
      }
      if (table === "standings") {
        return {
          upsert: upsertSpy,
        };
      }
      return {};
    }),
    _upsertSpy: upsertSpy,
  } as unknown as SupabaseClient & { _upsertSpy: ReturnType<typeof vi.fn> };

  return client;
}

describe("recalculateStandingsForSeason", () => {
  it("returns an error if no teams are found", async () => {
    const supabase = createMockSupabaseStandings({ teams: [] });
    const result = await recalculateStandingsForSeason({
      supabase,
      leagueId: "l1",
      seasonId: "s1",
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("NO_TEAMS");
  });

  it("calculates standings accurately for wins, draws, losses and goal differences", async () => {
    const teams = [{ id: "team-a" }, { id: "team-b" }, { id: "team-c" }];
    const matches = [
      // team-a wins against team-b (3 - 1)
      { home_team_id: "team-a", away_team_id: "team-b", home_score: 3, away_score: 1 },
      // team-b draws with team-c (2 - 2)
      { home_team_id: "team-b", away_team_id: "team-c", home_score: 2, away_score: 2 },
    ];

    const supabase = createMockSupabaseStandings({ teams, matches });
    const result = await recalculateStandingsForSeason({
      supabase,
      leagueId: "l1",
      seasonId: "s1",
    });

    expect(result.success).toBe(true);
    expect(result.teamsCount).toBe(3);
    expect(result.matchesCount).toBe(2);
    expect(result.skippedMatchesCount).toBe(0);

    const teamARow = result.standingsRows.find((r) => r.teamId === "team-a");
    const teamBRow = result.standingsRows.find((r) => r.teamId === "team-b");
    const teamCRow = result.standingsRows.find((r) => r.teamId === "team-c");

    // Team A: 1 played, 1 won, 0 drawn, 0 lost, GF: 3, GA: 1, GD: +2, PTS: 3
    expect(teamARow).toEqual({
      teamId: "team-a",
      played: 1,
      won: 1,
      drawn: 0,
      lost: 0,
      goalsFor: 3,
      goalsAgainst: 1,
      goalDifference: 2,
      points: 3,
    });

    // Team B: 2 played, 0 won, 1 drawn, 1 lost, GF: 3, GA: 5, GD: -2, PTS: 1
    expect(teamBRow).toEqual({
      teamId: "team-b",
      played: 2,
      won: 0,
      drawn: 1,
      lost: 1,
      goalsFor: 3,
      goalsAgainst: 5,
      goalDifference: -2,
      points: 1,
    });

    // Team C: 1 played, 0 won, 1 drawn, 0 lost, GF: 2, GA: 2, GD: 0, PTS: 1
    expect(teamCRow).toEqual({
      teamId: "team-c",
      played: 1,
      won: 0,
      drawn: 1,
      lost: 0,
      goalsFor: 2,
      goalsAgainst: 2,
      goalDifference: 0,
      points: 1,
    });

    expect(supabase._upsertSpy).toHaveBeenCalledTimes(1);
  });

  it("skips matches that involve unknown teams and counts them in skippedMatchesCount", async () => {
    const teams = [{ id: "team-a" }, { id: "team-b" }];
    const matches = [
      { home_team_id: "team-a", away_team_id: "unknown-team", home_score: 2, away_score: 0 },
    ];

    const supabase = createMockSupabaseStandings({ teams, matches });
    const result = await recalculateStandingsForSeason({
      supabase,
      leagueId: "l1",
      seasonId: "s1",
    });

    expect(result.success).toBe(true);
    expect(result.skippedMatchesCount).toBe(1);

    const teamARow = result.standingsRows.find((r) => r.teamId === "team-a");
    expect(teamARow?.played).toBe(0);
  });
});
