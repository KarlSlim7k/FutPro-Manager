export type DisciplinaryRuleConfig = {
  yellowCardThreshold: number; // default 3
  yellowSuspensionMatches: number; // default 1
  redSuspensionMatches: number; // default 1
};

export const DEFAULT_DISCIPLINARY_RULES: DisciplinaryRuleConfig = {
  yellowCardThreshold: 3,
  yellowSuspensionMatches: 1,
  redSuspensionMatches: 1,
};

export type PlayerCardRecord = {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  jerseyNumber?: number | null;
  yellowCardsTotal: number;
  redCardsTotal: number;
  activeYellowCycle: number; // current accumulation towards next suspension
  isSuspended: boolean;
  suspensionReason?: string;
  warningNotice?: string;
  matchesToServe: number;
  matchesServed: number;
};

export type SeasonDisciplineSummary = {
  totalYellowCards: number;
  totalRedCards: number;
  currentlySuspendedCount: number;
  playersAtRiskCount: number; // 1 card away from suspension
  playerRecords: PlayerCardRecord[];
};

export function calculateSeasonDiscipline({
  matches,
  events,
  registrations,
  playersMap,
  teamsMap,
  rules = DEFAULT_DISCIPLINARY_RULES,
}: {
  matches: Array<{ id: string; scheduled_at: string; status: string }>;
  events: Array<{
    id: string;
    match_id: string;
    player_id: string | null;
    team_id: string | null;
    event_type: string;
    created_at: string;
  }>;
  registrations: Array<{
    id: string;
    player_id: string;
    team_id: string;
    jersey_number?: number | null;
    status: string;
  }>;
  playersMap: Map<string, { id: string; full_name: string; status: string }>;
  teamsMap: Map<string, { id: string; name: string }>;
  rules?: DisciplinaryRuleConfig;
}): SeasonDisciplineSummary {
  // Sort completed matches chronologically
  const completedMatches = [...matches]
    .filter((m) => m.status === "completed")
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const matchOrderMap = new Map<string, number>();
  completedMatches.forEach((m, idx) => matchOrderMap.set(m.id, idx));

  // Sort card events chronologically
  const cardEvents = events
    .filter((e) => e.player_id && (e.event_type === "yellow_card" || e.event_type === "red_card"))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Group events by player
  const playerEventsMap = new Map<string, typeof cardEvents>();
  cardEvents.forEach((ev) => {
    if (!ev.player_id) return;
    const existing = playerEventsMap.get(ev.player_id) || [];
    existing.push(ev);
    playerEventsMap.set(ev.player_id, existing);
  });

  const playerRecords: PlayerCardRecord[] = [];
  let totalYellows = 0;
  let totalReds = 0;
  let currentlySuspended = 0;
  let atRiskCount = 0;

  registrations.forEach((reg) => {
    const player = playersMap.get(reg.player_id);
    const team = teamsMap.get(reg.team_id);
    const playerName = player?.full_name || "Jugador";
    const teamName = team?.name || "Equipo";

    const pEvents = playerEventsMap.get(reg.player_id) || [];
    const yellows = pEvents.filter((e) => e.event_type === "yellow_card");
    const reds = pEvents.filter((e) => e.event_type === "red_card");

    totalYellows += yellows.length;
    totalReds += reds.length;

    // Simulation of card cycle
    let activeYellowCycle = 0;
    let isSuspended = reg.status === "suspended" || player?.status === "suspended";
    let suspensionReason: string | undefined = isSuspended ? "Suspensión administrativa activa" : undefined;
    let matchesToServe = 0;
    let matchesServed = 0;

    // Check card triggers
    pEvents.forEach((ev) => {
      if (ev.event_type === "yellow_card") {
        activeYellowCycle++;
        if (activeYellowCycle >= rules.yellowCardThreshold) {
          activeYellowCycle = 0; // resets cycle after suspension trigger
          matchesToServe += rules.yellowSuspensionMatches;
          isSuspended = true;
          suspensionReason = `Acumulación de ${rules.yellowCardThreshold} tarjetas amarillas`;
        }
      } else if (ev.event_type === "red_card") {
        matchesToServe += rules.redSuspensionMatches;
        isSuspended = true;
        suspensionReason = "Tarjeta roja directa / expulsión reglamentaria";
      }
    });

    // Warning detection (1 card away from threshold)
    let warningNotice: string | undefined;
    if (!isSuspended && activeYellowCycle === rules.yellowCardThreshold - 1) {
      warningNotice = `Al límite: acumula ${activeYellowCycle} tarjetas amarillas. Una más causará suspensión.`;
      atRiskCount++;
    }

    if (isSuspended) {
      currentlySuspended++;
    }

    playerRecords.push({
      playerId: reg.player_id,
      playerName,
      teamId: reg.team_id,
      teamName,
      jerseyNumber: reg.jersey_number,
      yellowCardsTotal: yellows.length,
      redCardsTotal: reds.length,
      activeYellowCycle,
      isSuspended,
      suspensionReason,
      warningNotice,
      matchesToServe,
      matchesServed,
    });
  });

  // Sort records: suspended first, then at risk, then by yellow cards desc
  playerRecords.sort((a, b) => {
    if (a.isSuspended !== b.isSuspended) return a.isSuspended ? -1 : 1;
    if (b.yellowCardsTotal !== a.yellowCardsTotal) return b.yellowCardsTotal - a.yellowCardsTotal;
    return b.redCardsTotal - a.redCardsTotal;
  });

  return {
    totalYellowCards: totalYellows,
    totalRedCards: totalReds,
    currentlySuspendedCount: currentlySuspended,
    playersAtRiskCount: atRiskCount,
    playerRecords,
  };
}
