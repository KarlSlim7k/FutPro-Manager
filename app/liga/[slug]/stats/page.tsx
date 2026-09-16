import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PublicLeagueHeader } from "@/components/public/public-league-header";
import { PublicNav } from "@/components/public/public-nav";
import { StandingsSeasonSelector } from "@/components/standings/standings-season-selector";
import { SeasonStatsTabs, type StatsTabType } from "@/components/stats/season-stats-tabs";
import { TopScorersTable } from "@/components/stats/top-scorers-table";
import { TopAssistsTable } from "@/components/stats/top-assists-table";
import { CleanSheetsTable } from "@/components/stats/clean-sheets-table";
import { FairPlayTable } from "@/components/stats/fair-play-table";
import { SeasonOverviewCards } from "@/components/stats/season-overview-cards";
import { createPublicClient } from "@/lib/supabase/public";
import { getPublicLeagueBySlug } from "@/lib/leagues/get-public-league";
import { getSeasonStats } from "@/lib/stats/get-season-stats";
import type { Season } from "@/types/database";

export const revalidate = 60;

type SeasonItem = Pick<Season, "id" | "name" | "slug" | "status" | "start_date" | "end_date">;

interface LeagueStatsPublicPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ seasonId?: string | string[]; tab?: string | string[] }>;
}

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

