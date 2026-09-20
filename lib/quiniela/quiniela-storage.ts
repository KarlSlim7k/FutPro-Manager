export interface SavedPrediction {
  matchId: string;
  homeScore: number;
  awayScore: number;
  updatedAt: string;
}

export function getStoredPredictions(leagueSlug: string): Record<string, SavedPrediction> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(`futpro_quiniela_${leagueSlug}`);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveStoredPrediction(
  leagueSlug: string,
  matchId: string,
  homeScore: number,
  awayScore: number
): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredPredictions(leagueSlug);
    current[matchId] = {
      matchId,
      homeScore,
      awayScore,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(`futpro_quiniela_${leagueSlug}`, JSON.stringify(current));
  } catch {
    // ignore error
  }
}
