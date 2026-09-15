import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PublicFooter } from "@/components/public/public-footer";
import { LeagueSearchExplorer, type LeagueExplorerItem } from "@/components/leagues/league-search-explorer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Explorar Ligas y Torneos",
  description:
    "Directorio público de ligas y torneos de fútbol amateur. Encuentra tu equipo, consulta resultados, calendarios y tablas de posiciones.",
  openGraph: {
    title: "Explorar Ligas y Torneos | FutPro Manager",
    description:
      "Directorio público de ligas y torneos de fútbol amateur. Encuentra tu equipo, consulta resultados y tablas de posiciones.",
    type: "website",
    locale: "es_MX",
    siteName: "FutPro Manager",
    images: [{ url: "/og/futpro-manager.jpg", width: 640, height: 640 }],
  },
};

interface SearchProps {
  searchParams: Promise<{ q?: string | string[] }>;
}

export default async function ExploreLeaguesPage({ searchParams }: SearchProps) {
  const { q } = await searchParams;
  const initialQuery = Array.isArray(q) ? q[0] : q ?? "";

  const supabase = await createClient();
  const { data: leaguesData } = await supabase
    .from("leagues")
    .select("id, name, slug, description, logo_url, status")
    .eq("is_public", true)
    .eq("status", "active")
    .order("name", { ascending: true });

  const leagues = (leaguesData ?? []) as LeagueExplorerItem[];

  return (
    <div className="flex min-h-screen flex-col justify-between bg-gradient-to-b from-emerald-50 via-white to-gray-100">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded"
          >
            ← Volver al inicio
          </Link>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow tone="brand" className="text-sm tracking-[0.16em]">
                Directorio Deportivo
              </Eyebrow>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Explorar Ligas y Torneos
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                Consulta los partidos, plantillas, resultados y clasificaciones
                oficiales de las ligas digitales participantes.
              </p>
            </div>
            <Link
              href="/login?mode=register"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600 transition"
            >
              + Registrar mi liga
            </Link>
          </div>
        </div>

        <LeagueSearchExplorer
          initialLeagues={leagues}
          initialQuery={initialQuery}
        />
      </main>
      <PublicFooter />
    </div>
  );
}
