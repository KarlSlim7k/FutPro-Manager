import { describe, it, expect, vi } from "vitest";
import { getSeasonStats } from "./get-season-stats";
import type { SupabaseClient } from "@supabase/supabase-js";

function createMockSupabaseStats({
  matches = [] as { id: string }[],
  matchesError = null as unknown,
  events = [] as { id: string; match_id: string; team_id: string | null; player_id: string | null; event_type: string }[],
  eventsError = null as unknown,
  teams = [] as { id: string; name: string; slug: string; logo_url: string | null }[],
  players = [] as { id: string; full_name: string; photo_url: string | null }[],
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
            in: vi.fn().mockResolvedValue({
              data: eventsError ? null : events,
              error: eventsError,
            }),
          }),
        };
      }
      if (table === "teams") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: teams,
              error: null,
            }),
          }),
        };
      }
      if (table === "players") {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({
              data: players,
              error: null,
            }),
          }),
        };
      }
      return {};
    }),
  } as unknown as SupabaseClient;
}

describe("getSeasonStats", () => {
  it("returns empty arrays if matches are empty or fail", async () => {
    const supabase = createMockSupabaseStats({ matches: [] });
    const stats = await getSeasonStats({ supabase, leagueId: "l1", seasonId: "s1" });

    expect(stats.topScorers).toEqual([]);
    expect(stats.fairPlayTeams).toEqual([]);
    expect(stats.fairPlayPlayers).toEqual([]);
  });

  it("calculates top scorers correctly with penalty breakdown and ranking", async () => {
    const matches = [{ id: "m1" }, { id: "m2" }];
    const teams = [
      { id: "t1", name: "Águilas FC", slug: "aguilas-fc", logo_url: null },
      { id: "t2", name: "Tiburones", slug: "tiburones", logo_url: null },
    ];
    const players = [
      { id: "p1", full_name: "Carlos Gol", photo_url: null },
      { id: "p2", full_name: "Roberto Penal", photo_url: null },
      { id: "p3", full_name: "Pedro Pichichi", photo_url: null },
    ];
    const events = [
      // p1 scores 2 regular goals
      { id: "e1", match_id: "m1", team_id: "t1", player_id: "p1", event_type: "goal" },
      { id: "e2", match_id: "m1", team_id: "t1", player_id: "p1", event_type: "goal" },
      // p2 scores 2 goals (1 regular, 1 penalty) - total 2
      { id: "e3", match_id: "m2", team_id: "t2", player_id: "p2", event_type: "goal" },
      { id: "e4", match_id: "m2", team_id: "t2", player_id: "p2", event_type: "penalty_goal" },
      // p3 scores 3 goals
      { id: "e5", match_id: "m1", team_id: "t1", player_id: "p3", event_type: "goal" },
      { id: "e6", match_id: "m2", team_id: "t1", player_id: "p3", event_type: "goal" },
      { id: "e7", match_id: "m2", team_id: "t1", player_id: "p3", event_type: "goal" },
    ];

    const supabase = createMockSupabaseStats({ matches, teams, players, events });
    const stats = await getSeasonStats({ supabase, leagueId: "l1", seasonId: "s1" });

    // p3 should be first (3 goals)
    expect(stats.topScorers[0].playerName).toBe("Pedro Pichichi");
    expect(stats.topScorers[0].totalGoals).toBe(3);

    // p1 has 2 regular goals, p2 has 1 regular + 1 penalty.
    // p1 should rank higher than p2 because p1 has more regular goals
    expect(stats.topScorers[1].playerName).toBe("Carlos Gol");
    expect(stats.topScorers[1].goals).toBe(2);
    expect(stats.topScorers[1].penaltyGoals).toBe(0);

    expect(stats.topScorers[2].playerName).toBe("Roberto Penal");
    expect(stats.topScorers[2].goals).toBe(1);
    expect(stats.topScorers[2].penaltyGoals).toBe(1);
  });

  it("calculates Fair Play for teams and players accurately", async () => {
    const matches = [{ id: "m1" }];
    const teams = [
      { id: "t1", name: "Equipo Disciplinado", slug: "equipo-disciplinado", logo_url: null },
      { id: "t2", name: "Equipo Fuerte", slug: "equipo-fuerte", logo_url: null },
    ];
    const players = [
      { id: "p1", full_name: "Jugador Amonestado", photo_url: null },
      { id: "p2", full_name: "Jugador Expulsado", photo_url: null },
    ];
    const events = [
      // 1 yellow card for p1 (t1) -> 1 pt
      { id: "e1", match_id: "m1", team_id: "t1", player_id: "p1", event_type: "yellow_card" },
      // 1 red card for p2 (t2) -> 3 pts
      { id: "e2", match_id: "m1", team_id: "t2", player_id: "p2", event_type: "red_card" },
    ];

    const supabase = createMockSupabaseStats({ matches, teams, players, events });
    const stats = await getSeasonStats({ supabase, leagueId: "l1", seasonId: "s1" });

    // Team fair play: lowest points first
    expect(stats.fairPlayTeams[0].teamName).toBe("Equipo Disciplinado");
    expect(stats.fairPlayTeams[0].points).toBe(1);
    expect(stats.fairPlayTeams[0].yellowCards).toBe(1);

    expect(stats.fairPlayTeams[1].teamName).toBe("Equipo Fuerte");
    expect(stats.fairPlayTeams[1].points).toBe(3);
    expect(stats.fairPlayTeams[1].redCards).toBe(1);

    // Player fair play: most points first
    expect(stats.fairPlayPlayers[0].playerName).toBe("Jugador Expulsado");
    expect(stats.fairPlayPlayers[0].points).toBe(3);
  });

  it("calculates top assists, clean sheets, and overview metrics correctly", async () => {
    const matches = [
      { id: "m1", status: "completed", home_team_id: "t1", away_team_id: "t2", home_score: 2, away_score: 0 },
      { id: "m2", status: "completed", home_team_id: "t2", away_team_id: "t1", home_score: 1, away_score: 1 },
      { id: "m3", status: "scheduled", home_team_id: "t1", away_team_id: "t2", home_score: null, away_score: null },
    ];
    const teams = [
      { id: "t1", name: "Muralla FC", slug: "muralla-fc", logo_url: null },
      { id: "t2", name: "Ataque Total", slug: "ataque-total", logo_url: null },
    ];
    const players = [
      { id: "p1", full_name: "Andrés Asistencias", photo_url: null },
      { id: "p2", full_name: "Bruno Pase", photo_url: null },
    ];
    const events = [
      { id: "e1", match_id: "m1", team_id: "t1", player_id: "p1", event_type: "assist" },
      { id: "e2", match_id: "m1", team_id: "t1", player_id: "p1", event_type: "assist" },
      { id: "e3", match_id: "m2", team_id: "t2", player_id: "p2", event_type: "assist" },
      { id: "e4", match_id: "m1", team_id: "t1", player_id: "p1", event_type: "yellow_card" },
    ];

    const supabase = createMockSupabaseStats({
      matches: matches as unknown as { id: string }[],
      teams,
      players,
      events,
    });
    const stats = await getSeasonStats({ supabase, leagueId: "l1", seasonId: "s1" });

    // Assists
    expect(stats.topAssists.length).toBe(2);
    expect(stats.topAssists[0].playerName).toBe("Andrés Asistencias");
    expect(stats.topAssists[0].assists).toBe(2);
    expect(stats.topAssists[1].playerName).toBe("Bruno Pase");
    expect(stats.topAssists[1].assists).toBe(1);

    // Clean sheets:
    // in m1: t1 won 2-0 against t2 -> t1 clean sheet (away_score 0)
    // in m2: 1-1 -> neither has clean sheet
    // t1 has 1 clean sheet in 2 matches (50%)
    // t2 has 0 clean sheets in 2 matches (0%)
    expect(stats.cleanSheets[0].teamName).toBe("Muralla FC");
    expect(stats.cleanSheets[0].cleanSheets).toBe(1);
    expect(stats.cleanSheets[0].matchesPlayed).toBe(2);
    expect(stats.cleanSheets[0].cleanSheetPercentage).toBe(50);

    // Overview
    expect(stats.overview.totalMatches).toBe(3);
    expect(stats.overview.completedMatches).toBe(2);
    expect(stats.overview.totalGoals).toBe(4); // 2 + 0 + 1 + 1
    expect(stats.overview.goalsPerMatch).toBe(2);
    expect(stats.overview.totalYellowCards).toBe(1);
    expect(stats.overview.totalRedCards).toBe(0);
    expect(stats.overview.cardsPerMatch).toBe(0.5);
  });
});

