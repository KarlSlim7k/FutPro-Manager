import type { GeneratedMatch, FixtureTeam, FixtureVenue } from "./round-robin";

export type ScheduleConflict = {
  type: "venue_overlap" | "team_double_booking";
  round: number;
  message: string;
  matchIndexA: number;
  matchIndexB: number;
};

export function detectFixtureConflicts(
  matches: GeneratedMatch[],
  teamsMap: Map<string, FixtureTeam>,
  venuesMap: Map<string, FixtureVenue>,
  matchDurationMinutes: number = 90
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];

  for (let i = 0; i < matches.length; i++) {
    const matchA = matches[i];
    if (!matchA.scheduledTime) continue;

    const timeA = new Date(matchA.scheduledTime).getTime();
    const endA = timeA + matchDurationMinutes * 60 * 1000;

    for (let j = i + 1; j < matches.length; j++) {
      const matchB = matches[j];
      if (!matchB.scheduledTime) continue;

      const timeB = new Date(matchB.scheduledTime).getTime();
      const endB = timeB + matchDurationMinutes * 60 * 1000;

      // Check if intervals overlap: (startA < endB && endA > startB)
      const timesOverlap = timeA < endB && endA > timeB;

      if (timesOverlap) {
        // 1. Check venue overlap
        if (matchA.venueId && matchB.venueId && matchA.venueId === matchB.venueId) {
          const venue = venuesMap.get(matchA.venueId)?.name || "Cancha compartida";
          conflicts.push({
            type: "venue_overlap",
            round: matchA.round,
            message: `Conflicto de sede en '${venue}': dos partidos programados al mismo tiempo en la Jornada ${matchA.round}.`,
            matchIndexA: i,
            matchIndexB: j,
          });
        }

        // 2. Check team overlap
        const teamsA = [matchA.homeTeamId, matchA.awayTeamId];
        const teamsB = [matchB.homeTeamId, matchB.awayTeamId];
        const overlappingTeamId = teamsA.find((t) => teamsB.includes(t));

        if (overlappingTeamId) {
          const teamName = teamsMap.get(overlappingTeamId)?.name || "Equipo";
          conflicts.push({
            type: "team_double_booking",
            round: matchA.round,
            message: `Empalme de horario para '${teamName}': programado para jugar dos veces en horarios superpuestos.`,
            matchIndexA: i,
            matchIndexB: j,
          });
        }
      }
    }
  }

  return conflicts;
}
