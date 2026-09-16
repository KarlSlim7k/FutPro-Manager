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
    <main className="min-h-screen bg-white">
      {/* Header sticky */}
      <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-lg shadow-sm transition group-hover:bg-emerald-600">
              <Volleyball className="h-5 w-5 text-white" aria-hidden />
            </div>
            <div>
              <Eyebrow tone="brand" className="text-sm tracking-[0.18em]">
                FutPro Manager
              </Eyebrow>
              <p className="text-[11px] text-gray-500">
                Gestión de Fútbol Amateur
              </p>
            </div>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-xs font-medium sm:gap-5 sm:text-sm">
            <Link
              href="/explorar"
              className="inline-flex min-h-[44px] items-center py-2 text-gray-600 transition hover:text-emerald-700"
            >
              Explorar ligas
            </Link>
            <Link
              href="#planes"
              className="hidden min-h-[44px] items-center py-2 text-gray-600 transition hover:text-emerald-700 sm:inline-flex"
            >
              Planes
            </Link>
            <Link
              href="#faq"
              className="hidden min-h-[44px] items-center py-2 text-gray-600 transition hover:text-emerald-700 sm:inline-flex"
            >
              Preguntas
            </Link>
            <Link
              href="/contacto"
              className="inline-flex min-h-[44px] items-center py-2 text-gray-600 transition hover:text-emerald-700"
            >
              Contacto
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-800 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 sm:text-sm"
            >
              Iniciar sesión
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero oscuro */}
      <section className="relative overflow-hidden bg-emerald-950 text-white">
        <div
          aria-hidden
          className="hero-grid-texture absolute inset-0 opacity-60"
        />
        <div
          aria-hidden
          className="absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 right-10 h-64 w-64 rounded-full bg-emerald-300/15 blur-3xl"
        />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 pb-14 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:px-8">
          <div>
            <StatusBadge
              variant="success"
              className="bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/30"
            >
              100% gratis durante el lanzamiento
            </StatusBadge>
            <h1 className="mt-4 max-w-xl break-words text-3xl font-bold tracking-tight sm:text-5xl">
              Administra ligas amateur como un profesional
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-50/80 sm:mt-5 sm:text-lg sm:leading-7">
              FutPro Manager centraliza equipos, jugadores, partidos, resultados
              y tablas de posiciones para ligas y torneos de fútbol amateur.
            </p>

            <form
              action="/explorar"
              method="GET"
              className="mt-6 flex max-w-md flex-col items-stretch gap-2 sm:flex-row sm:items-center"
            >
              <input
                type="search"
                name="q"
                placeholder="¿Buscas tu liga o equipo? Ej. Perote..."
                aria-label="Buscar liga o equipo"
                className="h-12 w-full rounded-lg border border-white/20 bg-white px-3.5 py-3 text-base text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 sm:text-sm"
              />
              <button
                type="submit"
                className="h-12 shrink-0 rounded-lg bg-emerald-400 px-5 py-3 text-sm font-semibold text-emerald-950 shadow-sm transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-11 sm:w-auto"
              >
                Buscar
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login?mode=register"
                className="inline-flex h-12 min-h-[48px] items-center justify-center rounded-lg bg-emerald-400 px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950"
              >
                Crear cuenta gratis
              </Link>
              <Link
                href={demoHref}
                className="inline-flex h-12 min-h-[48px] items-center justify-center gap-1.5 rounded-lg border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Ver liga demo <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            {/* Prueba social */}
            <dl className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6">
              {[
                { label: "Ligas activas", value: data.stats.leagues },
                { label: "Equipos", value: data.stats.teams },
                { label: "Partidos finalizados", value: data.stats.finishedMatches },
              ].map((s) => (
                <div key={s.label}>
                  <dt className="order-2 mt-1 text-[11px] leading-tight text-emerald-50/60">
                    {s.label}
                  </dt>
                  <dd className="text-xl font-bold sm:text-2xl">
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

          {/* Panel hero con datos reales */}
          <div className="rounded-2xl border border-white/10 bg-white p-6 text-gray-900 shadow-2xl shadow-emerald-950/40 transition-transform duration-300 hover:-translate-y-1 sm:p-7">
            <div className="flex items-center justify-between">
              <Eyebrow tone="brand" className="text-xs tracking-[0.15em]">
                Tabla en vivo
              </Eyebrow>
              <StatusBadge variant="success">Actualizado</StatusBadge>
            </div>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400">
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
                    <td className="py-2 text-center font-bold">{row.points}</td>
                    <td className="py-2 text-center text-gray-500">{row.diff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(data.results[0] || data.upcoming[0]) && (
              <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                {data.results[0] && (
                  <p className="truncate">
                    <span className="font-semibold text-gray-900">
                      Último: {data.results[0].home} {data.results[0].homeScore}–
                      {data.results[0].awayScore} {data.results[0].away}
                    </span>
                  </p>
                )}
                {data.upcoming[0] && (
                  <p className="mt-1 truncate text-gray-500">
                    Próximo: {data.upcoming[0].home} vs {data.upcoming[0].away}
                    {formatMatchDate(data.upcoming[0].scheduledAt)
                      ? ` · ${formatMatchDate(data.upcoming[0].scheduledAt)}`
                      : ""}
                  </p>
                )}
              </div>
            )}
            <Link
              href={demoHref}
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
            >
              Ver tabla completa <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        {/* Marquee ligas */}
        {data.stats.leagueNames.length > 0 && (
          <div className="home-marquee-mask relative border-t border-white/10 bg-emerald-900/60 py-3">
            <div className="animate-home-marquee flex w-max gap-8 pr-8 text-xs font-medium text-emerald-50/70">
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

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Cómo funciona */}
        <Reveal>
          <div className="mt-16">
            <Eyebrow tone="brand" className="text-sm tracking-[0.15em]">
              Cómo funciona
            </Eyebrow>
            <h2 className="mt-3 text-2xl font-semibold text-gray-900">
              Digitaliza tu liga en 3 pasos
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {steps.map((s) => (
                <div
                  key={s.title}
                  className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white transition group-hover:bg-emerald-600">
                    <s.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-gray-900">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Mockups de producto */}
        <Reveal>
          <div className="mt-20">
            <Eyebrow tone="brand" className="text-sm tracking-[0.15em]">
              Vista previa del producto
            </Eyebrow>
            <h2 className="mt-3 text-2xl font-semibold text-gray-900">
              Todo lo que necesitas, en un solo lugar
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Del panel de administración a la consulta pública, sin Excel ni
              grupos de WhatsApp caóticos.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Panel administrativo
                  </span>
                </div>
                <div className="space-y-3 p-4">
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
                        className="rounded-lg border border-gray-100 bg-gray-50 p-2 text-center"
                      >
                        <p className="text-lg font-bold text-gray-900">
                          {typeof m.value === "number" ? (
                            <AnimatedCounter value={m.value} />
                          ) : (
                            m.value
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{m.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-gray-100 p-3">
                    <p className="mb-2 text-xs font-medium text-gray-500">
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
                        className="flex items-center justify-between py-1 text-xs text-gray-700"
                      >
                        <span className="truncate font-medium">{p.local}</span>
                        <span className="shrink-0 px-2 text-gray-400">vs</span>
                        <span className="truncate text-right">{p.visit}</span>
                        <span className="ml-2 shrink-0 text-gray-400">
                          {p.hora}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <span className="rounded-md bg-emerald-700 px-2 py-1 text-xs font-medium text-white">
                      + Partido
                    </span>
                    <span className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600">
                      Gestionar equipos
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Tabla de posiciones
                  </span>
                </div>
                <div className="p-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-gray-400">
                        <th className="pb-2 font-medium">#</th>
                        <th className="pb-2 font-medium">Equipo</th>
                        <th className="pb-2 text-center font-medium">PJ</th>
                        <th className="pb-2 text-center font-medium">Pts</th>
                        <th className="pb-2 text-center font-medium">DG</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {standings.map((row) => (
                        <tr key={row.pos} className="text-gray-700">
                          <td className="py-1.5 pr-2">
                            {row.pos === 1 ? (
                              <span className="font-bold text-emerald-700">
                                {row.pos}
                              </span>
                            ) : (
                              row.pos
                            )}
                          </td>
                          <td className="py-1.5 font-medium">{row.name}</td>
                          <td className="py-1.5 text-center text-gray-500">
                            {row.played}
                          </td>
                          <td className="py-1.5 text-center font-bold">
                            {row.points}
                          </td>
                          <td className="py-1.5 text-center text-gray-500">
                            {row.diff}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Link
                    href={demoHref}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Ver liga demo <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:col-span-2 lg:col-span-1">
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Detalle de partido
                  </span>
                </div>
                <div className="space-y-4 p-4">
                  {data.results[0] ? (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-gray-800">
                          {data.results[0].home}
                        </span>
                        <div className="flex shrink-0 items-center gap-1">
                          <span className="rounded-lg bg-gray-900 px-3 py-1 text-lg font-bold text-white">
                            {data.results[0].homeScore ?? 0}
                          </span>
                          <span className="text-xs text-gray-400">–</span>
                          <span className="rounded-lg bg-gray-900 px-3 py-1 text-lg font-bold text-white">
                            {data.results[0].awayScore ?? 0}
                          </span>
                        </div>
                        <span className="truncate text-right text-sm font-semibold text-gray-800">
                          {data.results[0].away}
                        </span>
                      </div>
                      <div className="flex justify-center">
                        <StatusBadge variant="success">Finalizado</StatusBadge>
                      </div>
                      <p className="text-center text-xs text-gray-500">
                        {data.results[0].round ?? "Resultado oficial verificado"}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-gray-800">
                          Águilas FC
                        </span>
                        <div className="flex shrink-0 items-center gap-1">
                          <span className="rounded-lg bg-gray-900 px-3 py-1 text-lg font-bold text-white">
                            2
                          </span>
                          <span className="text-xs text-gray-400">–</span>
                          <span className="rounded-lg bg-gray-900 px-3 py-1 text-lg font-bold text-white">
                            1
                          </span>
                        </div>
                        <span className="truncate text-right text-sm font-semibold text-gray-800">
                          Real Perote
                        </span>
                      </div>
                      <div className="flex justify-center">
                        <StatusBadge variant="success">Finalizado</StatusBadge>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-gray-500">
                          Eventos del partido
                        </p>
                        {[
                          { min: "12'", tipo: "Gol", jugador: "R. Méndez" },
                          { min: "34'", tipo: "Gol", jugador: "L. Torres" },
                          { min: "67'", tipo: "Gol", jugador: "C. Ríos" },
                        ].map((ev) => (
                          <div
                            key={`${ev.min}-${ev.jugador}`}
                            className="flex items-center gap-2 text-xs text-gray-600"
                          >
                            <span className="w-7 shrink-0 text-gray-400">
                              {ev.min}
                            </span>
                            <span>{ev.tipo}</span>
                            <span className="font-medium">{ev.jugador}</span>
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
          <div className="mt-20">
            <Eyebrow tone="brand" className="text-sm tracking-[0.15em]">
              ¿Para quién es FutPro Manager?
            </Eyebrow>
            <h2 className="mt-3 text-2xl font-semibold text-gray-900">
              Beneficios para cada parte de la liga
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {benefits.map((b) => (
                <div
                  key={b.role}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <b.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <Eyebrow className="mt-3 text-xs tracking-[0.14em]">
                    {b.eyebrow}
                  </Eyebrow>
                  <h3 className="mt-1 text-sm font-semibold text-gray-900">
                    {b.role}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {b.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 text-sm text-gray-700"
                      >
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                          aria-hidden
                        />
                        {item}
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
          <div id="planes" className="mt-20 scroll-mt-24">
            <div className="text-center">
              <Eyebrow tone="brand" className="text-sm tracking-[0.15em]">
                Precios Transparentes
              </Eyebrow>
              <h2 className="mt-3 text-2xl font-semibold text-gray-900 sm:text-3xl">
                Planes para cualquier tamaño de liga
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600">
                Comienza hoy mismo sin costos ocultos y escala conforme tu
                torneo crezca.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
              <div className="relative rounded-2xl border-2 border-emerald-600 bg-white p-6 shadow-lg transition-transform duration-300 hover:-translate-y-1 sm:p-8">
                <div className="absolute -top-3.5 right-6 rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-white">
                  Activo / Gratuito
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Plan Lanzamiento
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Todo lo esencial para digitalizar tu liga amateur de inmediato.
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">$0</span>
                  <span className="text-sm text-gray-500">/ mes (100% gratis)</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-gray-700">
                  {[
                    "1 liga o torneo completo",
                    "Equipos y jugadores ilimitados",
                    "Tabla de posiciones y resultados en tiempo real",
                    "Estadísticas individuales (goleo y tarjetas)",
                    "Cuadro de liguilla y fases finales",
                    "Tarjetas para compartir en WhatsApp",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check
                        className="h-4 w-4 shrink-0 text-emerald-600"
                        aria-hidden
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link
                    href="/login?mode=register"
                    className="block w-full rounded-lg bg-emerald-700 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
                  >
                    Comenzar gratis ahora
                  </Link>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-gray-50/70 p-6 sm:p-8">
                <div>
                  <div className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-blue-800">
                    Próximamente
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Plan Pro & Torneos
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Para organizaciones grandes, múltiples categorías y marcas
                    deportivas.
                  </p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-gray-700">
                      Personalizado
                    </span>
                  </div>
                  <ul className="mt-6 space-y-3 text-sm text-gray-600">
                    {[
                      "Múltiples torneos y categorías simultáneas",
                      "Dominio web propio (ej. miliga.com)",
                      "Cédula arbitral digital con firma en cancha",
                      "Espacio para patrocinadores de la liga",
                      "Soporte prioritario 24/7 por WhatsApp",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check
                          className="h-4 w-4 shrink-0 text-blue-600"
                          aria-hidden
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  <Link
                    href="/contacto"
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100"
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
          <div id="faq" className="mt-20 scroll-mt-24">
            <div className="text-center">
              <Eyebrow tone="brand" className="text-sm tracking-[0.15em]">
                Preguntas Frecuentes
              </Eyebrow>
              <h2 className="mt-3 text-2xl font-semibold text-gray-900 sm:text-3xl">
                Resolvemos tus dudas
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600">
                Todo lo que necesitas saber antes de empezar a usar FutPro
                Manager.
              </p>
            </div>
            <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <FaqAccordion faqs={faqs} />
            </div>
          </div>
        </Reveal>

        {/* CTA final */}
        <Reveal>
          <div className="relative mt-20 overflow-hidden rounded-2xl bg-emerald-950 px-6 py-12 text-center sm:px-10">
            <div
              aria-hidden
              className="absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-emerald-500/25 blur-3xl"
            />
            <h2 className="relative text-xl font-semibold text-white sm:text-2xl">
              Empieza a digitalizar tu liga hoy
            </h2>
            <p className="relative mx-auto mt-2 max-w-md text-sm text-emerald-50/70">
              Sin costo durante el lanzamiento. Sin tarjeta de crédito. Tu tabla
              pública en minutos.
            </p>
            <div className="relative mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/login?mode=register"
                className="inline-flex items-center justify-center rounded-lg bg-emerald-400 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Crear cuenta gratis
              </Link>
              <Link
                href="/explorar"
                className="inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Explorar ligas
              </Link>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="mt-20">
        <FloatingWhatsAppButton />
        <PublicFooter />
      </div>
    </main>
  );
}
