import { describe, it, expect, vi } from "vitest";
import { getMatchPermissions, canOfficiateMatch } from "./match-permissions";
import type { SupabaseClient } from "@supabase/supabase-js";

function chainableList(data: unknown) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.then = (resolve: (v: unknown) => void) => resolve({ data, error: null });
  return chain;
}

function chainableSingle(data: unknown) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.maybeSingle = vi.fn().mockResolvedValue({ data, error: null });
  return chain;
}

function createMockSupabase({
  globalRole = null as string | null,
  leagueRole = null as string | null,
  teamRows = [] as Array<{ team_id: string; role: string }>,
  assignedMatches = [] as Array<{ id: string }>,
  matchDetail = null as { referee_id: string | null; home_team_id: string; away_team_id: string } | null,
} = {}) {
  return {
    from: vi.fn((table: string) => {
      if (table === "profiles") {
        return chainableSingle({ global_role: globalRole });
      }
      if (table === "league_members") {
        return chainableSingle({ role: leagueRole });
      }
      if (table === "team_members") {
        return chainableList(teamRows);
      }
      if (table === "matches") {
        // getLeaguePermissions pide lista de asignados; getMatchPermissions pide single por matchId.
        // Distinguir por número de .eq encadenados es frágil; devolvemos un chain que sirve ambos:
        const chain: Record<string, unknown> = {};
        chain.select = vi.fn(() => chain);
        chain.eq = vi.fn(() => chain);
        chain.maybeSingle = vi.fn().mockResolvedValue({ data: matchDetail, error: null });
        chain.then = (resolve: (v: unknown) => void) => resolve({ data: assignedMatches, error: null });
        return chain;
      }
      return {};
    }),
  } as unknown as SupabaseClient;
}

describe("match-permissions", () => {
  it("grants full access to league_admin", async () => {
    const supabase = createMockSupabase({ leagueRole: "league_admin" });
    const perms = await getMatchPermissions({
      supabase,
      userId: "u1",
      leagueId: "lg1",
      matchId: "m1",
    });
    expect(perms.canUpdateResult).toBe(true);
    expect(perms.canManageEvents).toBe(true);
  });

  it("grants assigned referee result+events", async () => {
    const supabase = createMockSupabase({
      leagueRole: "referee",
      assignedMatches: [{ id: "m1" }],
      matchDetail: { referee_id: "uref", home_team_id: "t1", away_team_id: "t2" },
    });
    const perms = await getMatchPermissions({
      supabase,
      userId: "uref",
      leagueId: "lg1",
      matchId: "m1",
    });
    expect(perms.isAssignedReferee).toBe(true);
    expect(perms.canUpdateResult).toBe(true);
    expect(perms.canManageEvents).toBe(true);
  });

  it("grants team staff events but not results on their team's match", async () => {
    const supabase = createMockSupabase({
      leagueRole: "viewer",
      teamRows: [{ team_id: "t1", role: "coach" }],
      assignedMatches: [],
      matchDetail: { referee_id: null, home_team_id: "t1", away_team_id: "t2" },
    });
    const perms = await getMatchPermissions({
      supabase,
      userId: "ucoach",
      leagueId: "lg1",
      matchId: "m1",
    });
    expect(perms.isTeamStaffForMatch).toBe(true);
    expect(perms.canManageEvents).toBe(true);
    expect(perms.canUpdateResult).toBe(false);
  });

  it("denies team staff events on matches without their team", async () => {
    const supabase = createMockSupabase({
      leagueRole: "viewer",
      teamRows: [{ team_id: "t9", role: "coach" }],
      assignedMatches: [],
      matchDetail: { referee_id: "other", home_team_id: "t1", away_team_id: "t2" },
    });
    const perms = await getMatchPermissions({
      supabase,
      userId: "ucoach",
      leagueId: "lg1",
      matchId: "m1",
    });
    expect(perms.isTeamStaffForMatch).toBe(false);
    expect(perms.canManageEvents).toBe(false);
    expect(perms.canUpdateResult).toBe(false);
  });

  it("denies referee on matches where they are not the assigned referee", async () => {
    const supabase = createMockSupabase({
      leagueRole: "referee",
      assignedMatches: [{ id: "m-other" }],
      matchDetail: { referee_id: "other-ref", home_team_id: "t1", away_team_id: "t2" },
    });
    const perms = await getMatchPermissions({
      supabase,
      userId: "uref",
      leagueId: "lg1",
      matchId: "m-target",
    });
    expect(perms.isAssignedReferee).toBe(false);
    expect(perms.isTeamStaffForMatch).toBe(false);
    expect(perms.canUpdateResult).toBe(false);
    expect(perms.canManageEvents).toBe(false);
  });

  it("lets league referees officiate unassigned matches", async () => {
    const supabase = createMockSupabase({
      leagueRole: "referee",
      teamRows: [],
      assignedMatches: [],
      matchDetail: { referee_id: null, home_team_id: "t1", away_team_id: "t2" },
    });
    const perms = await getMatchPermissions({
      supabase,
      userId: "uref",
      leagueId: "lg1",
      matchId: "m1",
    });
    expect(perms.isAssignedReferee).toBe(false);
    expect(perms.canOfficiate).toBe(true);
    expect(perms.canUpdateResult).toBe(true);
    expect(perms.canManageEvents).toBe(true);
  });

  it("denies non-referee members on unassigned matches", async () => {
    const supabase = createMockSupabase({
      leagueRole: "viewer",
      teamRows: [],
      assignedMatches: [],
      matchDetail: { referee_id: null, home_team_id: "t1", away_team_id: "t2" },
    });
    const perms = await getMatchPermissions({
      supabase,
      userId: "uview",
      leagueId: "lg1",
      matchId: "m1",
    });
    expect(perms.canOfficiate).toBe(false);
    expect(perms.canUpdateResult).toBe(false);
  });
});

describe("canOfficiateMatch", () => {
  const base = {
    canManageLeague: false,
    leagueRole: "referee",
  } as Parameters<typeof canOfficiateMatch>[0];

  it("allows assigned referee", () => {
    expect(canOfficiateMatch(base, "u1", "u1")).toBe(true);
  });

  it("allows league referee on unassigned match", () => {
    expect(canOfficiateMatch(base, "u1", null)).toBe(true);
  });

  it("denies league referee on others' matches", () => {
    expect(canOfficiateMatch(base, "u1", "u2")).toBe(false);
  });

  it("denies viewers even on unassigned matches", () => {
    expect(canOfficiateMatch({ ...base, leagueRole: "viewer" }, "u1", null)).toBe(false);
  });
});

