import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { MatchCallupManager, type MatchOption } from "@/components/teams/match-callup-manager";
import { createClient } from "@/lib/supabase/server";
import { getLeaguePermissions, isTeamStaff } from "@/lib/permissions/league-permissions";

interface TeamCallupsPageProps {
  params: Promise<{ slug: string; teamSlug: string }>;
}

export default async function TeamCallupsPage({ params }: TeamCallupsPageProps) {
  const { slug, teamSlug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: league, error: leagueError } = await supabase
    .from("leagues")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();

  if (leagueError || !league) {
    notFound();
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id, name, slug, primary_color, secondary_color")
    .eq("league_id", league.id)
    .eq("slug", teamSlug)
    .single();

  if (teamError || !team) {
    notFound();
  }

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: league.id,
  });

  const isStaff = isTeamStaff(permissions, team.id);
  if (!isStaff && !permissions.canManageLeague) {
    redirect(`/dashboard/leagues/${slug}/teams/${teamSlug}`);
  }

  // Fetch upcoming matches for this team
  const { data: matchesData } = await supabase
    .from("matches")
    .select(`
      id,
      round_name,
      scheduled_at,
      home_team_id,
      away_team_id,
      venues (name)
    `)
    .eq("league_id", league.id)
    .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
    .in("status", ["scheduled", "in_progress"])
    .order("scheduled_at", { ascending: true })
    .limit(10);

  // Fetch team opponent names
  const opponentIds = [
    ...new Set(
      (matchesData || []).map((m) =>
        m.home_team_id === team.id ? m.away_team_id : m.home_team_id
      )
    ),
  ];

  let opponentMap = new Map<string, string>();
  if (opponentIds.length > 0) {
    const { data: opponents } = await supabase
      .from("teams")
      .select("id, name")
      .in("id", opponentIds);

    opponentMap = new Map((opponents || []).map((o) => [o.id, o.name]));
  }

  const upcomingMatches: MatchOption[] = (matchesData || []).map((m: any) => {
    const isHome = m.home_team_id === team.id;
    const opponentId = isHome ? m.away_team_id : m.home_team_id;
    return {
      id: m.id,
      opponentName: opponentMap.get(opponentId) || "Rival",
      roundName: m.round_name || "Partido",
      scheduledAt: m.scheduled_at,
      venueName: m.venues?.name || null,
      isHome,
    };
  });

  // Fetch active roster players
  const { data: registrations } = await supabase
    .from("player_team_registrations")
    .select(`
      id,
      jersey_number,
      players!inner (
        id,
        full_name,
        preferred_position
      )
    `)
    .eq("team_id", team.id)
    .eq("status", "active");

  const rosterPlayers = (registrations || []).map((r: any) => ({
    id: r.players.id,
    full_name: r.players.full_name,
    preferred_number: r.jersey_number,
    preferred_position: r.players.preferred_position,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Convocatoria de Partido: ${team.name}`}
        description={`Cita a tu nómina de jugadores y comparte el llamado oficial por WhatsApp.`}
        action={
          <Link
            href={`/dashboard/leagues/${slug}/teams/${teamSlug}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Equipo
          </Link>
        }
      />

      <MatchCallupManager
        teamName={team.name}
        primaryColor={team.primary_color}
        secondaryColor={team.secondary_color}
        upcomingMatches={upcomingMatches}
        rosterPlayers={rosterPlayers}
      />
    </div>
  );
}
