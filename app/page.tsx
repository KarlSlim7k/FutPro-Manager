import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  Check,
  Share2,
  ShieldCheck,
  Trophy,
  Users,
  Volleyball,
  Zap,
} from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatusBadge } from "@/components/ui/status-badge";
import { PublicFooter } from "@/components/public/public-footer";
import { FloatingWhatsAppButton } from "@/components/contact/floating-whatsapp-button";
import { Reveal } from "@/components/home/reveal";
import { AnimatedCounter } from "@/components/home/animated-counter";
import { FaqAccordion } from "@/components/home/faq-accordion";
import { getHomeData } from "@/lib/home/get-home-data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "FutPro Manager — Administra ligas de fútbol amateur",
  description:
    "Plataforma SaaS para digitalizar ligas de fútbol amateur: equipos, jugadores, partidos, resultados y tablas de posiciones. Empieza gratis.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "FutPro Manager — Administra ligas de fútbol amateur",
    description:
      "Plataforma SaaS para digitalizar ligas de fútbol amateur: equipos, jugadores, partidos, resultados y tablas de posiciones. Empieza gratis.",
    type: "website",
    locale: "es_MX",
    siteName: "FutPro Manager",
    images: [{ url: "/og/futpro-manager.jpg", width: 640, height: 640 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FutPro Manager — Administra ligas de fútbol amateur",
    description: "Plataforma SaaS para digitalizar ligas de fútbol amateur.",
    images: ["/og/futpro-manager.jpg"],
  },
};

const benefits = [
  {
    icon: ShieldCheck,
    role: "Administradores de liga",
    eyebrow: "Para administradores",
    items: [
      "Menos hojas de cálculo: todo en un solo panel.",
      "Publica resultados y tablas en tiempo real.",
      "Gestiona equipos, jugadores y árbitros desde un lugar.",
    ],
  },
  {
    icon: Users,
    role: "Equipos y entrenadores",
    eyebrow: "Para equipos",
    items: [
      "Calendario de partidos y resultados actualizados.",
      "Plantilla y dorsales del equipo en un clic.",
      "Consulta tu posición en la tabla al instante.",
    ],
  },
  {
    icon: Zap,
    role: "Jugadores y aficionados",
    eyebrow: "Para jugadores y fans",
    items: [
      "Consulta pública: sin registro, sin app.",
      "Partidos próximos, resultados y estadísticas.",
      "Perfil de jugador con historial de equipos y eventos.",
    ],
  },
];

const steps = [
  {
    icon: Trophy,
    title: "1. Crea tu liga",
    desc: "Registra tu torneo, categorías y equipos en minutos.",
  },
  {
    icon: CalendarCheck,
    title: "2. Registra partidos",
    desc: "Calendario, marcadores y cédula arbitral desde el celular.",
  },
  {
    icon: Share2,
    title: "3. Comparte el link",
    desc: "Tabla, resultados y goleadores públicos al instante.",
  },
];

const faqs = [
  {
    q: "¿Los jugadores o aficionados necesitan registrarse para ver los partidos?",
    a: "No. Toda la consulta pública (calendarios, resultados, tabla de posiciones y ficha de jugadores) es abierta y no requiere contraseña ni descarga de aplicaciones.",
  },
  {
    q: "¿Cómo se actualiza la tabla de posiciones?",
    a: "Automáticamente. En cuanto el árbitro o administrador de la liga registra el marcador de un partido finalizado, el sistema recalcula puntos, goles a favor, goles en contra y diferencia de goles de forma instantánea.",
  },
  {
    q: "¿Puedo administrar más de una categoría o torneo?",
    a: "Sí. FutPro Manager permite gestionar múltiples temporadas y torneos dentro de una misma liga, como categorías Libre, Veteranos, Femenil o Juvenil.",
  },
  {
    q: "¿Se pueden generar cédulas arbitrales e imprimir?",
    a: "Sí. El sistema cuenta con vistas de cédula arbitral y formatos listos para imprimir o consultar en cancha desde cualquier smartphone.",
  },
  {
    q: "¿Tiene algún costo durante el lanzamiento?",
    a: "No. Durante el periodo de lanzamiento la plataforma es 100% gratuita para todas las ligas de fútbol amateur, sin requerir tarjeta de crédito.",
  },
];

