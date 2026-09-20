export type PlayerAppearance = {
  matchId: string;
  isStarter: boolean;
  minuteIn?: number | null; // e.g. 0 if starter, or 65 if entered as sub
  minuteOut?: number | null; // e.g. 75 if subbed off or red card
  totalMatchMinutes?: number; // default 90
};

export type PlayerMinutesResult = {
  matchesPlayed: number;
  matchesStarted: number;
  matchesAsSub: number;
  totalMinutesPlayed: number;
  averageMinutesPerMatch: number;
  goalsScored: number;
  minutesPerGoal: number | null; // null if 0 goals
};

export function calculatePlayerMinutes({
  appearances,
  goalsScored = 0,
  defaultMatchDuration = 90,
}: {
  appearances: PlayerAppearance[];
  goalsScored?: number;
  defaultMatchDuration?: number;
}): PlayerMinutesResult {
  let started = 0;
  let sub = 0;
  let totalMinutes = 0;

  appearances.forEach((app) => {
    const duration = app.totalMatchMinutes ?? defaultMatchDuration;
    const minIn = app.isStarter ? 0 : (app.minuteIn ?? duration);
    const minOut = app.minuteOut ?? duration;

    // Calculate actual elapsed minutes
    const playedInMatch = Math.max(0, Math.min(duration, minOut) - Math.max(0, minIn));
    totalMinutes += playedInMatch;

    if (app.isStarter) {
      started++;
    } else if (playedInMatch > 0) {
      sub++;
    }
  });

  const matchesPlayed = started + sub;
  const averageMinutesPerMatch =
    matchesPlayed > 0 ? Math.round((totalMinutes / matchesPlayed) * 10) / 10 : 0;

  const minutesPerGoal =
    goalsScored > 0 ? Math.round((totalMinutes / goalsScored) * 10) / 10 : null;

  return {
    matchesPlayed,
    matchesStarted: started,
    matchesAsSub: sub,
    totalMinutesPlayed: totalMinutes,
    averageMinutesPerMatch,
    goalsScored,
    minutesPerGoal,
  };
}
