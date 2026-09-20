import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { TeamCooperachaManager } from "@/components/teams/team-cooperacha-manager";
import { createClient } from "@/lib/supabase/server";
import { getLeaguePermissions, isTeamStaff } from "@/lib/permissions/league-permissions";

interface TeamCooperachaPageProps {
  params: Promise<{ slug: string; teamSlug: string }>;
}

export default async function TeamCooperachaPage({ params }: TeamCooperachaPageProps) {
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
    .select("id, name, slug")
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

  // Fetch players enrolled in this team
  const { data: registrations } = await supabase
    .from("player_team_registrations")
    .select(`
      id,
      jersey_number,
      players!inner (
        id,
        full_name
      )
    `)
    .eq("team_id", team.id)
    .eq("status", "active");

  const players = (registrations || []).map((r: any) => ({
    id: r.players.id,
    full_name: r.players.full_name,
    preferred_number: r.jersey_number,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Control de Cooperachas: ${team.name}`}
        description={`Registro de pagos de arbitraje y gastos semanales de ${team.name}.`}
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

      <TeamCooperachaManager teamName={team.name} players={players} />
    </div>
  );
}
