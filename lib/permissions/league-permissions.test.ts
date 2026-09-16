import { describe, it, expect, vi } from "vitest";
import { getLeaguePermissions } from "./league-permissions";
import type { SupabaseClient } from "@supabase/supabase-js";

function chainableList(data: unknown) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.then = (resolve: (v: unknown) => void) => resolve({ data, error: null });
  return chain;
}

function createMockSupabase({
  globalRole = null as string | null,
  leagueRole = null as string | null,
  profileError = null as unknown,
  membershipError = null as unknown,
  teamRows = [] as Array<{ team_id: string; role: string }>,
  matchRows = [] as Array<{ id: string }>,
} = {}) {
  return {
    from: vi.fn((table: string) => {
      if (table === "profiles") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: profileError ? null : { global_role: globalRole },
                error: profileError,
              }),
            }),
          }),
        };
      }
      if (table === "league_members") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: membershipError ? null : { role: leagueRole },
                  error: membershipError,
                }),
              }),
            }),
          }),
        };
      }
      if (table === "team_members") {
        return chainableList(teamRows);
      }
      if (table === "matches") {
        return chainableList(matchRows);
      }
      return {};
    }),
  } as unknown as SupabaseClient;
}

describe("league-permissions", () => {
  it("grants full management access to super_admin regardless of league role", async () => {
    const supabase = createMockSupabase({ globalRole: "super_admin", leagueRole: null });
    const perms = await getLeaguePermissions({
      supabase,
      userId: "usr-1",
      leagueId: "lg-1",
    });

    expect(perms.globalRole).toBe("super_admin");
    expect(perms.canManageLeague).toBe(true);
    expect(perms.canManageMatches).toBe(true);
    expect(perms.canManageMembers).toBe(true);
    expect(perms.canAssignReferees).toBe(true);
    expect(perms.canViewAuditLogs).toBe(true);
    expect(perms.isReadOnly).toBe(false);
  });

  it("grants management access to league_admin", async () => {
    const supabase = createMockSupabase({ globalRole: null, leagueRole: "league_admin" });
    const perms = await getLeaguePermissions({
      supabase,
      userId: "usr-2",
      leagueId: "lg-1",
    });

    expect(perms.leagueRole).toBe("league_admin");
    expect(perms.canManageLeague).toBe(true);
    expect(perms.canManageMatches).toBe(true);
    expect(perms.canManageMembers).toBe(true);
    expect(perms.canAssignReferees).toBe(true);
    expect(perms.isReadOnly).toBe(false);
  });

  it("restricts non-admin members to read-only access", async () => {
    const roles = ["referee", "coach", "viewer", "team_admin"] as const;

    for (const role of roles) {
      const supabase = createMockSupabase({ globalRole: null, leagueRole: role });
      const perms = await getLeaguePermissions({
        supabase,
        userId: "usr-3",
        leagueId: "lg-1",
      });

      expect(perms.leagueRole).toBe(role);
      expect(perms.canManageLeague).toBe(false);
      expect(perms.canManageMatches).toBe(false);
      expect(perms.canManageMembers).toBe(false);
      expect(perms.canAssignReferees).toBe(false);
      expect(perms.canViewAuditLogs).toBe(false);
      expect(perms.isReadOnly).toBe(true);
      // But they can view referee assignments if they are a member
      expect(perms.canViewRefereeAssignments).toBe(true);
    }
  });

  it("returns safe read-only permissions when Supabase returns an error", async () => {
    const supabase = createMockSupabase({ profileError: new Error("DB Connection Error") });
    const perms = await getLeaguePermissions({
      supabase,
      userId: "usr-err",
      leagueId: "lg-1",
    });

    expect(perms.globalRole).toBeNull();
    expect(perms.leagueRole).toBeNull();
    expect(perms.canManageLeague).toBe(false);
    expect(perms.isReadOnly).toBe(true);
  });

  it("grants team staff (team_admin/coach) player and event access without league management", async () => {
    const supabase = createMockSupabase({
      globalRole: null,
      leagueRole: "viewer",
      teamRows: [{ team_id: "team-1", role: "coach" }],
      matchRows: [],
    });
    const perms = await getLeaguePermissions({
      supabase,
      userId: "usr-coach",
      leagueId: "lg-1",
    });

    expect(perms.canManageLeague).toBe(false);
    expect(perms.canManageMatches).toBe(false);
    expect(perms.canManageMembers).toBe(false);
    expect(perms.canAssignReferees).toBe(false);
    expect(perms.canViewAuditLogs).toBe(false);
    expect(perms.staffTeamIds).toEqual(["team-1"]);
    expect(perms.canManagePlayers).toBe(true);
    expect(perms.canManageRegistrations).toBe(true);
    expect(perms.canCreateMatchEvents).toBe(true);
    expect(perms.canUpdateMatchResults).toBe(false);
    expect(perms.isReadOnly).toBe(false);
  });

  it("grants assigned referees result and event access without league management", async () => {
    const supabase = createMockSupabase({
      globalRole: null,
      leagueRole: "referee",
      teamRows: [],
      matchRows: [{ id: "match-1" }],
    });
    const perms = await getLeaguePermissions({
      supabase,
      userId: "usr-ref",
      leagueId: "lg-1",
    });

    expect(perms.canManageLeague).toBe(false);
    expect(perms.assignedMatchIds).toEqual(["match-1"]);
    expect(perms.canManagePlayers).toBe(false);
    expect(perms.canCreateMatchEvents).toBe(true);
    expect(perms.canUpdateMatchResults).toBe(true);
    expect(perms.canUpdateResults).toBe(true);
    expect(perms.canManageEvents).toBe(true);
    expect(perms.isReadOnly).toBe(false);
  });
});
