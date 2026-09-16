import { describe, it, expect, vi } from "vitest";
import { canManageTeam, getLeaguePermissions, isTeamStaff } from "./league-permissions";
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

  it("grants team_admin full team management for their assigned team", async () => {
    const supabase = createMockSupabase({
      globalRole: null,
      leagueRole: "viewer",
      teamRows: [{ team_id: "team-admin-1", role: "team_admin" }],
      matchRows: [],
    });
    const perms = await getLeaguePermissions({
      supabase,
      userId: "usr-team-admin",
      leagueId: "lg-1",
    });

    expect(perms.canManageLeague).toBe(false);
    expect(perms.managedTeamIds).toEqual(["team-admin-1"]);
    expect(perms.staffTeamIds).toEqual(["team-admin-1"]);
    expect(canManageTeam(perms, "team-admin-1")).toBe(true);
    expect(canManageTeam(perms, "other-team")).toBe(false);
    expect(isTeamStaff(perms, "team-admin-1")).toBe(true);
    expect(isTeamStaff(perms, "other-team")).toBe(false);
    expect(perms.canManagePlayers).toBe(true);
    expect(perms.canManageRegistrations).toBe(true);
    expect(perms.canCreateMatchEvents).toBe(true);
  });

  it("differentiates coach from team_admin in canManageTeam", async () => {
    const supabase = createMockSupabase({
      globalRole: null,
      leagueRole: "viewer",
      teamRows: [{ team_id: "team-coach-1", role: "coach" }],
      matchRows: [],
    });
    const perms = await getLeaguePermissions({
      supabase,
      userId: "usr-coach-only",
      leagueId: "lg-1",
    });

    expect(perms.managedTeamIds).toEqual([]);
    expect(perms.staffTeamIds).toEqual(["team-coach-1"]);
    expect(canManageTeam(perms, "team-coach-1")).toBe(false);
    expect(isTeamStaff(perms, "team-coach-1")).toBe(true);
  });

  it("allows league_admin and super_admin to manage any team", async () => {
    const leagueAdminSupabase = createMockSupabase({
      globalRole: null,
      leagueRole: "league_admin",
    });
    const leagueAdminPerms = await getLeaguePermissions({
      supabase: leagueAdminSupabase,
      userId: "usr-la",
      leagueId: "lg-1",
    });

    expect(canManageTeam(leagueAdminPerms, "any-team-xyz")).toBe(true);
    expect(isTeamStaff(leagueAdminPerms, "any-team-xyz")).toBe(true);

    const superAdminSupabase = createMockSupabase({
      globalRole: "super_admin",
      leagueRole: null,
    });
    const superAdminPerms = await getLeaguePermissions({
      supabase: superAdminSupabase,
      userId: "usr-sa",
      leagueId: "lg-1",
    });

    expect(canManageTeam(superAdminPerms, "any-team-xyz")).toBe(true);
    expect(isTeamStaff(superAdminPerms, "any-team-xyz")).toBe(true);
  });

  it("verifies full operational permissions for coach: sports operations allowed, administrative blocked", async () => {
    const supabase = createMockSupabase({
      globalRole: null,
      leagueRole: "viewer",
      teamRows: [{ team_id: "team-coach-alpha", role: "coach" }],
      matchRows: [],
    });
    const perms = await getLeaguePermissions({
      supabase,
      userId: "usr-head-coach",
      leagueId: "lg-1",
    });

    // Sports operations: allowed
    expect(perms.canManagePlayers).toBe(true);
    expect(perms.canManageRegistrations).toBe(true);
    expect(perms.canCreateMatchEvents).toBe(true);
    expect(perms.staffTeamIds).toEqual(["team-coach-alpha"]);
    expect(isTeamStaff(perms, "team-coach-alpha")).toBe(true);
    expect(isTeamStaff(perms, "team-other")).toBe(false);

    // Administrative operations: strictly blocked
    expect(perms.managedTeamIds).toEqual([]);
    expect(canManageTeam(perms, "team-coach-alpha")).toBe(false);
    expect(canManageTeam(perms, "team-other")).toBe(false);
    expect(perms.canManageLeague).toBe(false);
    expect(perms.canManageCatalog).toBe(false);
    expect(perms.canManageMatches).toBe(false);
    expect(perms.canUpdateResults).toBe(false);
    expect(perms.canUpdateMatchResults).toBe(false);
    expect(perms.canRecalculateStandings).toBe(false);
    expect(perms.canManageMembers).toBe(false);
    expect(perms.canManageRoles).toBe(false);
    expect(perms.canAssignReferees).toBe(false);
    expect(perms.canViewAuditLogs).toBe(false);
    expect(perms.canManageAuditLogs).toBe(false);
    expect(perms.isReadOnly).toBe(false);
  });

  it("verifies full operational permissions for referee: referee operations allowed, administrative blocked", async () => {
    const supabase = createMockSupabase({
      globalRole: null,
      leagueRole: "referee",
      teamRows: [],
      matchRows: [{ id: "match-assigned-10" }, { id: "match-assigned-20" }],
    });
    const perms = await getLeaguePermissions({
      supabase,
      userId: "usr-referee-pro",
      leagueId: "lg-1",
    });

    // Referee operations: allowed
    expect(perms.leagueRole).toBe("referee");
    expect(perms.assignedMatchIds).toEqual(["match-assigned-10", "match-assigned-20"]);
    expect(perms.canUpdateResults).toBe(true);
    expect(perms.canUpdateMatchResults).toBe(true);
    expect(perms.canManageEvents).toBe(true);
    expect(perms.canCreateMatchEvents).toBe(true);
    expect(perms.canViewRefereeAssignments).toBe(true);
    expect(perms.isReadOnly).toBe(false);

    // Administrative operations: strictly blocked
    expect(perms.canManageLeague).toBe(false);
    expect(perms.canManageCatalog).toBe(false);
    expect(perms.canManageMatches).toBe(false);
    expect(perms.canRecalculateStandings).toBe(false);
    expect(perms.canManageMembers).toBe(false);
    expect(perms.canManageRoles).toBe(false);
    expect(perms.canAssignReferees).toBe(false);
    expect(perms.canViewAuditLogs).toBe(false);
    expect(perms.canManageAuditLogs).toBe(false);
    expect(perms.canManagePlayers).toBe(false);
    expect(perms.canManageRegistrations).toBe(false);
    expect(perms.managedTeamIds).toEqual([]);
    expect(perms.staffTeamIds).toEqual([]);
    expect(canManageTeam(perms, "team-any")).toBe(false);
    expect(isTeamStaff(perms, "team-any")).toBe(false);
  });
});


