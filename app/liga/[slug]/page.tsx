import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PublicLeagueHeader } from "@/components/public/public-league-header";
import { PublicNav } from "@/components/public/public-nav";
import { PublicMatchCard } from "@/components/public/public-match-card";
import { createClient } from "@/lib/supabase/server";
import { getSeasonStats } from "@/lib/stats/get-season-stats";
import type { League, Match, Standing } from "@/types/database";

type PublicLeague = Pick<
  League,
  "id" | "name" | "slug" | "description" | "status" | "logo_url"
>;

interface LeaguePublicPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: LeaguePublicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("leagues")
    .select("name, description")
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("status", "active")
    .maybeSingle();

  if (!data) {
    return { title: "Liga no encontrada | FutPro Manager" };
  }

  const title = `${data.name} | FutPro Manager`;
  const description =
    data.description ?? `Resultados, tabla de posiciones y partidos de ${data.name}.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "es_MX",
      siteName: "FutPro Manager",
      images: [{ url: "/og/futpro-manager.jpg", width: 640, height: 640 }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["/og/futpro-manager.jpg"],
    },
  };
}

export default async function LeaguePublicPage({
  params,
}: LeaguePublicPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: leagueData, error: leagueError } = await supabase
    .from("leagues")
    .select("id, name, slug, description, status, logo_url")
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("status", "active")
    .maybeSingle();

  if (leagueError) {
    throw leagueError;
  }

  if (!leagueData) {
    notFound();
  }

  const league = leagueData as PublicLeague;

  const [
    { data: seasonsData },
    { count: teamCount },
    { count: matchCount },
    { data: allTeamsData },
    { data: allVenuesData },
  ] = await Promise.all([
    supabase
      .from("seasons")
      .select("id, name, status, start_date, end_date")
      .eq("league_id", league.id)
      .order("start_date", { ascending: false })
      .limit(1),
    supabase
      .from("teams")
      .select("id", { count: "exact", head: true })
      .eq("league_id", league.id),
    supabase
      .from("matches")
      .select("id, status, scheduled_at", { count: "exact", head: true })
      .eq("league_id", league.id),
    supabase
      .from("teams")
      .select("id, name, slug, logo_url")
      .eq("league_id", league.id),
    supabase.from("venues").select("id, name").eq("league_id", league.id),
  ]);

  const latestSeason = seasonsData?.[0] ?? null;
  const resolvedTeamCount = teamCount ?? 0;
  const resolvedMatchCount = matchCount ?? 0;

  const teamsMap = new Map(
    (allTeamsData ?? []).map((t) => [
      t.id,
      { name: t.name, slug: t.slug, logo_url: t.logo_url ?? null },
    ])
  );
  const venuesMap = new Map((allVenuesData ?? []).map((v) => [v.id, v.name]));

  // If there's an active/latest season, fetch upcoming matches, recent results, standings and top scorer
  let upcomingMatches: Match[] = [];
  let recentResults: Match[] = [];
  let topStandings: Standing[] = [];
  let topScorer = null;

  if (latestSeason) {
    const [
      { data: upcomingData },
      { data: recentData },
      { data: standingsData },
      stats,
    ] = await Promise.all([
      supabase
        .from("matches")
        .select(
          "id, league_id, season_id, home_team_id, away_team_id, venue_id, scheduled_at, status, home_score, away_score, round_name, created_at, updated_at"
        )
        .eq("league_id", league.id)
        .eq("season_id", latestSeason.id)
        .in("status", ["scheduled", "in_progress"])
        .order("scheduled_at", { ascending: true })
        .limit(4),
      supabase
        .from("matches")
        .select(
          "id, league_id, season_id, home_team_id, away_team_id, venue_id, scheduled_at, status, home_score, away_score, round_name, created_at, updated_at"
        )
        .eq("league_id", league.id)
        .eq("season_id", latestSeason.id)
        .eq("status", "completed")
        .order("scheduled_at", { ascending: false })
        .limit(4),
      supabase
        .from("standings")
        .select(
          "id, league_id, season_id, team_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, updated_at"
        )
        .eq("league_id", league.id)
        .eq("season_id", latestSeason.id)
        .order("points", { ascending: false })
        .order("goal_difference", { ascending: false })
        .order("goals_for", { ascending: false })
        .limit(4),
      getSeasonStats({
        supabase,
        leagueId: league.id,
        seasonId: latestSeason.id,
      }),
    ]);

    upcomingMatches = (upcomingData ?? []) as Match[];
    recentResults = (recentData ?? []) as Match[];
    topStandings = (standingsData ?? []) as Standing[];
    if (stats.topScorers && stats.topScorers.length > 0) {
      topScorer = stats.topScorers[0];
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-100">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <PublicLeagueHeader league={league} />
        <PublicNav leagueSlug={league.slug} />

        {/* Quick Highlights Strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <Eyebrow tone="brand" className="text-xs">
              Temporada
            </Eyebrow>
            <p className="mt-1 truncate text-base font-bold text-gray-900 sm:text-lg">
              {latestSeason ? latestSeason.name : "Sin temporada"}
            </p>
            <p className="text-xs capitalize text-gray-500">
              {latestSeason ? latestSeason.status.replace(/_/g, " ") : "Inactivo"}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <Eyebrow tone="brand" className="text-xs">
              Equipos
            </Eyebrow>
            <p className="mt-1 text-base font-bold text-gray-900 sm:text-lg">
              {resolvedTeamCount}
            </p>
            <p className="text-xs text-gray-500">Clubes registrados</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <Eyebrow tone="brand" className="text-xs">
              Partidos
            </Eyebrow>
            <p className="mt-1 text-base font-bold text-gray-900 sm:text-lg">
              {resolvedMatchCount}
            </p>
            <p className="text-xs text-gray-500">En calendario</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <Eyebrow tone="brand" className="text-xs">
              Consulta pública
            </Eyebrow>
            <p className="mt-1 text-base font-bold text-emerald-700 sm:text-lg">
              En tiempo real
            </p>
            <p className="text-xs text-gray-500">Actualizado al día</p>
          </div>
        </div>

        {latestSeason ? (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Columna Principal: Partidos (7 columnas) */}
            <div className="space-y-6 lg:col-span-7">
              {/* Próximos Partidos */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <Eyebrow tone="brand" className="text-xs">
                      En agenda
                    </Eyebrow>
                    <CardTitle className="text-lg">Próximos Partidos</CardTitle>
                  </div>
                  <Link
                    href={`/liga/${league.slug}/matches`}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    Ver calendario →
                  </Link>
                </CardHeader>
                <CardContent>
                  {upcomingMatches.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-500">
                      No hay partidos programados próximamente.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingMatches.map((m) => (
                        <PublicMatchCard
                          key={m.id}
                          homeTeamName={
                            teamsMap.get(m.home_team_id)?.name ?? "Equipo local"
                          }
                          awayTeamName={
                            teamsMap.get(m.away_team_id)?.name ??
                            "Equipo visitante"
                          }
                          homeTeamLogo={
                            teamsMap.get(m.home_team_id)?.logo_url ?? null
                          }
                          awayTeamLogo={
                            teamsMap.get(m.away_team_id)?.logo_url ?? null
                          }
                          venueName={
                            m.venue_id ? venuesMap.get(m.venue_id) ?? null : null
                          }
                          scheduledAt={m.scheduled_at}
                          status={m.status}
                          homeScore={m.home_score}
                          awayScore={m.away_score}
                          roundName={m.round_name}
                          detailHref={`/liga/${league.slug}/matches/${m.id}`}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Últimos Resultados */}
              {recentResults.length > 0 ? (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <Eyebrow tone="brand" className="text-xs">
                        Marcadores
                      </Eyebrow>
                      <CardTitle className="text-lg">
                        Resultados Recientes
                      </CardTitle>
                    </div>
                    <Link
                      href={`/liga/${league.slug}/matches`}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      Todos los resultados →
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y divide-gray-100">
                      {recentResults.map((m) => {
                        const homeName =
                          teamsMap.get(m.home_team_id)?.name ?? "Local";
                        const awayName =
                          teamsMap.get(m.away_team_id)?.name ?? "Visitante";
                        return (
                          <Link
                            key={m.id}
                            href={`/liga/${league.slug}/matches/${m.id}`}
                            className="flex items-center justify-between py-3 transition hover:bg-gray-50 -mx-2 px-2 rounded-lg"
                          >
                            <div className="flex-1 truncate pr-2">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {homeName}{" "}
                                <span className="font-bold text-emerald-700">
                                  {m.home_score}
                                </span>{" "}
                                –{" "}
                                <span className="font-bold text-emerald-700">
                                  {m.away_score}
                                </span>{" "}
                                {awayName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {m.round_name || "Partido finalizado"}
                              </p>
                            </div>
                            <span className="shrink-0 text-xs font-medium text-emerald-700">
                              Detalle ↗
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>

            {/* Columna Lateral: Clasificación y Figuras (5 columnas) */}
            <div className="space-y-6 lg:col-span-5">
              {/* Mini Tabla de Posiciones */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <Eyebrow tone="brand" className="text-xs">
                      Líderes
                    </Eyebrow>
                    <CardTitle className="text-lg">Clasificación</CardTitle>
                  </div>
                  <Link
                    href={`/liga/${league.slug}/standings`}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    Ver tabla completa →
                  </Link>
                </CardHeader>
                <CardContent>
                  {topStandings.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-500">
                      Aún no hay tabla calculada para esta temporada.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-100 text-left text-gray-500">
                            <th className="pb-2 font-medium">#</th>
                            <th className="pb-2 font-medium">Equipo</th>
                            <th className="pb-2 text-center font-medium">PJ</th>
                            <th className="pb-2 text-center font-medium">DG</th>
                            <th className="pb-2 text-center font-bold text-gray-900">
                              Pts
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {topStandings.map((row, idx) => {
                            const team = teamsMap.get(row.team_id);
                            return (
                              <tr key={row.id} className="text-gray-800">
                                <td className="py-2.5 pr-2 font-bold text-emerald-800">
                                  {idx + 1}
                                </td>
                                <td className="py-2.5 font-medium truncate max-w-[140px]">
                                  {team?.slug ? (
                                    <Link
                                      href={`/liga/${league.slug}/teams/${team.slug}`}
                                      className="hover:text-emerald-700 hover:underline"
                                    >
                                      {team.name}
                                    </Link>
                                  ) : (
                                    team?.name ?? "Equipo"
                                  )}
                                </td>
                                <td className="py-2.5 text-center text-gray-500">
                                  {row.played}
                                </td>
                                <td className="py-2.5 text-center text-gray-500">
                                  {row.goal_difference > 0
                                    ? `+${row.goal_difference}`
                                    : row.goal_difference}
                                </td>
                                <td className="py-2.5 text-center font-bold text-gray-900">
                                  {row.points}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Líder de Goleo (Pichichi) */}
              {topScorer ? (
                <Card className="border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40">
                  <CardHeader className="pb-2">
                    <Eyebrow tone="brand" className="text-xs">
                      Goleador del Torneo
                    </Eyebrow>
                    <CardTitle className="text-base">
                      Líder de Goleo Individual
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Link
                          href={`/liga/${league.slug}/players/${topScorer.playerId}`}
                          className="font-semibold text-gray-900 hover:text-emerald-700 hover:underline"
                        >
                          {topScorer.playerName}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {topScorer.teamName}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-white shadow-sm">
                        <span className="text-xs">⚽</span>
                        <span className="text-base font-bold">
                          {topScorer.totalGoals}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide opacity-90">
                          goles
                        </span>
                      </div>
                    </div>
                    <div className="pt-1">
                      <Link
                        href={`/liga/${league.slug}/standings?tab=scorers`}
                        className="text-xs font-semibold text-emerald-700 hover:underline"
                      >
                        Ver tabla completa de goleo →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {/* Enlace a Liguilla y Playoff */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
                <Eyebrow className="text-xs text-blue-800">
                  Fase Eliminatoria
                </Eyebrow>
                <h3 className="mt-1 text-sm font-semibold text-gray-900">
                  Liguilla y Fases Finales
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  Consulta el cuadro de cruces, cuartos de final, semifinales y
                  la gran final del torneo.
                </p>
                <Link
                  href={`/liga/${league.slug}/standings?tab=playoffs`}
                  className="mt-3 inline-flex text-xs font-semibold text-blue-700 hover:underline"
                >
                  Ver bracket de liguilla →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            title="Sin temporadas activas"
            description="Esta liga aún no tiene temporadas registradas con partidos o clasificaciones."
          />
        )}
      </section>
    </main>
  );
}
