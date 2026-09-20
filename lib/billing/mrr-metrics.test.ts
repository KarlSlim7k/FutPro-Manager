import { describe, it, expect } from "vitest";
import { calculateSaaSMetrics, type SubscriptionMetricRecord } from "./mrr-metrics";

describe("mrr-metrics", () => {
  it("calculates MRR, ARR, active paid leagues, and churn rate correctly", () => {
    const subscriptions: SubscriptionMetricRecord[] = [
      {
        id: "1",
        status: "active",
        planName: "Plan Pro",
        planSlug: "pro",
        priceMonthly: 1200,
      },
      {
        id: "2",
        status: "active",
        planName: "Plan Básico",
        planSlug: "basico",
        priceMonthly: 500,
      },
      {
        id: "3",
        status: "trialing",
        planName: "Plan Pro",
        planSlug: "pro",
        priceMonthly: 1200,
      },
      {
        id: "4",
        status: "past_due",
        planName: "Plan Básico",
        planSlug: "basico",
        priceMonthly: 500,
      },
      {
        id: "5",
        status: "cancelled",
        planName: "Plan Básico",
        planSlug: "basico",
        priceMonthly: 500,
      },
    ];

    const metrics = calculateSaaSMetrics(subscriptions);

    expect(metrics.mrr).toBe(1700); // 1200 + 500
    expect(metrics.arr).toBe(20400); // 1700 * 12
    expect(metrics.activePaidLeagues).toBe(2);
    expect(metrics.trialingLeagues).toBe(1);
    expect(metrics.pastDueLeagues).toBe(1);
    expect(metrics.cancelledLeagues).toBe(1);
    expect(metrics.totalSubscriptions).toBe(5);
    expect(metrics.churnRate).toBe(20); // 1 / 5 = 20%
    expect(metrics.arpu).toBe(850); // 1700 / 2 = 850

    expect(metrics.planDistribution).toHaveLength(2);
    expect(metrics.planDistribution[0].slug).toBe("pro");
    expect(metrics.planDistribution[0].revenue).toBe(1200);
  });

  it("handles empty subscription list without dividing by zero", () => {
    const metrics = calculateSaaSMetrics([]);
    expect(metrics.mrr).toBe(0);
    expect(metrics.arr).toBe(0);
    expect(metrics.activePaidLeagues).toBe(0);
    expect(metrics.churnRate).toBe(0);
    expect(metrics.arpu).toBe(0);
  });
});
