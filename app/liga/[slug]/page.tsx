import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Volleyball } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PublicLeagueHeader } from "@/components/public/public-league-header";
import { PublicNav } from "@/components/public/public-nav";
import { PublicMatchCard } from "@/components/public/public-match-card";
import { createPublicClient } from "@/lib/supabase/public";
import { getPublicLeagueBySlug } from "@/lib/leagues/get-public-league";
import { getSeasonTopScorer } from "@/lib/stats/get-season-top-scorer";
import type { TopScorerItem } from "@/lib/stats/get-season-stats";
import type { Match, Standing } from "@/types/database";

export const revalidate = 60;

export async function generateStaticParams() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("leagues")
    .select("slug")
    .eq("is_public", true)
    .eq("status", "active");

  return (data ?? []).map((league) => ({
    slug: league.slug,
  }));
}

interface LeaguePublicPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: LeaguePublicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicLeagueBySlug(slug);

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
  const league = await getPublicLeagueBySlug(slug);

  if (!league) {
    notFound();
  }

  const supabase = createPublicClient();

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
  let topScorer: TopScorerItem | null = null;

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
      getSeasonTopScorer({
        supabase,
        leagueId: league.id,
        seasonId: latestSeason.id,
      }),
    ]);

    upcomingMatches = (upcomingData ?? []) as Match[];
    recentResults = (recentData ?? []) as Match[];
    topStandings = (standingsData ?? []) as Standing[];
    topScorer = stats;
  }

  return (
    <main className="w-full">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <PublicLeagueHeader league={league} />
        <PublicNav leagueSlug={league.slug} />

        {/* Quick Highlights Strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-md shadow-xl text-white">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Temporada
            </span>
            <p className="mt-1 truncate text-base font-bold text-white sm:text-lg">
              {latestSeason ? latestSeason.name : "Sin temporada"}
            </p>
            <p className="text-xs capitalize text-gray-400">
              {latestSeason ? latestSeason.status.replace(/_/g, " ") : "Inactivo"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-md shadow-xl text-white">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Equipos
            </span>
            <p className="mt-1 text-base font-bold text-white sm:text-lg">
              {resolvedTeamCount}
            </p>
            <p className="text-xs text-gray-400">Clubes registrados</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-md shadow-xl text-white">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Partidos
            </span>
            <p className="mt-1 text-base font-bold text-white sm:text-lg">
              {resolvedMatchCount}
            </p>
            <p className="text-xs text-gray-400">En calendario</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-md shadow-xl text-white">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Consulta pública
            </span>
            <p className="mt-1 text-base font-bold text-emerald-400 sm:text-lg">
              En tiempo real
            </p>
            <p className="text-xs text-gray-400">Actualizado al día</p>
          </div>
        </div>

        {latestSeason ? (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Columna Principal: Partidos (7 columnas) */}
            <div className="space-y-6 lg:col-span-7">
              {/* Próximos Partidos */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl shadow-xl text-white">
                <div className="flex flex-row items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      En agenda
                    </span>
                    <h2 className="text-lg font-bold text-white">Próximos Partidos</h2>
                  </div>
                  <Link
                    href={`/liga/${league.slug}/matches`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
                  >
                    Ver calendario <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
                <div className="pt-4">
                  {upcomingMatches.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-400">
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
                </div>
              </div>

              {/* Últimos Resultados */}
              {recentResults.length > 0 ? (
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl shadow-xl text-white">
                  <div className="flex flex-row items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        Marcadores
                      </span>
                      <h2 className="text-lg font-bold text-white">
                        Resultados Recientes
                      </h2>
                    </div>
                    <Link
                      href={`/liga/${league.slug}/matches`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
                    >
                      Todos los resultados <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </div>
                  <div className="pt-2">
                    <div className="divide-y divide-white/5">
                      {recentResults.map((m) => {
                        const homeName =
                          teamsMap.get(m.home_team_id)?.name ?? "Local";
                        const awayName =
                          teamsMap.get(m.away_team_id)?.name ?? "Visitante";
                        return (
                          <Link
                            key={m.id}
                            href={`/liga/${league.slug}/matches/${m.id}`}
                            className="flex items-center justify-between py-3 transition hover:bg-white/5 -mx-2 px-3 rounded-xl"
                          >
                            <div className="flex-1 truncate pr-2">
                              <p className="truncate text-sm font-semibold text-white">
                                {homeName}{" "}
                                <span className="font-mono font-bold text-emerald-400">
                                  {m.home_score}
                                </span>{" "}
                                –{" "}
                                <span className="font-mono font-bold text-emerald-400">
                                  {m.away_score}
                                </span>{" "}
                                {awayName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {m.round_name || "Partido finalizado"}
                              </p>
                            </div>
                            <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-emerald-400">
                              Detalle <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Columna Lateral: Clasificación y Figuras (5 columnas) */}
            <div className="space-y-6 lg:col-span-5">
              {/* Mini Tabla de Posiciones */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl shadow-xl text-white">
                <div className="flex flex-row items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Líderes
                    </span>
                    <h2 className="text-lg font-bold text-white">Clasificación</h2>
                  </div>
                  <Link
                    href={`/liga/${league.slug}/standings`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
                  >
                    Ver tabla completa <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
                <div className="pt-3">
                  {topStandings.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-400">
                      Aún no hay tabla calculada para esta temporada.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-left text-gray-400">
                            <th className="pb-2 font-medium">#</th>
                            <th className="pb-2 font-medium">Equipo</th>
                            <th className="pb-2 text-center font-medium">PJ</th>
                            <th className="pb-2 text-center font-medium">DG</th>
                            <th className="pb-2 text-center font-bold text-white">
                              Pts
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {topStandings.map((row, idx) => {
                            const team = teamsMap.get(row.team_id);
                            return (
                              <tr key={row.id} className="text-gray-300">
                                <td className="py-2.5 pr-2 font-bold text-emerald-400">
                                  {idx + 1}
                                </td>
                                <td className="py-2.5 font-medium truncate max-w-[140px] text-white">
                                  {team?.slug ? (
                                    <Link
                                      href={`/liga/${league.slug}/teams/${team.slug}`}
                                      className="hover:text-emerald-300 hover:underline"
                                    >
                                      {team.name}
                                    </Link>
                                  ) : (
                                    team?.name ?? "Equipo"
                                  )}
                                </td>
                                <td className="py-2.5 text-center text-gray-400">
                                  {row.played}
                                </td>
                                <td className="py-2.5 text-center text-gray-400">
                                  {row.goal_difference > 0
                                    ? `+${row.goal_difference}`
                                    : row.goal_difference}
                                </td>
                                <td className="py-2.5 text-center font-bold text-emerald-400">
                                  {row.points}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Líder de Goleo (Pichichi) */}
              {topScorer ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/60 via-slate-900/80 to-slate-900/90 p-5 backdrop-blur-xl shadow-xl text-white">
                  <div className="pb-2 border-b border-white/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Goleador del Torneo
                    </span>
                    <h2 className="text-base font-bold text-white">
                      Líder de Goleo Individual
                    </h2>
                  </div>
                  <div className="space-y-3 pt-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Link
                          href={`/liga/${league.slug}/players/${topScorer.playerId}`}
                          className="font-bold text-white hover:text-emerald-300 hover:underline"
                        >
                          {topScorer.playerName}
                        </Link>
                        <p className="text-xs text-gray-400">
                          {topScorer.teamName}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-1.5 text-white shadow-md">
                        <Volleyball className="h-4 w-4" aria-hidden />
                        <span className="text-base font-bold font-mono">
                          {topScorer.totalGoals}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide opacity-90">
                          goles
                        </span>
                      </div>
                    </div>
                    <div className="pt-1 border-t border-white/10">
                      <Link
                        href={`/liga/${league.slug}/standings?tab=scorers`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
                      >
                        Ver tabla completa de goleo <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Enlace a Liguilla y Playoff */}
              <div className="rounded-2xl border border-blue-500/30 bg-blue-950/40 p-5 backdrop-blur-md text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  Fase Eliminatoria
                </span>
                <h3 className="mt-1 text-sm font-bold text-white">
                  Liguilla y Fases Finales
                </h3>
                <p className="mt-1 text-xs text-gray-300 leading-relaxed">
                  Consulta el cuadro de cruces, cuartos de final, semifinales y la gran final del torneo.
                </p>
                <Link
                  href={`/liga/${league.slug}/standings?tab=playoffs`}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline"
                >
                  Ver bracket de liguilla <ArrowRight className="h-3.5 w-3.5" aria-hidden />
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
