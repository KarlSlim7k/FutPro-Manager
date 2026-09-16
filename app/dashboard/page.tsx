import {
  type MetricCardProps,
  MetricCard,
} from "@/components/ui/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextLink } from "@/components/ui/text-link";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";

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
  let userTeams: Array<{ id: string; name: string; slug: string; role: string; leagueSlug: string }> = [];
  if (user) {
    const [{ data: profile }, { data: auditRows }, { data: userTeamMembers }] = await Promise.all([
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
      </div>
    </section>
  );
}
