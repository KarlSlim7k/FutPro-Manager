import { describe, it, expect, vi } from "vitest";
import { getLeaguePermissions } from "./league-permissions";
import type { SupabaseClient } from "@supabase/supabase-js";

function createMockSupabase({
  globalRole = null as string | null,
  leagueRole = null as string | null,
  profileError = null as unknown,
  membershipError = null as unknown,
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
});
