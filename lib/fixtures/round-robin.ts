export type FixtureTeam = {
  id: string;
  name: string;
};

export type FixtureVenue = {
  id: string;
  name: string;
};

export type GeneratedMatch = {
  round: number;
  homeTeamId: string;
  awayTeamId: string;
  venueId?: string;
  scheduledTime?: string; // ISO string
};

export type RoundRobinConfig = {
  teams: FixtureTeam[];
  venues?: FixtureVenue[];
  twoLegs?: boolean;
  startDate?: string; // YYYY-MM-DD
  timeSlots?: string[]; // ["09:00", "11:00", "13:00"]
  daysBetweenRounds?: number; // default 7 days (weekly)
};

export type GeneratedFixture = {
  totalRounds: number;
  totalMatches: number;
  matches: GeneratedMatch[];
  restingTeamsByRound: Record<number, FixtureTeam>;
};

export function generateRoundRobinFixture(config: RoundRobinConfig): GeneratedFixture {
  const {
    teams,
    venues = [],
    twoLegs = false,
    startDate,
    timeSlots = ["09:00", "11:00", "13:00", "15:00"],
    daysBetweenRounds = 7,
  } = config;

  if (teams.length < 2) {
    return {
      totalRounds: 0,
      totalMatches: 0,
      matches: [],
      restingTeamsByRound: {},
    };
  }

  // Work with a copy of teams
  const teamList = [...teams];
  const isOdd = teamList.length % 2 !== 0;

  // Add dummy team for rest if odd
  const BYE_ID = "__BYE__";
  if (isOdd) {
    teamList.push({ id: BYE_ID, name: "Descanso" });
  }

  const numTeams = teamList.length;
  const numRounds = numTeams - 1;
  const matchesPerRound = numTeams / 2;

  const matches: GeneratedMatch[] = [];
  const restingTeamsByRound: Record<number, FixtureTeam> = {};

  // Generate First Leg (Ida)
  for (let round = 0; round < numRounds; round++) {
    const roundNumber = round + 1;

    for (let matchIdx = 0; matchIdx < matchesPerRound; matchIdx++) {
      const home = (round + matchIdx) % (numTeams - 1);
      let away = (numTeams - 1 - matchIdx + round) % (numTeams - 1);

      // Last team remains fixed at index numTeams - 1
      if (matchIdx === 0) {
        away = numTeams - 1;
      }

      const teamA = teamList[home];
      const teamB = teamList[away];

      // Alternate home/away for the fixed team to maintain balance
      const [homeTeam, awayTeam] = round % 2 === 0 ? [teamA, teamB] : [teamB, teamA];

      if (homeTeam.id === BYE_ID) {
        restingTeamsByRound[roundNumber] = awayTeam;
      } else if (awayTeam.id === BYE_ID) {
        restingTeamsByRound[roundNumber] = homeTeam;
      } else {
        matches.push({
          round: roundNumber,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
        });
      }
    }
  }

  // Generate Second Leg (Vuelta) if requested
  if (twoLegs) {
    const firstLegMatches = [...matches];
    firstLegMatches.forEach((m) => {
      matches.push({
        round: m.round + numRounds,
        homeTeamId: m.awayTeamId,
        awayTeamId: m.homeTeamId,
      });
    });

    Object.entries(restingTeamsByRound).forEach(([roundStr, team]) => {
      restingTeamsByRound[Number(roundStr) + numRounds] = team;
    });
  }

  // Assign dates and venues if provided
  let currentDate = startDate ? new Date(`${startDate}T00:00:00`) : new Date();

  // Sort matches by round
  matches.sort((a, b) => a.round - b.round);

  let currentRound = 1;
  let matchIndexInRound = 0;

  matches.forEach((match) => {
    if (match.round !== currentRound) {
      currentRound = match.round;
      matchIndexInRound = 0;
      currentDate = new Date(currentDate.getTime() + daysBetweenRounds * 24 * 60 * 60 * 1000);
    }

    if (venues.length > 0) {
      match.venueId = venues[matchIndexInRound % venues.length].id;
    }

    const timeSlot = timeSlots[matchIndexInRound % timeSlots.length] || "10:00";
    const [hours, minutes] = timeSlot.split(":").map((v) => parseInt(v, 10));

    const matchDate = new Date(currentDate);
    matchDate.setHours(hours || 10, minutes || 0, 0, 0);
    match.scheduledTime = matchDate.toISOString();

    matchIndexInRound++;
  });

  const totalRounds = twoLegs ? numRounds * 2 : numRounds;

  return {
    totalRounds,
    totalMatches: matches.length,
    matches,
    restingTeamsByRound,
  };
}
