import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  canUserAccessTutorial,
  getGlobalVisibleRoles,
  getVisibleRolesForUser,
  isValidAppRole,
} from "./roles";
import {
  getTutorials,
  getTutorialBySlug,
  sanitizeSearchQuery,
} from "./queries";
import type { AppRole, Tutorial } from "@/types/database";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";

describe("lib/tutorials/roles", () => {
  describe("isValidAppRole", () => {
    it("recognizes valid AppRole strings", () => {
      expect(isValidAppRole("super_admin")).toBe(true);
      expect(isValidAppRole("league_admin")).toBe(true);
      expect(isValidAppRole("team_admin")).toBe(true);
      expect(isValidAppRole("coach")).toBe(true);
      expect(isValidAppRole("referee")).toBe(true);
      expect(isValidAppRole("viewer")).toBe(true);
    });

    it("rejects unknown or invalid role strings", () => {
      expect(isValidAppRole("admin")).toBe(false);
      expect(isValidAppRole("player")).toBe(false);
      expect(isValidAppRole("")).toBe(false);
      expect(isValidAppRole("<script>alert(1)</script>")).toBe(false);
    });
  });

  describe("getVisibleRolesForUser", () => {
    it("returns fail-closed ['viewer'] when permissions is null or empty", () => {
      expect(getVisibleRolesForUser(null)).toEqual(["viewer"]);
      expect(getVisibleRolesForUser({})).toEqual(["viewer"]);
    });

    it("returns all roles for super_admin", () => {
      const roles = getVisibleRolesForUser({ globalRole: "super_admin" });
      expect(roles).toEqual([
        "super_admin",
        "league_admin",
        "team_admin",
        "coach",
        "referee",
        "viewer",
      ]);
    });

    it("returns league_admin, team_admin, coach, referee, viewer for league_admin", () => {
      const roles = getVisibleRolesForUser({
        globalRole: "viewer",
        leagueRole: "league_admin",
        canManageLeague: true,
      });
      expect(roles).toContain("league_admin");
      expect(roles).toContain("team_admin");
      expect(roles).toContain("coach");
      expect(roles).toContain("referee");
      expect(roles).toContain("viewer");
      expect(roles).not.toContain("super_admin");
    });

    it("returns referee and viewer for referee role", () => {
      const roles = getVisibleRolesForUser({
        globalRole: "viewer",
        leagueRole: "referee",
        canManageLeague: false,
        assignedMatchIds: ["m-1"],
      });
      expect(roles).toEqual(["viewer", "referee"]);
    });

    it("returns team_admin, coach and viewer for managedTeamIds", () => {
      const roles = getVisibleRolesForUser({
        globalRole: "viewer",
        leagueRole: "viewer",
        canManageLeague: false,
        managedTeamIds: ["team-1"],
        staffTeamIds: ["team-1"],
      });
      expect(roles).toEqual(["viewer", "team_admin", "coach"]);
    });

    it("returns coach and viewer for coach staff only", () => {
      const roles = getVisibleRolesForUser({
        globalRole: "viewer",
        leagueRole: "viewer",
        canManageLeague: false,
        managedTeamIds: [],
        staffTeamIds: ["team-1"],
      });
      expect(roles).toEqual(["viewer", "coach"]);
    });
  });

  describe("canUserAccessTutorial", () => {
    it("allows any user to see a tutorial targeted to viewer", () => {
      const tutorial = { target_roles: ["viewer"] as AppRole[], is_published: true };
      expect(canUserAccessTutorial(tutorial, ["viewer"])).toBe(true);
      expect(canUserAccessTutorial(tutorial, ["referee"])).toBe(true);
    });

    it("blocks viewer from seeing league_admin tutorial", () => {
      const tutorial = { target_roles: ["league_admin"] as AppRole[], is_published: true };
      expect(canUserAccessTutorial(tutorial, ["viewer"])).toBe(false);
    });

    it("blocks coach from seeing referee tutorial", () => {
      const tutorial = { target_roles: ["referee"] as AppRole[], is_published: true };
      expect(canUserAccessTutorial(tutorial, ["coach", "viewer"])).toBe(false);
    });

    it("allows referee to see referee tutorial", () => {
      const tutorial = { target_roles: ["referee"] as AppRole[], is_published: true };
      expect(canUserAccessTutorial(tutorial, ["referee", "viewer"])).toBe(true);
    });

    it("allows super_admin to see any tutorial regardless of target roles", () => {
      const tutorial = { target_roles: ["league_admin"] as AppRole[], is_published: true };
      expect(canUserAccessTutorial(tutorial, ["super_admin"])).toBe(true);
    });

    it("hides unpublished tutorial for regular users", () => {
      const tutorial = { target_roles: ["viewer"] as AppRole[], is_published: false };
      expect(canUserAccessTutorial(tutorial, ["viewer"])).toBe(false);
      expect(canUserAccessTutorial(tutorial, ["referee"])).toBe(false);
      expect(canUserAccessTutorial(tutorial, ["super_admin"])).toBe(true);
      expect(canUserAccessTutorial(tutorial, ["league_admin", "viewer"])).toBe(true);
    });
  });

  describe("getGlobalVisibleRoles", () => {
    it("returns fail-closed ['viewer'] when database queries fail", async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: null,
                error: new Error("DB error"),
              }),
            }),
          }),
        })),
      };

      const roles = await getGlobalVisibleRoles(mockSupabase as never, "user-123");
      expect(roles).toEqual(["viewer"]);
    });

    it("resolves super_admin global role", async () => {
      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "profiles") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: { global_role: "super_admin" },
                    error: null,
                  }),
                }),
              }),
            };
          }
          const queryChain: Record<string, unknown> = {};
          queryChain.eq = vi.fn().mockReturnValue(queryChain);
          queryChain.limit = vi.fn().mockReturnValue(queryChain);
          queryChain.then = (resolve: (v: unknown) => void) =>
            resolve({ data: [], error: null });

          return {
            select: vi.fn().mockReturnValue(queryChain),
          };
        }),
      };

      const roles = await getGlobalVisibleRoles(mockSupabase as never, "admin-1");
      expect(roles).toContain("super_admin");
      expect(roles).toContain("league_admin");
      expect(roles).toContain("referee");
    });
  });
});

