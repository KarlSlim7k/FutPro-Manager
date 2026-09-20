import { describe, expect, it } from "vitest";
import { calculateRefereeEarnings } from "./referee-fees";

describe("Referee Fees and Settlement Calculator", () => {
  it("calculates earnings for head referee and assistant matches", () => {
    const assignments = [
      {
        matchId: "m1",
        roundName: "Jornada 1",
        scheduledAt: "2026-09-01T10:00:00Z",
        status: "completed",
        role: "head_referee" as const, // default 400
        homeTeamName: "Deportivo Perote",
        awayTeamName: "Real Azteca",
        isPaid: true,
      },
      {
        matchId: "m2",
        roundName: "Jornada 2",
        scheduledAt: "2026-09-08T10:00:00Z",
        status: "completed",
        role: "first_assistant" as const, // default 250
        homeTeamName: "Pumas",
        awayTeamName: "Tigres",
        isPaid: false,
      },
      {
        matchId: "m3",
        roundName: "Jornada 3",
        scheduledAt: "2026-09-15T10:00:00Z",
        status: "scheduled", // not completed yet
        role: "head_referee" as const,
        homeTeamName: "León",
        awayTeamName: "Atlas",
        isPaid: false,
      },
    ];

    const result = calculateRefereeEarnings({ assignments });

    expect(result.totalMatches).toBe(3);
    expect(result.totalEarned).toBe(650); // 400 + 250
    expect(result.totalPaid).toBe(400); // 400
    expect(result.totalPending).toBe(250); // 250
  });

  it("respects custom tariff overrides", () => {
    const assignments = [
      {
        matchId: "m1",
        scheduledAt: "2026-09-01T10:00:00Z",
        status: "completed",
        role: "head_referee" as const,
        homeTeamName: "A",
        awayTeamName: "B",
      },
    ];

    const result = calculateRefereeEarnings({
      assignments,
      customTariff: {
        head_referee: 600,
        first_assistant: 300,
        second_assistant: 300,
        fourth_official: 200,
      },
    });

    expect(result.totalEarned).toBe(600);
    expect(result.totalPending).toBe(600);
  });
});
