import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { Suspense } from "react";
import { StandingsSeasonSelector } from "@/components/standings/standings-season-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PublicLeagueHeader } from "@/components/public/public-league-header";
import { PublicNav } from "@/components/public/public-nav";
import { createPublicClient } from "@/lib/supabase/public";
import { getPublicLeagueBySlug } from "@/lib/leagues/get-public-league";
import type { Season } from "@/types/database";

import { SeasonStatsTabs, type StatsTabType } from "@/components/stats/season-stats-tabs";
import { StandingsContent } from "./standings-content";

export const revalidate = 60;

type SeasonItem = Pick<Season, "id" | "name" | "slug" | "status" | "start_date" | "end_date">;

interface LeagueStandingsPublicPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ seasonId?: string | string[]; tab?: string | string[] }>;
}

export async function generateMetadata({ params }: LeagueStandingsPublicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicLeagueBySlug(slug);

  if (!data) {
    return { title: "Liga no encontrada | FutPro Manager" };
  }

  const title = `Tabla de posiciones - ${data.name} | FutPro Manager`;
  const description = `Tabla pública de posiciones de ${data.name}.`;
  return { title, description, openGraph: {
      title,
      description,
      type: "website",
      locale: "es_MX",
      siteName: "FutPro Manager",
      images: [{ url: "/og/futpro-manager.jpg", width: 640, height: 640 }],
    }, twitter: { card: "summary", title, description,
      images: ["/og/futpro-manager.jpg"],
    } };
}

export default async function LeagueStandingsPublicPage({ params, searchParams }: LeagueStandingsPublicPageProps) {
  const { slug } = await params;
  const { seasonId: rawSeasonId, tab: rawTab } = await searchParams;
  const seasonId = Array.isArray(rawSeasonId) ? rawSeasonId[0] : rawSeasonId;
  const tabValue = Array.isArray(rawTab) ? rawTab[0] : rawTab;
  const currentTab: StatsTabType =
    tabValue === "scorers" || tabValue === "fair-play" || tabValue === "playoffs"
      ? tabValue
      : "standings";

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
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-100">
        <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <PublicLeagueHeader league={league} />
          <PublicNav leagueSlug={league.slug} />
          <EmptyState
            title="Sin temporadas registradas"
            description="Esta liga aún no tiene temporadas registradas. La tabla de posiciones estará disponible cuando existan temporadas."
          />
        </section>
      </main>
    );
  }

  const fallbackSeason = seasons[0];

  if (seasonId) {
    const hasSeason = seasons.some((seasonItem) => seasonItem.id === seasonId);
    if (!hasSeason) {
      redirect(`/liga/${league.slug}/standings?seasonId=${fallbackSeason.id}`);
    }
  }

  const selectedSeason = seasonId ? seasons.find((seasonItem) => seasonItem.id === seasonId)! : fallbackSeason;

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-100">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <PublicLeagueHeader league={league} />
        <PublicNav leagueSlug={league.slug} />

        <Card>
          <CardHeader>
            <CardTitle>Temporadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">Selecciona una temporada para consultar sus estadísticas.</p>
            <StandingsSeasonSelector
              leagueSlug={league.slug}
              seasons={seasons.map((seasonItem) => ({ id: seasonItem.id, name: seasonItem.name }))}
              selectedSeasonId={selectedSeason.id}
              basePath="/liga"
            />
          </CardContent>
        </Card>

        <SeasonStatsTabs
          currentTab={currentTab}
          basePath={`/liga/${league.slug}/standings`}
        />

        <Suspense
          key={`${selectedSeason.id}-${currentTab}`}
          fallback={
            <Card>
              <CardHeader>
                <CardTitle>Clasificación General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse space-y-2" aria-label="Cargando tabla de posiciones">
                  <div className="h-4 w-full rounded bg-gray-100" />
                  <div className="h-4 w-5/6 rounded bg-gray-100" />
                  <div className="h-4 w-4/6 rounded bg-gray-100" />
                  <div className="h-4 w-3/6 rounded bg-gray-100" />
                </div>
              </CardContent>
            </Card>
          }
        >
          <StandingsContent
            leagueId={league.id}
            leagueSlug={league.slug}
            seasonId={selectedSeason.id}
            seasonName={selectedSeason.name}
            seasonStatus={selectedSeason.status}
            seasonStart={selectedSeason.start_date}
            seasonEnd={selectedSeason.end_date}
            currentTab={currentTab}
          />
        </Suspense>
      </section>
    </main>
  );
}
