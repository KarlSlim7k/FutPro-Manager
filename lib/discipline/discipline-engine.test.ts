import { describe, expect, it } from "vitest";
import { calculateSeasonDiscipline } from "./discipline-engine";

describe("Discipline Engine", () => {
  const playersMap = new Map([
    ["p1", { id: "p1", full_name: "Carlos Mendoza", status: "active" }],
    ["p2", { id: "p2", full_name: "Roberto Gómez", status: "active" }],
    ["p3", { id: "p3", full_name: "Juan Pérez", status: "active" }],
  ]);

  const teamsMap = new Map([
    ["t1", { id: "t1", name: "Deportivo Perote" }],
  ]);

  const registrations = [
    { id: "reg-1", player_id: "p1", team_id: "t1", jersey_number: 10, status: "active" },
    { id: "reg-2", player_id: "p2", team_id: "t1", jersey_number: 4, status: "active" },
    { id: "reg-3", player_id: "p3", team_id: "t1", jersey_number: 7, status: "active" },
  ];

  const matches = [
    { id: "m1", scheduled_at: "2026-09-01T10:00:00Z", status: "completed" },
    { id: "m2", scheduled_at: "2026-09-08T10:00:00Z", status: "completed" },
    { id: "m3", scheduled_at: "2026-09-15T10:00:00Z", status: "completed" },
  ];

  it("triggers suspension when player reaches yellow card threshold (3 cards)", () => {
    const events = [
      { id: "e1", match_id: "m1", player_id: "p1", team_id: "t1", event_type: "yellow_card", created_at: "2026-09-01T10:20:00Z" },
      { id: "e2", match_id: "m2", player_id: "p1", team_id: "t1", event_type: "yellow_card", created_at: "2026-09-08T10:35:00Z" },
      { id: "e3", match_id: "m3", player_id: "p1", team_id: "t1", event_type: "yellow_card", created_at: "2026-09-15T10:40:00Z" },
    ];

    const result = calculateSeasonDiscipline({
      matches,
      events,
      registrations,
      playersMap,
      teamsMap,
    });

    const p1Record = result.playerRecords.find((r) => r.playerId === "p1");
    expect(p1Record).toBeDefined();
    expect(p1Record?.yellowCardsTotal).toBe(3);
    expect(p1Record?.isSuspended).toBe(true);
    expect(p1Record?.suspensionReason).toContain("Acumulación de 3 tarjetas amarillas");
    expect(result.currentlySuspendedCount).toBe(1);
  });

  it("warns when player is 1 card away from suspension threshold", () => {
    const events = [
      { id: "e1", match_id: "m1", player_id: "p2", team_id: "t1", event_type: "yellow_card", created_at: "2026-09-01T10:20:00Z" },
      { id: "e2", match_id: "m2", player_id: "p2", team_id: "t1", event_type: "yellow_card", created_at: "2026-09-08T10:35:00Z" },
    ];

    const result = calculateSeasonDiscipline({
      matches,
      events,
      registrations,
      playersMap,
      teamsMap,
    });

    const p2Record = result.playerRecords.find((r) => r.playerId === "p2");
    expect(p2Record?.isSuspended).toBe(false);
    expect(p2Record?.warningNotice).toBeDefined();
    expect(p2Record?.warningNotice).toContain("Al límite");
    expect(result.playersAtRiskCount).toBe(1);
  });

  it("immediately suspends on direct red card", () => {
    const events = [
      { id: "e1", match_id: "m1", player_id: "p3", team_id: "t1", event_type: "red_card", created_at: "2026-09-01T10:45:00Z" },
    ];

    const result = calculateSeasonDiscipline({
      matches,
      events,
      registrations,
      playersMap,
      teamsMap,
    });

    const p3Record = result.playerRecords.find((r) => r.playerId === "p3");
    expect(p3Record?.isSuspended).toBe(true);
    expect(p3Record?.suspensionReason).toContain("Tarjeta roja");
  });
});
