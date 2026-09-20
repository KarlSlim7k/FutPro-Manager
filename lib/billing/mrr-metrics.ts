export interface SubscriptionMetricRecord {
  id: string;
  status: "trialing" | "active" | "past_due" | "cancelled" | "paused";
  planName: string;
  planSlug: string;
  priceMonthly: number;
  createdAt?: string;
}

export interface SaaSBusinessMetrics {
  mrr: number;
  arr: number;
  activePaidLeagues: number;
  trialingLeagues: number;
  pastDueLeagues: number;
  cancelledLeagues: number;
  totalSubscriptions: number;
  churnRate: number; // 0 to 100%
  arpu: number; // Average revenue per paying league
  planDistribution: Array<{
    slug: string;
    name: string;
    count: number;
    revenue: number;
  }>;
}

export function calculateSaaSMetrics(
  subscriptions: SubscriptionMetricRecord[]
): SaaSBusinessMetrics {
  let mrr = 0;
  let activePaidLeagues = 0;
  let trialingLeagues = 0;
  let pastDueLeagues = 0;
  let cancelledLeagues = 0;

  const planMap = new Map<
    string,
    { slug: string; name: string; count: number; revenue: number }
  >();

  for (const sub of subscriptions) {
    if (sub.status === "active") {
      mrr += sub.priceMonthly;
      if (sub.priceMonthly > 0) {
        activePaidLeagues += 1;
      }
    } else if (sub.status === "trialing") {
      trialingLeagues += 1;
    } else if (sub.status === "past_due") {
      pastDueLeagues += 1;
    } else if (sub.status === "cancelled") {
      cancelledLeagues += 1;
    }

    const key = sub.planSlug || "custom";
    let entry = planMap.get(key);
    if (!entry) {
      entry = {
        slug: key,
        name: sub.planName || "Plan General",
        count: 0,
        revenue: 0,
      };
      planMap.set(key, entry);
    }
    entry.count += 1;
    if (sub.status === "active") {
      entry.revenue += sub.priceMonthly;
    }
  }

  const totalSubscriptions = subscriptions.length;
  const churnRate =
    totalSubscriptions > 0
      ? Number(((cancelledLeagues / totalSubscriptions) * 100).toFixed(1))
      : 0;

  const arpu =
    activePaidLeagues > 0
      ? Number((mrr / activePaidLeagues).toFixed(2))
      : 0;

  const arr = mrr * 12;

  const planDistribution = Array.from(planMap.values()).sort(
    (a, b) => b.revenue - a.revenue
  );

  return {
    mrr,
    arr,
    activePaidLeagues,
    trialingLeagues,
    pastDueLeagues,
    cancelledLeagues,
    totalSubscriptions,
    churnRate,
    arpu,
    planDistribution,
  };
}
