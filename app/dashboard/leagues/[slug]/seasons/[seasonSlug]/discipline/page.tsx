import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, AlertOctagon, CheckCircle2, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";
import { calculateSeasonDiscipline } from "@/lib/discipline/discipline-engine";
import { DisciplineTable } from "@/components/discipline/discipline-table";

interface DisciplinePageProps {
  params: Promise<{ slug: string; seasonSlug: string }>;
}

export default async function SeasonDisciplinePage({ params }: DisciplinePageProps) {
  const { slug, seasonSlug } = await params;
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

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: league.id,
  });

  const { data: season, error: seasonError } = await supabase
    .from("seasons")
    .select("id, name, slug")
    .eq("league_id", league.id)
    .eq("slug", seasonSlug)
    .single();

  if (seasonError || !season) {
    notFound();
  }

  // Fetch matches of the season
  const { data: matches } = await supabase
    .from("matches")
    .select("id, scheduled_at, status")
    .eq("league_id", league.id)
    .eq("season_id", season.id);

  const matchIds = (matches || []).map((m) => m.id);

  // Fetch card events in this season
  let events: any[] = [];
  if (matchIds.length > 0) {
    const { data: eventsData } = await supabase
      .from("match_events")
      .select("id, match_id, player_id, team_id, event_type, created_at")
      .in("match_id", matchIds)
      .in("event_type", ["yellow_card", "red_card"]);

    events = eventsData || [];
  }

  // Fetch registrations in this season
  const { data: registrations } = await supabase
    .from("player_team_registrations")
    .select("id, player_id, team_id, jersey_number, status")
    .eq("league_id", league.id)
    .eq("season_id", season.id);

  const playerIds = [...new Set((registrations || []).map((r) => r.player_id))];
  const teamIds = [...new Set((registrations || []).map((r) => r.team_id))];

  // Fetch players and teams maps
  const [{ data: playersData }, { data: teamsData }] = await Promise.all([
    playerIds.length > 0
      ? supabase
          .from("players")
          .select("id, full_name, status")
          .in("id", playerIds)
      : Promise.resolve({ data: [] }),
    teamIds.length > 0
      ? supabase
          .from("teams")
          .select("id, name")
          .in("id", teamIds)
      : Promise.resolve({ data: [] }),
  ]);

  const playersMap = new Map((playersData || []).map((p) => [p.id, p]));
  const teamsMap = new Map((teamsData || []).map((t) => [t.id, t]));

  const summary = calculateSeasonDiscipline({
    matches: matches || [],
    events: events || [],
    registrations: registrations || [],
    playersMap,
    teamsMap,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Control Disciplinario: ${season.name}`}
        description={`Sanciones automáticas por tarjetas acumuladas y suspensiones en ${league.name}.`}
        action={
          <Link
            href={`/dashboard/leagues/${slug}/seasons/${seasonSlug}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la Temporada
          </Link>
        }
      />

      {/* Disciplinary KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Tarjetas Amarillas
            </span>
            <span className="h-3 w-3 rounded-full bg-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-white font-mono">{summary.totalYellowCards}</p>
          <span className="text-[11px] text-zinc-500">Acumuladas en {season.name}</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Tarjetas Rojas
            </span>
            <span className="h-3 w-3 rounded-full bg-red-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-white font-mono">{summary.totalRedCards}</p>
          <span className="text-[11px] text-zinc-500">Expulsiones directas</span>
        </div>

        <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-red-300">
              Suspendidos Activos
            </span>
            <AlertOctagon className="h-4 w-4 text-red-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-red-400 font-mono">
            {summary.currentlySuspendedCount}
          </p>
          <span className="text-[11px] text-red-300/70">Inhabilitados para próxima jornada</span>
        </div>

        <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Al Límite (2 Amarillas)
            </span>
            <ShieldAlert className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-400 font-mono">
            {summary.playersAtRiskCount}
          </p>
          <span className="text-[11px] text-amber-300/70">En riesgo de suspensión</span>
        </div>
      </div>

      {/* Disciplinary Table */}
      <DisciplineTable
        leagueSlug={slug}
        seasonSlug={seasonSlug}
        initialRecords={summary.playerRecords}
        canManage={permissions.canManageLeague}
      />
    </div>
  );
}