describe("lib/tutorials/queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sanitizeSearchQuery", () => {
    it("returns empty string for null, undefined, or empty string", () => {
      expect(sanitizeSearchQuery(null)).toBe("");
      expect(sanitizeSearchQuery(undefined)).toBe("");
      expect(sanitizeSearchQuery("   ")).toBe("");
    });

    it("strips SQL LIKE wildcard characters", () => {
      expect(sanitizeSearchQuery("partido%")).toBe("partido");
      expect(sanitizeSearchQuery("marcador_final")).toBe("marcadorfinal");
      expect(sanitizeSearchQuery("slash\\test")).toBe("slashtest");
    });

    it("limits length to 100 characters", () => {
      const longString = "a".repeat(150);
      const sanitized = sanitizeSearchQuery(longString);
      expect(sanitized.length).toBe(100);
    });

    it("safely handles XSS characters without throwing", () => {
      const xss = "<script>alert('xss')</script>";
      expect(sanitizeSearchQuery(xss)).toBe("<script>alert('xss')</script>");
    });
  });

  describe("getTutorials", () => {
    it("calls Supabase with proper filters and returns allowed tutorials", async () => {
      const mockTutorials: Tutorial[] = [
        {
          id: "1",
          slug: "tutorial-viewer",
          title: "Explorar portal público",
          summary: "Resumen",
          target_roles: ["viewer"],
          tags: ["publico"],
          estimated_minutes: 3,
          sort_order: 10,
          is_published: true,
          related_route: "/liga/[slug]",
          faq: [],
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
        {
          id: "2",
          slug: "tutorial-admin",
          title: "Crear temporada",
          summary: "Resumen",
          target_roles: ["league_admin"],
          tags: ["temporadas"],
          estimated_minutes: 5,
          sort_order: 20,
          is_published: true,
          related_route: "/dashboard/leagues/[slug]/seasons",
          faq: [],
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
      ];

      const queryMock: Record<string, unknown> = {};
      queryMock.select = vi.fn(() => queryMock);
      queryMock.eq = vi.fn(() => queryMock);
      queryMock.order = vi.fn(() => queryMock);
      queryMock.limit = vi.fn(() => queryMock);
      queryMock.contains = vi.fn(() => queryMock);
      queryMock.overlaps = vi.fn(() => queryMock);
      queryMock.ilike = vi.fn(() => queryMock);
      queryMock.then = (resolve: (v: unknown) => void) =>
        resolve({ data: mockTutorials, error: null });

      const supabaseMock = {
        from: vi.fn(() => queryMock),
      };

      vi.mocked(createClient).mockResolvedValue(supabaseMock as never);

      // Usuario solo viewer: el segundo tutorial (league_admin) debe ser filtrado en memoria
      const result = await getTutorials({
        q: "portal",
        userAllowedRoles: ["viewer"],
      });

      expect(supabaseMock.from).toHaveBeenCalledWith("tutorials");
      expect(result.length).toBe(1);
      expect(result[0].slug).toBe("tutorial-viewer");
    });
  });

  describe("getTutorialBySlug", () => {
    it("returns null for invalid slug format", async () => {
      const result = await getTutorialBySlug("INVALID_SLUG!!", ["viewer"]);
      expect(result).toBe(null);
    });

    it("returns null when tutorial is not accessible to user", async () => {
      const mockTutorial: Tutorial = {
        id: "2",
        slug: "crear-temporada",
        title: "Crear temporada",
        summary: "Resumen",
        target_roles: ["league_admin"],
        tags: ["temporadas"],
        estimated_minutes: 5,
        sort_order: 20,
        is_published: true,
        related_route: null,
        faq: [],
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
      };

      const supabaseMock = {
        from: vi.fn((table: string) => {
          if (table === "tutorials") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: mockTutorial,
                    error: null,
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      };

      vi.mocked(createClient).mockResolvedValue(supabaseMock as never);

      const result = await getTutorialBySlug("crear-temporada", ["viewer"]);
      expect(result).toBe(null);
    });
  });
});
