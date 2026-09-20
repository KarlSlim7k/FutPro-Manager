import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Compass, Plus, Trophy } from "lucide-react";
import { PublicFooter } from "@/components/public/public-footer";
import { FavoriteTeamsBar } from "@/components/favorites/favorite-teams-bar";
import {
  LeagueSearchExplorer,
  type LeagueExplorerItem,
} from "@/components/leagues/league-search-explorer";
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
    .order("name", { ascending: true })
    .limit(100);

  const leagues = (leaguesData ?? []) as LeagueExplorerItem[];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      {/* Luces de ambiente y orbes de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-600/15 blur-[120px] animate-float-ambient"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-teal-600/10 blur-[140px] animate-pulse-glow-ring"
      />

      {/* Trazos geométricos de cancha de fútbol en SVG */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full stroke-emerald-500/[0.035] stroke-[1.5]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="explore-tactical-grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 60 0 L 0 0 0 60" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#explore-tactical-grid)" />
        <circle cx="85%" cy="30%" r="200" fill="none" className="stroke-emerald-400/[0.04]" />
      </svg>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Barra superior de navegación */}
        <header className="mb-8 flex items-center justify-between animate-enter-fade-down">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-gray-200 backdrop-blur-md transition hover:border-emerald-400/40 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5 text-emerald-400" />
            <span>Volver al inicio</span>
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-md shadow-emerald-950">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">
              FutPro <span className="text-emerald-400">Manager</span>
            </span>
          </Link>
        </header>

        {/* Encabezado principal */}
        <div className="mb-10 space-y-4 animate-enter-fade-up">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
                <Compass className="h-3.5 w-3.5 text-emerald-400" />
                <span>Directorio Deportivo Oficial</span>
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Explorar Ligas y{" "}
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
                  Torneos
                </span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base">
                Consulta partidos, plantillas de jugadores, resultados y tablas de posiciones oficiales
                de las ligas activas en la plataforma.
              </p>
            </div>

            <Link
              href="/login?mode=register"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-emerald-950/40 transition hover:from-emerald-400 hover:to-teal-500"
            >
              <Plus className="h-4 w-4" />
              <span>Registrar mi liga</span>
            </Link>
          </div>
        </div>

        {/* Barra de equipos favoritos del usuario */}
        <div className="animate-enter-fade-up">
          <FavoriteTeamsBar />
        </div>

        {/* Explorador reactivo de ligas */}
        <div className="animate-enter-fade-up anim-delay-150">
          <LeagueSearchExplorer
            initialLeagues={leagues}
            initialQuery={initialQuery}
          />
        </div>
      </main>

      <div className="relative z-10 mt-16">
        <PublicFooter theme="dark" />
      </div>
    </div>
  );
}
