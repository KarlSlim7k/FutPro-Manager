import { describe, expect, it } from "vitest";
import { generateRoundRobinFixture, type FixtureTeam, type FixtureVenue } from "./round-robin";
import { detectFixtureConflicts } from "./detect-conflicts";

describe("Round Robin Fixture Generator", () => {
  const teams4: FixtureTeam[] = [
    { id: "team-1", name: "Águilas" },
    { id: "team-2", name: "Tigres" },
    { id: "team-3", name: "Pumas" },
    { id: "team-4", name: "Chivas" },
  ];

  it("generates correct number of rounds and matches for even teams (single leg)", () => {
    const fixture = generateRoundRobinFixture({
      teams: teams4,
      twoLegs: false,
    });

    expect(fixture.totalRounds).toBe(3); // 4 - 1 = 3
    expect(fixture.totalMatches).toBe(6); // 4 * 3 / 2 = 6
    expect(Object.keys(fixture.restingTeamsByRound)).toHaveLength(0);

    // Each team should appear exactly 3 times
    const teamCounts: Record<string, number> = {};
    fixture.matches.forEach((m) => {
      teamCounts[m.homeTeamId] = (teamCounts[m.homeTeamId] || 0) + 1;
      teamCounts[m.awayTeamId] = (teamCounts[m.awayTeamId] || 0) + 1;
    });

    expect(teamCounts["team-1"]).toBe(3);
    expect(teamCounts["team-2"]).toBe(3);
    expect(teamCounts["team-3"]).toBe(3);
    expect(teamCounts["team-4"]).toBe(3);
  });

  it("handles odd number of teams with a resting team per round", () => {
    const teams5: FixtureTeam[] = [
      ...teams4,
      { id: "team-5", name: "Cruz Azul" },
    ];

    const fixture = generateRoundRobinFixture({
      teams: teams5,
      twoLegs: false,
    });

    expect(fixture.totalRounds).toBe(5);
    expect(fixture.totalMatches).toBe(10); // 5 teams * 4 games / 2 = 10 matches
    expect(Object.keys(fixture.restingTeamsByRound)).toHaveLength(5);

    // Verify all 5 teams rest once
    const restingTeamIds = Object.values(fixture.restingTeamsByRound).map((t) => t.id);
    expect(new Set(restingTeamIds).size).toBe(5);
  });

  it("doubles matches and inverts local/away for two-leg tournament", () => {
    const fixture = generateRoundRobinFixture({
      teams: teams4,
      twoLegs: true,
    });

    expect(fixture.totalRounds).toBe(6);
    expect(fixture.totalMatches).toBe(12);

    // Check round 1 match vs round 4 match
    const r1 = fixture.matches.filter((m) => m.round === 1);
    const r4 = fixture.matches.filter((m) => m.round === 4);

    const firstMatch = r1[0];
    const inverted = r4.find(
      (m) => m.homeTeamId === firstMatch.awayTeamId && m.awayTeamId === firstMatch.homeTeamId
    );
    expect(inverted).toBeDefined();
  });

  it("assigns scheduled dates and times properly", () => {
    const venues: FixtureVenue[] = [
      { id: "venue-1", name: "Estadio Municipal" },
      { id: "venue-2", name: "Cancha Los Pinos" },
    ];

    const fixture = generateRoundRobinFixture({
      teams: teams4,
      venues,
      startDate: "2026-10-04",
      timeSlots: ["10:00", "12:00"],
    });

    expect(fixture.matches[0].scheduledTime).toBeDefined();
    expect(fixture.matches[0].venueId).toBe("venue-1");
    expect(fixture.matches[1].venueId).toBe("venue-2");
  });
});

describe("Schedule Conflict Detector", () => {
  const teamsMap = new Map<string, FixtureTeam>([
    ["t1", { id: "t1", name: "Tigres" }],
    ["t2", { id: "t2", name: "Pumas" }],
    ["t3", { id: "t3", name: "León" }],
    ["t4", { id: "t4", name: "Atlas" }],
  ]);

  const venuesMap = new Map<string, FixtureVenue>([
    ["v1", { id: "v1", name: "Cancha 1" }],
    ["v2", { id: "v2", name: "Cancha 2" }],
  ]);

  it("detects venue overlap when two matches are scheduled on the same pitch at the same time", () => {
    const matches = [
      {
        round: 1,
        homeTeamId: "t1",
        awayTeamId: "t2",
        venueId: "v1",
        scheduledTime: "2026-10-04T10:00:00.000Z",
      },
      {
        round: 1,
        homeTeamId: "t3",
        awayTeamId: "t4",
        venueId: "v1", // same venue at overlapping time
        scheduledTime: "2026-10-04T10:30:00.000Z",
      },
    ];

    const conflicts = detectFixtureConflicts(matches, teamsMap, venuesMap, 90);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].type).toBe("venue_overlap");
    expect(conflicts[0].message).toContain("Cancha 1");
  });

  it("detects team double booking if same team plays overlapping games", () => {
    const matches = [
      {
        round: 1,
        homeTeamId: "t1",
        awayTeamId: "t2",
        venueId: "v1",
        scheduledTime: "2026-10-04T10:00:00.000Z",
      },
      {
        round: 1,
        homeTeamId: "t1", // t1 scheduled again
        awayTeamId: "t3",
        venueId: "v2",
        scheduledTime: "2026-10-04T10:30:00.000Z",
      },
    ];

    const conflicts = detectFixtureConflicts(matches, teamsMap, venuesMap, 90);
    expect(conflicts.some((c) => c.type === "team_double_booking")).toBe(true);
  });

  it("returns empty conflicts when games are sufficiently spaced in time", () => {
    const matches = [
      {
        round: 1,
        homeTeamId: "t1",
        awayTeamId: "t2",
        venueId: "v1",
        scheduledTime: "2026-10-04T10:00:00.000Z",
      },
      {
        round: 1,
        homeTeamId: "t3",
        awayTeamId: "t4",
        venueId: "v1",
        scheduledTime: "2026-10-04T12:00:00.000Z", // 2 hours later
      },
    ];

    const conflicts = detectFixtureConflicts(matches, teamsMap, venuesMap, 90);
    expect(conflicts).toHaveLength(0);
  });
});
