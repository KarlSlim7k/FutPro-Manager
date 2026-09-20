import {
  type MetricCardProps,
  MetricCard,
} from "@/components/ui/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextLink } from "@/components/ui/text-link";
import { PageHeader } from "@/components/ui/page-header";
import { MatchStatusBadge } from "@/components/matches/match-status-badge";
import { DashboardTrendsChart } from "@/components/dashboard/dashboard-trends-chart";
import { PlatformMetricsCard } from "@/components/dashboard/platform-metrics-card";
import { createClient } from "@/lib/supabase/server";
import type { MatchStatus } from "@/types/database";

function buildCards(
  leaguesCount: number,
  teamsCount: number,
  playersCount: number,
  upcomingMatchesCount: number
): MetricCardProps[] {
  return [
    {
      label: "Ligas activas",
      value: String(leaguesCount),
      description: "Organiza torneos, jornadas y estado competitivo.",
    },
    {
      label: "Equipos registrados",
      value: String(teamsCount),
      description: "Controla plantillas y cuerpo técnico por equipo.",
    },
    {
      label: "Jugadores",
      value: String(playersCount),
      description: "Consolida fichas, dorsales y estatus de jugadores.",
    },
    {
      label: "Partidos próximos",
      value: String(upcomingMatchesCount),
      description: "Visualiza programación y próximos encuentros.",
    },
  ];
}

