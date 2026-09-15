import { describe, it, expect } from "vitest";
import { checkPlayerEligibility } from "./player-eligibility";

describe("player-eligibility", () => {
  it("allows active player with no disciplinary cards", () => {
    const res = checkPlayerEligibility({
      player: { playerId: "p1", fullName: "Juan Pérez", status: "active" },
    });

    expect(res.isEligible).toBe(true);
    expect(res.reason).toBeUndefined();
    expect(res.yellowCardCount).toBe(0);
    expect(res.hasRedCardSuspension).toBe(false);
  });

  it("blocks player with administrative suspended status", () => {
    const res = checkPlayerEligibility({
      player: { playerId: "p2", fullName: "Carlos Sancionado", status: "suspended" },
    });

    expect(res.isEligible).toBe(false);
    expect(res.reason).toContain("suspendido");
  });

  it("blocks player with injured or inactive status", () => {
    const injured = checkPlayerEligibility({
      player: { playerId: "p3", fullName: "Luis Lesionado", status: "injured" },
    });
    expect(injured.isEligible).toBe(false);
    expect(injured.reason).toContain("lesión");

    const inactive = checkPlayerEligibility({
      player: { playerId: "p4", fullName: "Pedro Inactivo", status: "inactive" },
    });
    expect(inactive.isEligible).toBe(false);
    expect(inactive.reason).toContain("inactivo");
  });

  it("blocks player when last event in previous match was a red card", () => {
    const events = [
      {
        id: "e1",
        match_id: "prev-match",
        player_id: "p1",
        event_type: "red_card" as const,
        created_at: "2026-05-10T12:00:00Z",
      },
    ];

    const res = checkPlayerEligibility({
      player: { playerId: "p1", fullName: "Juan Expulsado", status: "active" },
      seasonEvents: events,
      currentMatchId: "current-match",
    });

    expect(res.isEligible).toBe(false);
    expect(res.hasRedCardSuspension).toBe(true);
    expect(res.reason).toContain("tarjeta roja");
  });

  it("blocks player when yellow cards reach accumulation threshold of 3", () => {
    const events = [
      { id: "e1", match_id: "m1", player_id: "p1", event_type: "yellow_card" as const, created_at: "2026-05-01T10:00:00Z" },
      { id: "e2", match_id: "m2", player_id: "p1", event_type: "yellow_card" as const, created_at: "2026-05-05T10:00:00Z" },
      { id: "e3", match_id: "m3", player_id: "p1", event_type: "yellow_card" as const, created_at: "2026-05-09T10:00:00Z" },
    ];

    const res = checkPlayerEligibility({
      player: { playerId: "p1", fullName: "Juan Amonestado", status: "active" },
      seasonEvents: events,
      currentMatchId: "m4",
    });

    expect(res.isEligible).toBe(false);
    expect(res.reason).toContain("acumulación de 3 tarjetas amarillas");
  });

  it("provides preventive warning when player is 1 yellow card away from suspension", () => {
    const events = [
      { id: "e1", match_id: "m1", player_id: "p1", event_type: "yellow_card" as const, created_at: "2026-05-01T10:00:00Z" },
      { id: "e2", match_id: "m2", player_id: "p1", event_type: "yellow_card" as const, created_at: "2026-05-05T10:00:00Z" },
    ];

    const res = checkPlayerEligibility({
      player: { playerId: "p1", fullName: "Juan en Riesgo", status: "active" },
      seasonEvents: events,
      currentMatchId: "m3",
    });

    expect(res.isEligible).toBe(true);
    expect(res.warning).toContain("al límite de suspensión");
  });
});
