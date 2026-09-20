import { NextRequest, NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { getPublicLeagueBySlug } from "@/lib/leagues/get-public-league";
import { generateIcsCalendar, type IcsMatchItem } from "@/lib/calendar/generate-ics";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string; teamSlug: string }> }
) {
  const { slug, teamSlug } = await context.params;
  const league = await getPublicLeagueBySlug(slug);

  if (!league) {
    return new NextResponse("Liga no encontrada", { status: 404 });
  }

  const supabase = createPublicClient();

  // Find the team
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id, name, slug")
    .eq("league_id", league.id)
    .eq("slug", teamSlug)
    .maybeSingle();

  if (teamError || !team) {
    return new NextResponse("Equipo no encontrado", { status: 404 });
  }

  // Fetch all league teams and venues to map names
  const [{ data: teams }, { data: venues }] = await Promise.all([
    supabase.from("teams").select("id, name").eq("league_id", league.id),
    supabase.from("venues").select("id, name, address").eq("league_id", league.id),
  ]);

  const teamMap = new Map((teams ?? []).map((t) => [t.id, t.name]));
  const venueMap = new Map(
    (venues ?? []).map((v) => [v.id, { name: v.name, address: v.address }])
  );

  // Fetch matches where this team is home or away
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select("id, scheduled_at, status, round_name, home_team_id, away_team_id, venue_id")
    .eq("league_id", league.id)
    .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
    .order("scheduled_at", { ascending: true });

  if (matchesError || !matches) {
    return new NextResponse("Error al consultar partidos del equipo", { status: 500 });
  }

  const origin = request.nextUrl.origin || "https://futpro-manager.com";

  const icsMatches: IcsMatchItem[] = matches.map((m) => {
    const venue = m.venue_id ? venueMap.get(m.venue_id) : undefined;
    return {
      id: m.id,
      homeTeam: teamMap.get(m.home_team_id) ?? "Equipo Local",
      awayTeam: teamMap.get(m.away_team_id) ?? "Equipo Visitante",
      scheduledAt: m.scheduled_at,
      leagueName: league.name,
      roundName: m.round_name,
      venueName: venue?.name,
      venueAddress: venue?.address,
      status: m.status,
      matchUrl: `${origin}/liga/${league.slug}/matches/${m.id}`,
    };
  });

  const icsContent = generateIcsCalendar({
    calendarName: `${team.name} — ${league.name}`,
    matches: icsMatches,
    leagueSlug: league.slug,
  });

  return new NextResponse(icsContent, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${team.slug}-calendario.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
