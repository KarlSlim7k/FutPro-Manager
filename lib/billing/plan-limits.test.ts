import { describe, it, expect, vi } from "vitest";
import {
  getPlanLimits,
  isWithinLimit,
  verifyTeamCreationLimit,
  verifySeasonCreationLimit,
} from "./plan-limits";

describe("plan-limits", () => {
  describe("getPlanLimits", () => {
    it("returns default gratis limits when null or unknown", () => {
      const limits = getPlanLimits(null);
      expect(limits.maxTeams).toBe(10);
      expect(limits.maxActiveSeasons).toBe(1);

      const unknown = getPlanLimits("plan_inexistente");
      expect(unknown.maxTeams).toBe(10);
    });

    it("returns pro limits for pro plan slug", () => {
      const limits = getPlanLimits("pro");
      expect(limits.maxTeams).toBe(32);
      expect(limits.maxActiveSeasons).toBe(5);
      expect(limits.hasCustomDomain).toBe(true);
    });

    it("returns unlimited (-1) for elite plan", () => {
      const limits = getPlanLimits("elite");
      expect(limits.maxTeams).toBe(-1);
      expect(limits.maxActiveSeasons).toBe(-1);
    });
  });

  describe("isWithinLimit", () => {
    it("checks upper bound correctly", () => {
      expect(isWithinLimit(9, 10)).toBe(true);
      expect(isWithinLimit(10, 10)).toBe(false);
      expect(isWithinLimit(11, 10)).toBe(false);
    });

    it("allows any count when limit is -1 (unlimited)", () => {
      expect(isWithinLimit(0, -1)).toBe(true);
      expect(isWithinLimit(100, -1)).toBe(true);
      expect(isWithinLimit(10000, -1)).toBe(true);
    });
  });

  describe("verifyTeamCreationLimit", () => {
    it("allows creation when under the limit", async () => {
      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "league_subscriptions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              in: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({
                data: { status: "active", plan: { slug: "basico", name: "Plan Básico" } },
              }),
            };
          }
          if (table === "teams") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ count: 12, error: null }),
            };
          }
          return {};
        }),
      } as any;

      const result = await verifyTeamCreationLimit(mockSupabase, "league-1");
      expect(result.allowed).toBe(true);
      expect(result.currentCount).toBe(12);
      expect(result.maxAllowed).toBe(16);
    });

    it("blocks creation with explanatory message when limit reached", async () => {
      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "league_subscriptions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              in: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({
                data: { status: "active", plan: { slug: "gratis", name: "Gratis / Prueba" } },
              }),
            };
          }
          if (table === "teams") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ count: 10, error: null }),
            };
          }
          return {};
        }),
      } as any;

      const result = await verifyTeamCreationLimit(mockSupabase, "league-2");
      expect(result.allowed).toBe(false);
      expect(result.currentCount).toBe(10);
      expect(result.maxAllowed).toBe(10);
      expect(result.message).toContain("Has alcanzado el límite de 10 equipos");
    });
  });
});
