import { describe, it, expect, vi } from "vitest";
import { getSeasonTopScorer } from "./get-season-top-scorer";
import type { SupabaseClient } from "@supabase/supabase-js";

function createMockSupabaseTopScorer({
  matches = [] as { id: string }[],
  matchesError = null as unknown,
  events = [] as { player_id: string | null; team_id: string | null; event_type: string }[],
  eventsError = null as unknown,
  players = [] as { id: string; full_name: string; photo_url: string | null }[],
  teams = [] as { id: string; name: string; slug: string; logo_url: string | null }[],
} = {}) {
  return {
    from: vi.fn((table: string) => {
      if (table === "matches") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: matchesError ? null : matches,
                error: matchesError,
              }),
            }),
          }),
        };
      }
      if (table === "match_events") {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                not: vi.fn().mockResolvedValue({
                  data: eventsError ? null : events,
                  error: eventsError,
                }),
              }),
            }),
          }),
        };
      }
      if (table === "players") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockImplementation(async () => {
                return { data: players[0] ?? null, error: null };
              }),
            }),
          }),
        };
      }
      if (table === "teams") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockImplementation(async () => {
                return { data: teams[0] ?? null, error: null };
              }),
            }),
          }),
        };
      }
      return {};
    }),
  } as unknown as SupabaseClient;
}

describe("getSeasonTopScorer", () => {
  it("returns null if matches are empty", async () => {
    const supabase = createMockSupabaseTopScorer({ matches: [] });
    const result = await getSeasonTopScorer({ supabase, leagueId: "l1", seasonId: "s1" });
    expect(result).toBeNull();
  });

  it("returns null if there are no goal events", async () => {
    const supabase = createMockSupabaseTopScorer({
      matches: [{ id: "m1" }],
      events: [],
    });
    const result = await getSeasonTopScorer({ supabase, leagueId: "l1", seasonId: "s1" });
    expect(result).toBeNull();
  });

  it("returns top scorer correctly", async () => {
    const matches = [{ id: "m1" }, { id: "m2" }];
    const events = [
      { player_id: "p1", team_id: "t1", event_type: "goal" },
      { player_id: "p2", team_id: "t2", event_type: "goal" },
      { player_id: "p1", team_id: "t1", event_type: "goal" },
      { player_id: "p1", team_id: "t1", event_type: "penalty_goal" },
    ];
    const players = [{ id: "p1", full_name: "Goleador Estrella", photo_url: "/foto.jpg" }];
    const teams = [{ id: "t1", name: "Campeones FC", slug: "campeones-fc", logo_url: "/logo.jpg" }];

    const supabase = createMockSupabaseTopScorer({ matches, events, players, teams });
    const result = await getSeasonTopScorer({ supabase, leagueId: "l1", seasonId: "s1" });

    expect(result).not.toBeNull();
    expect(result?.playerId).toBe("p1");
    expect(result?.playerName).toBe("Goleador Estrella");
    expect(result?.teamName).toBe("Campeones FC");
    expect(result?.goals).toBe(2);
    expect(result?.penaltyGoals).toBe(1);
    expect(result?.totalGoals).toBe(3);
  });
});
