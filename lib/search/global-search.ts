import type { SupabaseClient } from "@supabase/supabase-js";

export interface GlobalSearchLeagueItem {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

export interface GlobalSearchTeamItem {
  id: string;
  name: string;
  slug: string;
  leagueSlug: string;
  leagueName: string;
  logoUrl?: string | null;
}

export interface GlobalSearchPlayerItem {
  id: string;
  fullName: string;
  position?: string | null;
  leagueSlug?: string;
  leagueName?: string;
}

export interface GlobalSearchResult {
  leagues: GlobalSearchLeagueItem[];
  teams: GlobalSearchTeamItem[];
  players: GlobalSearchPlayerItem[];
}

export async function performGlobalSearch(
  supabase: SupabaseClient,
  query: string,
  limitPerCategory = 5
): Promise<GlobalSearchResult> {
  const sanitized = query.trim();
  if (!sanitized || sanitized.length < 2) {
    return { leagues: [], teams: [], players: [] };
  }

  const pattern = `%${sanitized}%`;

  // 1. Search public active leagues
  const leaguesPromise = supabase
    .from("leagues")
    .select("id, name, slug, logo_url")
    .eq("is_public", true)
    .eq("status", "active")
    .ilike("name", pattern)
    .limit(limitPerCategory);

  // 2. Search teams
  const teamsPromise = supabase
    .from("teams")
    .select(`
      id,
      name,
      slug,
      logo_url,
      league:leagues!inner(name, slug, is_public, status)
    `)
    .eq("leagues.is_public", true)
    .eq("leagues.status", "active")
    .ilike("name", pattern)
    .limit(limitPerCategory);

  // 3. Search players
  const playersPromise = supabase
    .from("players")
    .select(`
      id,
      full_name,
      preferred_position,
      league:leagues!inner(name, slug, is_public, status)
    `)
    .eq("leagues.is_public", true)
    .eq("leagues.status", "active")
    .ilike("full_name", pattern)
    .limit(limitPerCategory);

  const [leaguesRes, teamsRes, playersRes] = await Promise.all([
    leaguesPromise,
    teamsPromise,
    playersPromise,
  ]);

  const leagues: GlobalSearchLeagueItem[] = (leaguesRes.data ?? []).map((l: any) => ({
    id: l.id,
    name: l.name,
    slug: l.slug,
    logoUrl: l.logo_url,
  }));

  const teams: GlobalSearchTeamItem[] = (teamsRes.data ?? []).map((t: any) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    leagueSlug: t.league?.slug ?? "",
    leagueName: t.league?.name ?? "",
    logoUrl: t.logo_url,
  }));

  const players: GlobalSearchPlayerItem[] = (playersRes.data ?? []).map((p: any) => ({
    id: p.id,
    fullName: p.full_name,
    position: p.preferred_position,
    leagueSlug: p.league?.slug ?? "",
    leagueName: p.league?.name ?? "",
  }));

  return { leagues, teams, players };
}