export async function generateMetadata({
  params,
}: LeagueStatsPublicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicLeagueBySlug(slug);

  if (!data) {
    return { title: "Liga no encontrada | FutPro Manager" };
  }

  const title = `Estadísticas y Líderes - ${data.name} | FutPro Manager`;
  const description = `Tabla de goleo individual, máximos asistentes, vallas invictas y juego limpio en ${data.name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "es_MX",
      siteName: "FutPro Manager",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(
    new Date(`${value}T00:00:00`)
  );
}

export default async function LeagueStatsPublicPage({
  params,
  searchParams,
}: LeagueStatsPublicPageProps) {
  const { slug } = await params;
  const { seasonId: rawSeasonId, tab: rawTab } = await searchParams;
  const seasonId = Array.isArray(rawSeasonId) ? rawSeasonId[0] : rawSeasonId;
  const tabValue = Array.isArray(rawTab) ? rawTab[0] : rawTab;

  const validTabs: StatsTabType[] = ["scorers", "assists", "clean-sheets", "fair-play"];
  const currentTab: StatsTabType =
    tabValue && validTabs.includes(tabValue as StatsTabType)
      ? (tabValue as StatsTabType)
      : "scorers";

  const league = await getPublicLeagueBySlug(slug);

  if (!league) {
    notFound();
  }

  const supabase = createPublicClient();

  const { data: seasonsData, error: seasonsError } = await supabase
    .from("seasons")
    .select("id, name, slug, status, start_date, end_date")
    .eq("league_id", league.id)
    .order("start_date", { ascending: false });

  if (seasonsError) {
    throw seasonsError;
  }

  const seasons = (seasonsData ?? []) as SeasonItem[];

  if (seasons.length === 0) {
    return (
      <main className="w-full">
        <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <PublicLeagueHeader league={league} />
          <PublicNav leagueSlug={league.slug} />
          <EmptyState
            title="Sin temporadas registradas"
            description="Esta liga aún no tiene temporadas registradas. Las estadísticas estarán disponibles cuando existan temporadas y partidos disputados."
          />
        </section>
      </main>
    );
  }

  const fallbackSeason = seasons[0];

  if (seasonId) {
    const hasSeason = seasons.some((seasonItem) => seasonItem.id === seasonId);
    if (!hasSeason) {
      redirect(`/liga/${league.slug}/stats?seasonId=${fallbackSeason.id}`);
    }
  }

  const selectedSeason = seasonId
    ? seasons.find((seasonItem) => seasonItem.id === seasonId)!
    : fallbackSeason;

  const seasonStats = await getSeasonStats({
    supabase,
    leagueId: league.id,
    seasonId: selectedSeason.id,
  });

  return (
    <main className="w-full">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <PublicLeagueHeader league={league} />
        <PublicNav leagueSlug={league.slug} />

        {/* Selector de Temporadas */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Estadísticas y Líderes
            </h2>
            <p className="text-xs text-gray-400">
              Goleadores, asistencias, vallas invictas y juego limpio por temporada.
            </p>
          </div>
          {seasons.length > 1 && (
            <StandingsSeasonSelector
              leagueSlug={league.slug}
              seasons={seasons}
              selectedSeasonId={selectedSeason.id}
              basePath="/liga"
              subPath="stats"
              tab={currentTab}
            />
          )}
        </div>

        {/* Resumen de la Temporada */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl shadow-xl text-white">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-white">Temporada Activa</h3>
          </div>
          <div className="pt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Eyebrow className="text-emerald-400">Nombre</Eyebrow>
                <p className="mt-1 text-sm font-semibold text-white">{selectedSeason.name}</p>
              </div>
              <div>
                <Eyebrow className="text-emerald-400">Estado</Eyebrow>
                <p className="mt-1 text-sm text-gray-200">{formatLabel(selectedSeason.status)}</p>
              </div>
              <div>
                <Eyebrow className="text-emerald-400">Periodo</Eyebrow>
                <p className="mt-1 text-sm text-gray-200">
                  {formatDate(selectedSeason.start_date)} - {formatDate(selectedSeason.end_date)}
                </p>
              </div>
              <div>
                <Eyebrow className="text-emerald-400">Total Partidos</Eyebrow>
                <p className="mt-1 text-sm font-semibold text-white">
                  {seasonStats.overview.completedMatches} / {seasonStats.overview.totalMatches} completados
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de Métricas Globales */}
        <SeasonOverviewCards overview={seasonStats.overview} theme="dark" />

        {/* Tabs de Estadísticas Específicas */}
        <SeasonStatsTabs
          currentTab={currentTab}
          basePath={`/liga/${league.slug}/stats`}
          allowedTabs={["scorers", "assists", "clean-sheets", "fair-play"]}
          defaultTab="scorers"
          theme="dark"
        />

        {/* Contenido de la Pestaña Activa */}
        {currentTab === "scorers" && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl shadow-xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Tabla de Goleo Individual</h3>
              <span className="text-xs font-normal text-gray-400">
                {seasonStats.topScorers.length} jugadores con gol
              </span>
            </div>
            <div className="pt-4">
              <TopScorersTable
                scorers={seasonStats.topScorers}
                leagueSlug={league.slug}
                basePath="/liga"
                theme="dark"
              />
            </div>
          </div>
        )}

        {currentTab === "assists" && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl shadow-xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Máximos Asistentes</h3>
              <span className="text-xs font-normal text-gray-400">
                {seasonStats.topAssists.length} asistentes registrados
              </span>
            </div>
            <div className="pt-4">
              <TopAssistsTable
                assists={seasonStats.topAssists}
                leagueSlug={league.slug}
                basePath="/liga"
                theme="dark"
              />
            </div>
          </div>
        )}

        {currentTab === "clean-sheets" && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl shadow-xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Vallas Invictas por Equipo</h3>
              <span className="text-xs font-normal text-gray-400">
                Partidos con portería a cero
              </span>
            </div>
            <div className="pt-4">
              <CleanSheetsTable
                cleanSheets={seasonStats.cleanSheets}
                leagueSlug={league.slug}
                basePath="/liga"
                theme="dark"
              />
            </div>
          </div>
        )}

        {currentTab === "fair-play" && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl shadow-xl text-white">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Fair Play y Amonestaciones</h3>
            </div>
            <div className="pt-4">
              <FairPlayTable
                teams={seasonStats.fairPlayTeams}
                players={seasonStats.fairPlayPlayers}
                leagueSlug={league.slug}
                basePath="/liga"
                theme="dark"
              />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