const fallbackStandings = [
  { pos: 1, name: "Águilas FC", played: 8, points: 22, diff: "+14" },
  { pos: 2, name: "Real Perote", played: 8, points: 18, diff: "+9" },
  { pos: 3, name: "Lobos Norte", played: 8, points: 15, diff: "+4" },
  { pos: 4, name: "Halcones SC", played: 8, points: 10, diff: "-2" },
];

function formatMatchDate(iso: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return null;
  }
}

export default async function Home() {
  const data = await getHomeData();
  const standings =
    data.standings.length > 0 ? data.standings : fallbackStandings;
  const demoHref = data.demoSlug ? `/liga/${data.demoSlug}` : "/explorar";
  const hasLiveStats =
    data.stats.leagues > 0 ||
    data.stats.teams > 0 ||
    data.stats.finishedMatches > 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white selection:bg-emerald-500 selection:text-white">
      {/* Luces de ambiente y orbes de fondo (idénticos a /login) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-emerald-600/15 blur-[140px] animate-float-ambient"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 -right-40 h-[650px] w-[650px] rounded-full bg-teal-600/10 blur-[150px] animate-pulse-glow-ring"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-2/3 -left-40 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[140px] animate-float-ambient"
      />

      {/* Trazos geométricos de cancha de fútbol en SVG */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full stroke-emerald-500/[0.035] stroke-[1.5]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="home-tactical-grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 60 0 L 0 0 0 60" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#home-tactical-grid)" />
        <circle cx="50%" cy="320" r="220" fill="none" className="stroke-emerald-400/[0.04]" />
        <line x1="0" y1="320" x2="100%" y2="320" className="stroke-emerald-400/[0.03]" />
      </svg>

      {/* Header sticky unificado */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-md shadow-emerald-950 transition group-hover:from-emerald-400 group-hover:to-teal-600">
              <Volleyball className="h-5 w-5 text-white" aria-hidden />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold tracking-tight text-white">
                FutPro <span className="text-emerald-400">Manager</span>
              </span>
              <p className="text-[10px] text-gray-400">
                Gestión de Fútbol Amateur
              </p>
            </div>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-xs font-medium sm:gap-4 sm:text-sm">
            <Link
              href="/explorar"
              className="inline-flex min-h-[40px] items-center px-2 py-1 text-gray-300 transition hover:text-emerald-400"
            >
              Explorar ligas
            </Link>
            <Link
              href="#planes"
              className="hidden min-h-[40px] items-center px-2 py-1 text-gray-300 transition hover:text-emerald-400 sm:inline-flex"
            >
              Planes
            </Link>
            <Link
              href="#faq"
              className="hidden min-h-[40px] items-center px-2 py-1 text-gray-300 transition hover:text-emerald-400 sm:inline-flex"
            >
              Preguntas
            </Link>
            <Link
              href="/contacto"
              className="inline-flex min-h-[40px] items-center px-2 py-1 text-gray-300 transition hover:text-emerald-400"
            >
              Contacto
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-[40px] items-center rounded-xl border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:border-emerald-400/40 hover:bg-white/10 hover:text-white"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/login?mode=register"
              className="hidden sm:inline-flex min-h-[40px] items-center rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-emerald-950/40 transition hover:from-emerald-400 hover:to-teal-500"
            >
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10">
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-6 sm:pt-20 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center lg:px-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>100% gratis durante el lanzamiento</span>
            </div>

            <h1 className="max-w-xl break-words text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.12]">
              Administra ligas amateur como un{" "}
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
                profesional
              </span>
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-gray-300 sm:text-base lg:text-lg">
              FutPro Manager centraliza equipos, jugadores, partidos, resultados
              y tablas de posiciones para ligas y torneos de fútbol amateur.
            </p>

            {/* Buscador */}
            <form
              action="/explorar"
              method="GET"
              className="flex max-w-md flex-col items-stretch gap-2 sm:flex-row sm:items-center pt-1"
            >
              <input
                type="search"
                name="q"
                placeholder="¿Buscas tu liga o equipo? Ej. Perote..."
                aria-label="Buscar liga o equipo"
                className="h-12 w-full rounded-xl border border-white/15 bg-white/[0.06] backdrop-blur-md px-4 py-3 text-sm text-white placeholder:text-gray-400 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                className="h-12 shrink-0 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/40 transition hover:from-emerald-400 hover:to-teal-500 sm:w-auto"
              >
                Buscar
              </button>
            </form>

            {/* Acciones principales */}
            <div className="flex flex-col gap-3 sm:flex-row pt-2">
              <Link
                href="/login?mode=register"
                className="inline-flex h-12 min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/40 transition hover:from-emerald-400 hover:to-teal-500"
              >
                Crear cuenta gratis
              </Link>
              <Link
                href={demoHref}
                className="inline-flex h-12 min-h-[48px] items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:border-emerald-400/40 hover:bg-white/10"
              >
                Ver liga demo <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            {/* Prueba social / métricas */}
            <dl className="grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6">
              {[
                { label: "Ligas activas", value: data.stats.leagues },
                { label: "Equipos", value: data.stats.teams },
                { label: "Partidos jugados", value: data.stats.finishedMatches },
              ].map((s) => (
                <div key={s.label}>
                  <dt className="order-2 mt-1 text-[11px] leading-tight text-gray-400">
                    {s.label}
                  </dt>
                  <dd className="text-xl font-bold text-white sm:text-2xl">
                    {hasLiveStats ? (
                      <AnimatedCounter value={s.value} />
                    ) : (
                      <span aria-label="Próximamente">—</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Tarjeta Hero Standings (Estilo tarjeta /login con microacento esmeralda) */}
          <div className="relative rounded-3xl border border-white/15 bg-white/95 p-6 sm:p-7 shadow-2xl shadow-emerald-950/50 backdrop-blur-2xl text-gray-900 transition-all duration-300 hover:-translate-y-1">
            {/* Micro línea decorativa superior */}
            <div className="absolute inset-x-8 -top-px h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Tabla de posiciones en vivo
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Actualizado
              </span>
            </div>

            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium">#</th>
                  <th className="pb-2 font-medium">Equipo</th>
                  <th className="pb-2 text-center font-medium">PJ</th>
                  <th className="pb-2 text-center font-medium">Pts</th>
                  <th className="pb-2 text-center font-medium">DG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {standings.map((row) => (
                  <tr key={`${row.pos}-${row.name}`}>
                    <td
                      className={
                        row.pos === 1
                          ? "py-2 font-bold text-emerald-700"
                          : "py-2 text-gray-500"
                      }
                    >
                      {row.pos}
                    </td>
                    <td className="max-w-[140px] truncate py-2 font-medium">
                      {row.name}
                    </td>
                    <td className="py-2 text-center text-gray-500">
                      {row.played}
                    </td>
                    <td className="py-2 text-center font-bold text-gray-900">
                      {row.points}
                    </td>
                    <td className="py-2 text-center text-gray-500">
                      {row.diff}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(data.results[0] || data.upcoming[0]) && (
              <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/80 p-3 text-xs text-gray-600">
                {data.results[0] && (
                  <p className="truncate">
                    <span className="font-semibold text-gray-900">
                      Último resultado: {data.results[0].home} {data.results[0].homeScore}–
                      {data.results[0].awayScore} {data.results[0].away}
                    </span>
                  </p>
                )}
                {data.upcoming[0] && (
                  <p className="mt-1 truncate text-gray-500">
                    Próximo encuentro: {data.upcoming[0].home} vs {data.upcoming[0].away}
                    {formatMatchDate(data.upcoming[0].scheduledAt)
                      ? ` · ${formatMatchDate(data.upcoming[0].scheduledAt)}`
                      : ""}
                  </p>
                )}
              </div>
            )}

            <Link
              href={demoHref}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Ver tabla y calendario completo <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        {/* Marquee ligas con fondo unificado */}
        {data.stats.leagueNames.length > 0 && (
          <div className="home-marquee-mask relative border-y border-white/10 bg-slate-900/40 backdrop-blur-sm py-3.5">
            <div className="animate-home-marquee flex w-max gap-8 pr-8 text-xs font-medium text-emerald-300/80">
              {[...data.stats.leagueNames, ...data.stats.leagueNames].map(
                (name, i) => (
                  <span key={`${name}-${i}`} className="flex items-center gap-2 whitespace-nowrap">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                    {name}
                  </span>
                )
              )}
            </div>
          </div>
        )}
      </section>

      {/* Contenido principal en contenedor común */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Cómo funciona */}
        <Reveal>
          <div className="mt-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
              <span>Cómo funciona</span>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              Digitaliza tu liga en 3 sencillos pasos
            </h2>
            <p className="mt-2 text-sm text-gray-400 max-w-xl">
              Configura tu torneo en minutos y permite que jugadores y aficionados consulten todo sin apps.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {steps.map((s) => (
                <div
                  key={s.title}
                  className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-white/[0.07] hover:shadow-xl hover:shadow-emerald-950/40"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-950 transition group-hover:from-emerald-400 group-hover:to-teal-600">
                    <s.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-white">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-gray-300 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Mockups de producto */}
        <Reveal>
          <div className="mt-24">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
              <span>Vista previa del producto</span>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              Todo lo que necesitas, en un solo lugar
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              Del panel de administración a la consulta pública, sin hojas de cálculo ni grupos caóticos de WhatsApp.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Card 1: Panel administrativo */}
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-emerald-950/50">
                <div className="border-b border-white/10 bg-white/[0.03] px-5 py-3.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Panel administrativo
                  </span>
                </div>
                <div className="space-y-3.5 p-5">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Equipos", value: data.stats.teams || "8" },
                      { label: "Ligas", value: data.stats.leagues || "3" },
                      {
                        label: "Finalizados",
                        value: data.stats.finishedMatches || "24",
                      },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-center"
                      >
                        <p className="text-lg font-bold text-white">
                          {typeof m.value === "number" ? (
                            <AnimatedCounter value={m.value} />
                          ) : (
                            m.value
                          )}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{m.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                    <p className="mb-2 text-xs font-semibold text-gray-300">
                      Próximos partidos
                    </p>
                    {(data.upcoming.length > 0
                      ? data.upcoming.slice(0, 2).map((p) => ({
                          local: p.home,
                          visit: p.away,
                          hora: formatMatchDate(p.scheduledAt) ?? "Por definir",
                        }))
                      : [
                          { local: "Águilas FC", visit: "Lobos Norte", hora: "10:00" },
                          { local: "Real Perote", visit: "Halcones SC", hora: "12:00" },
                        ]
                    ).map((p) => (
                      <div
                        key={p.local}
                        className="flex items-center justify-between py-1 text-xs text-gray-300"
                      >
                        <span className="truncate font-medium">{p.local}</span>
                        <span className="shrink-0 px-2 text-gray-500 font-mono">vs</span>
                        <span className="truncate text-right">{p.visit}</span>
                        <span className="ml-2 shrink-0 text-emerald-400 font-medium">
                          {p.hora}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <span className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">
                      + Partido
                    </span>
                    <span className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-medium text-gray-300">
                      Gestionar equipos
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Tabla de posiciones */}
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-emerald-950/50">
                <div className="border-b border-white/10 bg-white/[0.03] px-5 py-3.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Tabla de posiciones
                  </span>
                </div>
                <div className="p-5">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-white/10">
                        <th className="pb-2 font-medium">#</th>
                        <th className="pb-2 font-medium">Equipo</th>
                        <th className="pb-2 text-center font-medium">PJ</th>
                        <th className="pb-2 text-center font-medium">Pts</th>
                        <th className="pb-2 text-center font-medium">DG</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {standings.map((row) => (
                        <tr key={row.pos} className="text-gray-300">
                          <td className="py-2 pr-2">
                            {row.pos === 1 ? (
                              <span className="font-bold text-emerald-400">
                                {row.pos}
                              </span>
                            ) : (
                              row.pos
                            )}
                          </td>
                          <td className="py-2 font-medium text-white">{row.name}</td>
                          <td className="py-2 text-center text-gray-400">
                            {row.played}
                          </td>
                          <td className="py-2 text-center font-bold text-emerald-400">
                            {row.points}
                          </td>
                          <td className="py-2 text-center text-gray-400">
                            {row.diff}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Link
                    href={demoHref}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
                  >
                    Ver liga demo completa <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              </div>

              {/* Card 3: Detalle de partido */}
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-emerald-950/50 sm:col-span-2 lg:col-span-1">
                <div className="border-b border-white/10 bg-white/[0.03] px-5 py-3.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Cédula y Detalle de partido
                  </span>
                </div>
                <div className="space-y-4 p-5">
                  {data.results[0] ? (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-white">
                          {data.results[0].home}
                        </span>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span className="rounded-lg bg-black/60 border border-white/10 px-3 py-1 font-mono text-lg font-bold text-emerald-400">
                            {data.results[0].homeScore ?? 0}
                          </span>
                          <span className="text-xs text-gray-500">–</span>
                          <span className="rounded-lg bg-black/60 border border-white/10 px-3 py-1 font-mono text-lg font-bold text-emerald-400">
                            {data.results[0].awayScore ?? 0}
                          </span>
                        </div>
                        <span className="truncate text-right text-sm font-semibold text-white">
                          {data.results[0].away}
                        </span>
                      </div>
                      <div className="flex justify-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                          Finalizado oficial
                        </span>
                      </div>
                      <p className="text-center text-xs text-gray-400">
                        {data.results[0].round ?? "Resultado oficial verificado en cancha"}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-white">
                          Águilas FC
                        </span>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span className="rounded-lg bg-black/60 border border-white/10 px-3 py-1 font-mono text-lg font-bold text-emerald-400">
                            2
                          </span>
                          <span className="text-xs text-gray-500">–</span>
                          <span className="rounded-lg bg-black/60 border border-white/10 px-3 py-1 font-mono text-lg font-bold text-emerald-400">
                            1
                          </span>
                        </div>
                        <span className="truncate text-right text-sm font-semibold text-white">
                          Real Perote
                        </span>
                      </div>
                      <div className="flex justify-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                          Finalizado oficial
                        </span>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <p className="text-xs font-semibold text-gray-400">
                          Incidencias del partido
                        </p>
                        {[
                          { min: "12'", tipo: "Gol", jugador: "R. Méndez" },
                          { min: "34'", tipo: "Gol", jugador: "L. Torres" },
                          { min: "67'", tipo: "Gol", jugador: "C. Ríos" },
                        ].map((ev) => (
                          <div
                            key={`${ev.min}-${ev.jugador}`}
                            className="flex items-center gap-2 text-xs text-gray-300"
                          >
                            <span className="w-8 shrink-0 text-emerald-400 font-mono">
                              {ev.min}
                            </span>
                            <span className="text-gray-400">{ev.tipo}</span>
                            <span className="font-medium text-white">{ev.jugador}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Beneficios */}
        <Reveal>
          <div className="mt-24">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
              <span>¿Para quién es FutPro Manager?</span>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              Beneficios para cada parte de la liga
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {benefits.map((b) => (
                <div
                  key={b.role}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-white/[0.07] hover:shadow-xl hover:shadow-emerald-950/40"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <b.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <span className="mt-4 block text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    {b.eyebrow}
                  </span>
                  <h3 className="mt-1 text-base font-bold text-white">
                    {b.role}
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {b.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm text-gray-300"
                      >
                        <Check
                          className="mt-1 h-4 w-4 shrink-0 text-emerald-400"
                          aria-hidden
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Planes */}
        <Reveal>
          <div id="planes" className="mt-24 scroll-mt-24">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
                <span>Precios Transparentes</span>
              </div>
              <h2 className="mt-3 text-2xl font-bold text-white sm:text-4xl">
                Planes para cualquier tamaño de liga
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-gray-400">
                Comienza hoy mismo sin costos ocultos y escala conforme tu torneo crezca.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
              {/* Plan Lanzamiento */}
              <div className="relative rounded-3xl border-2 border-emerald-500/80 bg-gradient-to-b from-emerald-950/60 via-slate-900/80 to-slate-900/90 p-7 sm:p-9 backdrop-blur-xl shadow-2xl shadow-emerald-950/60 transition-transform duration-300 hover:-translate-y-1">
                <div className="absolute -top-3.5 right-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                  Activo / Gratuito
                </div>
                <h3 className="text-xl font-bold text-white">
                  Plan Lanzamiento
                </h3>
                <p className="mt-1 text-xs text-gray-400">
                  Todo lo esencial para digitalizar tu liga amateur de inmediato.
                </p>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold text-white">$0</span>
                  <span className="text-sm text-emerald-300/80">/ mes (100% gratis)</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-gray-200">
                  {[
                    "1 liga o torneo completo",
                    "Equipos y jugadores ilimitados",
                    "Tabla de posiciones y resultados en tiempo real",
                    "Estadísticas individuales (goleo y tarjetas)",
                    "Cuadro de liguilla y fases finales",
                    "Cédula arbitral móvil en cancha",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <Check
                        className="h-4 w-4 shrink-0 text-emerald-400"
                        aria-hidden
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link
                    href="/login?mode=register"
                    className="block w-full rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold py-3.5 text-center shadow-lg shadow-emerald-950/40 transition"
                  >
                    Comenzar gratis ahora
                  </Link>
                </div>
              </div>

              {/* Plan Pro & Torneos */}
              <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-9 backdrop-blur-xl shadow-xl transition-transform duration-300 hover:-translate-y-1">
                <div>
                  <div className="mb-2 inline-block rounded-full border border-blue-500/30 bg-blue-500/20 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-blue-300">
                    Próximamente
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Plan Pro & Torneos
                  </h3>
                  <p className="mt-1 text-xs text-gray-400">
                    Para organizaciones grandes, múltiples categorías y marcas deportivas.
                  </p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-gray-300">
                      Personalizado
                    </span>
                  </div>
                  <ul className="mt-6 space-y-3 text-sm text-gray-400">
                    {[
                      "Múltiples torneos y categorías simultáneas",
                      "Dominio web propio (ej. miliga.com)",
                      "Cédula arbitral digital con firma en cancha",
                      "Espacio para patrocinadores de la liga",
                      "Soporte prioritario 24/7 por WhatsApp",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2.5">
                        <Check
                          className="h-4 w-4 shrink-0 text-blue-400"
                          aria-hidden
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  <Link
                    href="/contacto"
                    className="block w-full rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 text-center transition"
                  >
                    Solicitar información o demo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* FAQ */}
        <Reveal>
          <div id="faq" className="mt-24 scroll-mt-24">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
                <span>Preguntas Frecuentes</span>
              </div>
              <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                Resolvemos tus dudas
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-gray-400">
                Todo lo que necesitas saber antes de empezar a usar FutPro Manager.
              </p>
            </div>
            <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <FaqAccordion faqs={faqs} theme="dark" />
            </div>
          </div>
        </Reveal>

        {/* CTA final unificado */}
        <Reveal>
          <div className="relative mt-24 overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 px-6 py-14 text-center sm:px-12 backdrop-blur-xl shadow-2xl shadow-emerald-950/50">
            <div
              aria-hidden
              className="absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/25 blur-3xl"
            />
            <h2 className="relative text-2xl font-bold text-white sm:text-4xl">
              Empieza a digitalizar tu liga hoy
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-sm leading-relaxed text-emerald-100/80 sm:text-base">
              Sin costo durante el lanzamiento. Sin tarjeta de crédito. Tu tabla
              pública activa en minutos.
            </p>
            <div className="relative mt-8 flex flex-col justify-center gap-3.5 sm:flex-row">
              <Link
                href="/login?mode=register"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/40 transition"
              >
                Crear cuenta gratis
              </Link>
              <Link
                href="/explorar"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:border-emerald-400/40 hover:bg-white/10"
              >
                Explorar ligas
              </Link>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="relative z-10 mt-20">
        <FloatingWhatsAppButton />
        <PublicFooter theme="dark" />
      </div>
    </main>
  );
}
