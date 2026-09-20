import { describe, it, expect, vi } from "vitest";
import {
  mapStripeStatusToDb,
  mapMercadoPagoStatusToDb,
  syncLeagueSubscription,
} from "./subscription-service";

describe("subscription-service", () => {
  describe("mapStripeStatusToDb", () => {
    it("maps standard Stripe statuses correctly", () => {
      expect(mapStripeStatusToDb("trialing")).toBe("trialing");
      expect(mapStripeStatusToDb("active")).toBe("active");
      expect(mapStripeStatusToDb("past_due")).toBe("past_due");
      expect(mapStripeStatusToDb("unpaid")).toBe("past_due");
      expect(mapStripeStatusToDb("canceled")).toBe("cancelled");
      expect(mapStripeStatusToDb("paused")).toBe("paused");
      expect(mapStripeStatusToDb("unknown_status")).toBe("active");
    });
  });

  describe("mapMercadoPagoStatusToDb", () => {
    it("maps MercadoPago payment statuses correctly", () => {
      expect(mapMercadoPagoStatusToDb("approved")).toBe("active");
      expect(mapMercadoPagoStatusToDb("authorized")).toBe("active");
      expect(mapMercadoPagoStatusToDb("pending")).toBe("past_due");
      expect(mapMercadoPagoStatusToDb("in_process")).toBe("past_due");
      expect(mapMercadoPagoStatusToDb("rejected")).toBe("cancelled");
      expect(mapMercadoPagoStatusToDb("cancelled")).toBe("cancelled");
    });
  });

  describe("syncLeagueSubscription", () => {
    it("updates existing subscription when found", async () => {
      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: "sub-1", plan_id: "plan-1", status: "trialing" },
            error: null,
          }),
          update: updateMock,
        })),
      } as any;

      const res = await syncLeagueSubscription(mockSupabase, {
        leagueId: "league-123",
        provider: "stripe",
        status: "active",
      });

      expect(res.success).toBe(true);
      expect(res.subscriptionId).toBe("sub-1");
      expect(updateMock).toHaveBeenCalled();
    });

    it("inserts new subscription when none exists", async () => {
      const insertMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "sub-created-99" },
            error: null,
          }),
        }),
      });

      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
          insert: insertMock,
        })),
      } as any;

      const res = await syncLeagueSubscription(mockSupabase, {
        leagueId: "league-456",
        planId: "plan-pro",
        provider: "mercadopago",
        status: "active",
      });

      expect(res.success).toBe(true);
      expect(res.subscriptionId).toBe("sub-created-99");
      expect(insertMock).toHaveBeenCalled();
    });
  });
});
