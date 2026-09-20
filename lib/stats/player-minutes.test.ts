import { describe, expect, it } from "vitest";
import { calculatePlayerMinutes, type PlayerAppearance } from "./player-minutes";

describe("Player Minutes Calculation", () => {
  it("calculates minutes for full starter matches", () => {
    const appearances: PlayerAppearance[] = [
      { matchId: "m1", isStarter: true }, // 90 min
      { matchId: "m2", isStarter: true }, // 90 min
    ];

    const result = calculatePlayerMinutes({
      appearances,
      goalsScored: 2,
    });

    expect(result.matchesPlayed).toBe(2);
    expect(result.matchesStarted).toBe(2);
    expect(result.matchesAsSub).toBe(0);
    expect(result.totalMinutesPlayed).toBe(180);
    expect(result.averageMinutesPerMatch).toBe(90);
    expect(result.minutesPerGoal).toBe(90);
  });

  it("handles substitutions in and substitutions out correctly", () => {
    const appearances: PlayerAppearance[] = [
      { matchId: "m1", isStarter: true, minuteOut: 60 }, // started, subbed out at 60 -> 60 min
      { matchId: "m2", isStarter: false, minuteIn: 70 }, // entered at 70 -> 20 min
    ];

    const result = calculatePlayerMinutes({
      appearances,
      goalsScored: 1,
    });

    expect(result.matchesPlayed).toBe(2);
    expect(result.matchesStarted).toBe(1);
    expect(result.matchesAsSub).toBe(1);
    expect(result.totalMinutesPlayed).toBe(80); // 60 + 20
    expect(result.averageMinutesPerMatch).toBe(40);
    expect(result.minutesPerGoal).toBe(80);
  });

  it("returns null for minutesPerGoal when player has not scored", () => {
    const appearances: PlayerAppearance[] = [{ matchId: "m1", isStarter: true }];

    const result = calculatePlayerMinutes({
      appearances,
      goalsScored: 0,
    });

    expect(result.totalMinutesPlayed).toBe(90);
    expect(result.goalsScored).toBe(0);
    expect(result.minutesPerGoal).toBeNull();
  });
});
