import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Trophy } from "lucide-react";
import { PublicLeagueHeader } from "@/components/public/public-league-header";
import { PublicNav } from "@/components/public/public-nav";
import { PublicBreadcrumbs } from "@/components/public/public-breadcrumbs";
import { QuinielaBoard, type QuinielaMatchItem } from "@/components/quiniela/quiniela-board";
import { createPublicClient } from "@/lib/supabase/public";
import { getPublicLeagueBySlug } from "@/lib/leagues/get-public-league";

export const revalidate = 60;

interface QuinielaPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: QuinielaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const league = await getPublicLeagueBySlug(slug);

  if (!league) {
    return { title: "Liga no encontrada | FutPro Manager" };
  }

  const title = `Quiniela Aficionados - ${league.name} | FutPro Manager`;
  const description = `Pronostica gratis los partidos de ${league.name}, acumula puntos y compite por el primer lugar de la afición.`;
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
  };
}

export default async function PublicQuinielaPage({ params }: QuinielaPageProps) {
  const { slug } = await params;
  const league = await getPublicLeagueBySlug(slug);

  if (!league) {
    notFound();
  }

  const supabase = createPublicClient();

  // Fetch teams to map names and logos
  const { data: teamsData } = await supabase
    .from("teams")
    .select("id, name, logo_url")
    .eq("league_id", league.id);

  const teamMap = new Map((teamsData ?? []).map((t) => [t.id, t]));

  // Fetch upcoming and recent matches
  const { data: matchesData } = await supabase
    .from("matches")
    .select("id, round_name, scheduled_at, status, home_score, away_score, home_team_id, away_team_id")
    .eq("league_id", league.id)
    .order("scheduled_at", { ascending: false })
    .limit(20);

  const quinielaMatches: QuinielaMatchItem[] = (matchesData ?? []).map((m) => {
    const home = teamMap.get(m.home_team_id) ?? { id: m.home_team_id, name: "Local", logo_url: null };
    const away = teamMap.get(m.away_team_id) ?? { id: m.away_team_id, name: "Visitante", logo_url: null };

    return {
      id: m.id,
      roundName: m.round_name,
      scheduledAt: m.scheduled_at,
      status: m.status,
      homeScore: m.home_score,
      awayScore: m.away_score,
      homeTeam: { id: home.id, name: home.name, logoUrl: home.logo_url },
      awayTeam: { id: away.id, name: away.name, logoUrl: away.logo_url },
    };
  });

  return (
    <main className="w-full">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <PublicLeagueHeader league={league} />
        <PublicNav leagueSlug={league.slug} />
        <PublicBreadcrumbs
          items={[
            { label: league.name, href: `/liga/${league.slug}` },
            { label: "Quiniela Comunitaria" },
          ]}
        />

        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Trophy className="h-4 w-4" />
            <span>Predicciones Oficiales de Aficionados</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Quiniela de la Jornada
          </h1>
          <p className="text-sm text-gray-300">
            Pon a prueba tu conocimiento deportivo pronosticando los marcadores de {league.name}.
          </p>
        </div>

        <QuinielaBoard
          leagueSlug={league.slug}
          leagueName={league.name}
          matches={quinielaMatches}
        />
      </section>
    </main>
  );
}
