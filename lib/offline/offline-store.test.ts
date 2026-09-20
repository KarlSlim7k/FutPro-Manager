import { describe, expect, it } from "vitest";
import type { OfflineMatchEvent, OfflineMatchScore } from "./offline-store";

describe("Offline Match Store Contracts", () => {
  it("structures offline event records properly", () => {
    const event: OfflineMatchEvent = {
      id: "local-event-1",
      matchId: "match-123",
      teamId: "team-456",
      playerId: "player-789",
      eventType: "goal",
      minute: 23,
      notes: "Gol de tiro libre",
      createdAt: new Date().toISOString(),
      synced: false,
    };

    expect(event.synced).toBe(false);
    expect(event.eventType).toBe("goal");
    expect(event.minute).toBe(23);
  });

  it("structures offline score records properly", () => {
    const score: OfflineMatchScore = {
      matchId: "match-123",
      homeScore: 2,
      awayScore: 1,
      status: "completed",
      updatedAt: new Date().toISOString(),
      synced: false,
    };

    expect(score.homeScore).toBe(2);
    expect(score.awayScore).toBe(1);
    expect(score.status).toBe("completed");
    expect(score.synced).toBe(false);
  });
});
