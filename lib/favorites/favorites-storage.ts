export interface FavoriteTeam {
  id: string;
  name: string;
  slug: string;
  leagueSlug: string;
  leagueName?: string;
  logoUrl?: string | null;
}

const STORAGE_KEY = "futpro_favorite_teams";
export const FAVORITES_EVENT = "futpro_favorites_updated";

export function getFavoriteTeams(): FavoriteTeam[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isFavoriteTeam(teamId: string): boolean {
  if (typeof window === "undefined") return false;
  const favorites = getFavoriteTeams();
  return favorites.some((f) => f.id === teamId);
}

export function toggleFavoriteTeam(team: FavoriteTeam): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getFavoriteTeams();
    const exists = current.some((f) => f.id === team.id);
    let updated: FavoriteTeam[];

    if (exists) {
      updated = current.filter((f) => f.id !== team.id);
    } else {
      updated = [...current, team];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(FAVORITES_EVENT, { detail: updated }));
    return !exists;
  } catch {
    return false;
  }
}

export function removeFavoriteTeam(teamId: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getFavoriteTeams();
    const updated = current.filter((f) => f.id !== teamId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(FAVORITES_EVENT, { detail: updated }));
  } catch {
    // ignore error
  }
}