function getPastDateIso(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const now = new Date().toISOString();
  const [
    { count: leaguesCount, error: leaguesError },
    { count: teamsCount, error: teamsError },
    { count: playersCount, error: playersError },
    { count: upcomingMatchesCount, error: matchesError },
  ] = await Promise.all([
    supabase.from("leagues").select("id", { count: "exact", head: true }),
    supabase.from("teams").select("id", { count: "exact", head: true }),
    supabase.from("players").select("id", { count: "exact", head: true }),
    supabase
      .from("matches")
      .select("id", { count: "exact", head: true })
      .eq("status", "scheduled")
      .gte("scheduled_at", now),
  ]);

  if (leaguesError) {
    throw leaguesError;
  }

  if (teamsError) {
    throw teamsError;
  }

  if (playersError) {
    throw playersError;
  }

  // Fallback a cero si el conteo de próximos falla
  const safeUpcomingMatchesCount = matchesError ? 0 : (upcomingMatchesCount ?? 0);

  const cards = buildCards(leaguesCount ?? 0, teamsCount ?? 0, playersCount ?? 0, safeUpcomingMatchesCount);

  // Consultas de tendencias y métricas de competición
  const [
    { data: allMatchesData },
    { data: matchEventsData },
  ] = await Promise.all([
    supabase
      .from("matches")
      .select("id, status, home_score, away_score, round_name, scheduled_at")
      .order("scheduled_at", { ascending: false })
      .limit(100),
    supabase
      .from("match_events")
      .select("event_type")
      .in("event_type", ["yellow_card", "red_card"])
      .limit(500),
  ]);

  const allMatches = allMatchesData ?? [];
  const statusCounts = {
    completed: 0,
    in_progress: 0,
    scheduled: 0,
    cancelled: 0,
    postponed: 0,
  };
  let totalGoals = 0;
  const roundsMap = new Map<string, { matchesCount: number; goalsCount: number }>();

  for (const m of allMatches) {
    if (m.status in statusCounts) {
      statusCounts[m.status as keyof typeof statusCounts]++;
    }
    if (m.status === "completed") {
      totalGoals += (m.home_score || 0) + (m.away_score || 0);
    }
    const round = m.round_name || "General";
    const existing = roundsMap.get(round) || { matchesCount: 0, goalsCount: 0 };
    existing.matchesCount++;
    if (m.status === "completed") {
      existing.goalsCount += (m.home_score || 0) + (m.away_score || 0);
    }
    roundsMap.set(round, existing);
  }

  const averageGoalsPerMatch =
    statusCounts.completed > 0 ? totalGoals / statusCounts.completed : 0;

  let totalYellowCards = 0;
  let totalRedCards = 0;
  for (const ev of matchEventsData ?? []) {
    if (ev.event_type === "yellow_card") totalYellowCards++;
    if (ev.event_type === "red_card") totalRedCards++;
  }

  const roundTrends = Array.from(roundsMap.entries())
    .slice(0, 8)
    .map(([roundName, data]) => ({
      roundName,
      matchesCount: data.matchesCount,
      goalsCount: data.goalsCount,
    }));

  // Widgets operativos: próximos partidos y actividad reciente (best-effort, RLS mediante)
  const { data: upcomingMatches } = await supabase
    .from("matches")
    .select("id, league_id, scheduled_at, status, home_team_id, away_team_id")
    .eq("status", "scheduled")
    .gte("scheduled_at", now)
    .order("scheduled_at", { ascending: true })
    .limit(5);

  const upcoming = upcomingMatches ?? [];
  const upcomingLeagueIds = [...new Set(upcoming.map((m) => m.league_id))];
  const upcomingTeamIds = [...new Set(upcoming.flatMap((m) => [m.home_team_id, m.away_team_id]))];

  let leagueNames = new Map<string, string>();
  let teamNames = new Map<string, string>();
  if (upcomingLeagueIds.length > 0) {
    const { data: leagueRows } = await supabase.from("leagues").select("id, name").in("id", upcomingLeagueIds);
    if (leagueRows) leagueNames = new Map(leagueRows.map((l) => [l.id, l.name]));
  }
  if (upcomingTeamIds.length > 0) {
    const { data: teamRows } = await supabase.from("teams").select("id, name").in("id", upcomingTeamIds);
    if (teamRows) teamNames = new Map(teamRows.map((t) => [t.id, t.name]));
  }

  let recentActivity: Array<{ id: string; action: string; created_at: string; leagueName: string | null }> = [];
  let isSuperAdmin = false;
  let platformMetrics: {
    totalUsers: number;
    totalLeagues: number;
    activeLeagues: number;
    totalTeams: number;
    totalPlayers: number;
    matchesLast7Days: number;
    matchesCompletedLast7Days: number;
  } | null = null;
  let userTeams: Array<{ id: string; name: string; slug: string; role: string; leagueSlug: string }> = [];
  let userAssignedMatches: Array<{
    id: string;
    leagueName: string;
    leagueSlug: string;
    homeTeamName: string;
    awayTeamName: string;
    scheduledAt: string;
    status: MatchStatus;
    roundName: string | null;
  }> = [];
  if (user) {
    const [{ data: profile }, { data: auditRows }, { data: userTeamMembers }, { data: userAssignedMatchesData }] = await Promise.all([
      supabase.from("profiles").select("global_role").eq("id", user.id).maybeSingle(),
      supabase
        .from("audit_logs")
        .select("id, action, created_at, league_id")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("team_members")
        .select("team_id, role, teams(id, name, slug, leagues(slug))")
        .eq("profile_id", user.id),
      supabase
        .from("matches")
        .select("id, league_id, scheduled_at, status, home_team_id, away_team_id, round_name, leagues(name, slug)")
        .eq("referee_id", user.id)
        .order("scheduled_at", { ascending: true })
        .limit(6),
    ]);
    isSuperAdmin = profile?.global_role === "super_admin";
    if (userTeamMembers && userTeamMembers.length > 0) {
      userTeams = userTeamMembers.map((m) => {
        const t = m.teams as unknown as { id: string; name: string; slug: string; leagues: { slug: string } | null } | null;
        return {
          id: m.team_id,
          name: t?.name ?? "Equipo",
          slug: t?.slug ?? "",
          role: m.role as string,
          leagueSlug: t?.leagues?.slug ?? "",
        };
      });
    }
    if (userAssignedMatchesData && userAssignedMatchesData.length > 0) {
      const extraTeamIds = [
        ...new Set(
          userAssignedMatchesData
            .flatMap((m) => [m.home_team_id, m.away_team_id])
            .filter((id) => !teamNames.has(id))
        ),
      ];
      if (extraTeamIds.length > 0) {
        const { data: extraTeams } = await supabase.from("teams").select("id, name").in("id", extraTeamIds);
        if (extraTeams) {
          for (const t of extraTeams) {
            teamNames.set(t.id, t.name);
          }
        }
      }
      userAssignedMatches = userAssignedMatchesData.map((m) => {
        const lg = m.leagues as unknown as { name: string; slug: string } | null;
        return {
          id: m.id,
          leagueName: lg?.name ?? "Liga",
          leagueSlug: lg?.slug ?? "",
          homeTeamName: teamNames.get(m.home_team_id) ?? "Local",
          awayTeamName: teamNames.get(m.away_team_id) ?? "Visitante",
          scheduledAt: m.scheduled_at,
          status: m.status as MatchStatus,
          roundName: m.round_name,
        };
      });
    }
    const audits = auditRows ?? [];
    const auditLeagueIds = [...new Set(audits.map((a) => a.league_id).filter((id): id is string => id !== null))];
    let auditLeagueNames = new Map<string, string>();
    if (auditLeagueIds.length > 0) {
      const { data: auditLeagues } = await supabase.from("leagues").select("id, name").in("id", auditLeagueIds);
      if (auditLeagues) auditLeagueNames = new Map(auditLeagues.map((l) => [l.id, l.name]));
    }
    recentActivity = audits.map((a) => ({
      id: a.id as string,
      action: a.action as string,
      created_at: a.created_at as string,
      leagueName: a.league_id ? (auditLeagueNames.get(a.league_id as string) ?? null) : null,
    }));

    // Métricas globales de plataforma (solo super_admin): conteos exactos con RLS mediante.
    if (isSuperAdmin) {
      const sevenDaysAgo = getPastDateIso(7);
      const [
        { count: totalUsers },
        { count: totalLeagues },
        { count: activeLeagues },
        { count: totalTeams },
        { count: totalPlayers },
        { count: matchesLast7Days },
        { count: matchesCompletedLast7Days },
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("leagues").select("id", { count: "exact", head: true }),
        supabase.from("leagues").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("teams").select("id", { count: "exact", head: true }),
        supabase.from("players").select("id", { count: "exact", head: true }),
        supabase.from("matches").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
        supabase
          .from("matches")
          .select("id", { count: "exact", head: true })
          .eq("status", "completed")
          .gte("created_at", sevenDaysAgo),
      ]);
      platformMetrics = {
        totalUsers: totalUsers ?? 0,
        totalLeagues: totalLeagues ?? 0,
        activeLeagues: activeLeagues ?? 0,
        totalTeams: totalTeams ?? 0,
        totalPlayers: totalPlayers ?? 0,
        matchesLast7Days: matchesLast7Days ?? 0,
        matchesCompletedLast7Days: matchesCompletedLast7Days ?? 0,
      };
    }
  }

  function formatDateTime(value: string) {
    return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Panel de control"
        description="Gestiona ligas, equipos, jugadores y partidos desde un solo lugar."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      <DashboardTrendsChart
        totalMatches={allMatches.length}
        statusCounts={statusCounts}
        totalGoals={totalGoals}
        averageGoalsPerMatch={averageGoalsPerMatch}
        totalYellowCards={totalYellowCards}
        totalRedCards={totalRedCards}
        roundTrends={roundTrends}
      />

      {platformMetrics ? <PlatformMetricsCard metrics={platformMetrics} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximos partidos</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-gray-500">No hay partidos programados próximamente.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {upcoming.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <span className="text-gray-900">
                      {teamNames.get(m.home_team_id) ?? "Local"} vs {teamNames.get(m.away_team_id) ?? "Visitante"}
                      <span className="block text-xs text-gray-500">{leagueNames.get(m.league_id) ?? ""}</span>
                    </span>
                    <span className="text-xs text-gray-500">{formatDateTime(m.scheduled_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500">Sin actividad registrada visible para tu usuario.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {recentActivity.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <span className="font-mono text-xs text-gray-900">{a.action}</span>
                    <span className="text-xs text-gray-500">
                      {a.leagueName ?? ""} {formatDateTime(a.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {isSuperAdmin ? (
              <div className="mt-3">
                <TextLink href="/dashboard/audit">Ver auditoría global</TextLink>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {userTeams.length > 0 ? (
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Mis equipos</CardTitle>
              <TextLink href="/dashboard/teams">Ver módulo de equipos</TextLink>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {userTeams.map((t) => (
                  <li
                    key={t.id}
                    className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
                  >
                    <div>
                      <span className="font-medium text-gray-900">{t.name}</span>
                      <span className="mt-0.5 block text-xs text-gray-500">
                        {t.role === "team_admin"
                          ? "Administrador de equipo"
                          : t.role === "coach"
                          ? "Cuerpo técnico"
                          : "Solo consulta"}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-sm">
                      <TextLink href={`/dashboard/leagues/${t.leagueSlug}/teams/${t.slug}`}>
                        Detalle
                      </TextLink>
                      <TextLink href={`/dashboard/leagues/${t.leagueSlug}/teams/${t.slug}/roster`}>
                        Plantilla
                      </TextLink>
                      <TextLink href={`/dashboard/leagues/${t.leagueSlug}/teams/${t.slug}/staff`}>
                        Staff
                      </TextLink>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        {userAssignedMatches.length > 0 ? (
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mis partidos asignados</CardTitle>
                <p className="mt-1 text-xs text-gray-500">
                  Partidos oficiales donde tienes designación arbitral activa.
                </p>
              </div>
              <TextLink href="/dashboard/matches">Ver módulo de partidos</TextLink>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {userAssignedMatches.map((m) => (
                  <li
                    key={m.id}
                    className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                          Árbitro asignado
                        </span>
                        <MatchStatusBadge status={m.status} />
                      </div>
                      <span className="mt-2 block font-medium text-gray-900">
                        {m.homeTeamName} vs {m.awayTeamName}
                      </span>
                      <span className="mt-0.5 block text-xs text-gray-500">
                        {m.leagueName} • {m.roundName || "Jornada no definida"}
                      </span>
                      <span className="mt-1 block text-xs text-gray-600">
                        {formatDateTime(m.scheduledAt)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-2 text-sm">
                      <TextLink href={`/dashboard/leagues/${m.leagueSlug}/matches/${m.id}`}>
                        Detalle
                      </TextLink>
                      {m.status !== "cancelled" ? (
                        <TextLink href={`/dashboard/leagues/${m.leagueSlug}/matches/${m.id}/result`}>
                          Resultado
                        </TextLink>
                      ) : null}
                      {m.status !== "cancelled" ? (
                        <TextLink href={`/dashboard/leagues/${m.leagueSlug}/matches/${m.id}/events`}>
                          Eventos
                        </TextLink>
                      ) : null}
                      <TextLink href={`/dashboard/leagues/${m.leagueSlug}/matches/${m.id}/cedula`}>
                        Cédula
                      </TextLink>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </section>
  );
}
