import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, ChevronDown, Volleyball } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatusBadge } from "@/components/ui/status-badge";
import { PublicFooter } from "@/components/public/public-footer";
import { FloatingWhatsAppButton } from "@/components/contact/floating-whatsapp-button";

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

const features = [
  "Gestión centralizada de ligas y temporadas",
  "Control de equipos y jugadores en un solo panel",
  "Planeación de partidos y seguimiento operativo",
];

const benefits = [
  {
    role: "Administradores de liga",
    color: "border-emerald-200 bg-emerald-50",
    eyebrow: "Para administradores",
    items: [
      "Menos hojas de cálculo: todo en un solo panel.",
      "Publica resultados y tablas en tiempo real.",
      "Gestiona equipos, jugadores y árbitros desde un lugar.",
    ],
  },
  {
    role: "Equipos y entrenadores",
    color: "border-blue-200 bg-blue-50",
    eyebrow: "Para equipos",
    items: [
      "Calendario de partidos y resultados actualizados.",
      "Plantilla y dorsales del equipo en un clic.",
      "Consulta tu posición en la tabla al instante.",
    ],
  },
  {
    role: "Jugadores y aficionados",
    color: "border-amber-200 bg-amber-50",
    eyebrow: "Para jugadores y fans",
    items: [
      "Consulta pública: sin registro, sin app.",
      "Partidos próximos, resultados y estadísticas.",
      "Perfil de jugador con historial de equipos y eventos.",
    ],
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

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-100">
      <section className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-14 pt-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-lg shadow-sm group-hover:bg-emerald-600 transition">
              <Volleyball className="h-5 w-5 text-white" aria-hidden />
            </div>
            <div>
              <Eyebrow tone="brand" className="text-sm tracking-[0.18em]">
                FutPro Manager
              </Eyebrow>
              <p className="text-[11px] text-gray-500">Gestión de Fútbol Amateur</p>
            </div>
          </Link>
          <nav className="flex flex-wrap items-center gap-3 sm:gap-5 text-sm font-medium">
            <Link
              href="/explorar"
              className="text-gray-600 transition hover:text-emerald-700"
            >
              Explorar ligas
            </Link>
            <Link
              href="#planes"
              className="text-gray-600 transition hover:text-emerald-700"
            >
              Planes
            </Link>
            <Link
              href="#faq"
              className="text-gray-600 transition hover:text-emerald-700"
            >
              Preguntas
            </Link>
            <Link
              href="/contacto"
              className="text-gray-600 transition hover:text-emerald-700"
            >
              Contacto
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-medium text-gray-800 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
            >
              Iniciar sesión
            </Link>
          </nav>
        </header>

        {/* Hero */}
        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div>
            <h1 className="max-w-xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Administra ligas amateur como un profesional
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
              FutPro Manager centraliza equipos, jugadores, partidos, resultados
              y tablas de posiciones para ligas y torneos de fútbol amateur.
            </p>

            {/* Buscador Rápido de Ligas */}
            <form action="/explorar" method="GET" className="mt-6 flex max-w-md items-center gap-2">
              <input
                type="search"
                name="q"
                placeholder="¿Buscas tu liga o equipo? Ej. Perote..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              >
                Buscar
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login?mode=register"
                className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              >
                Crear cuenta gratis
              </Link>
              <Link
                href="/explorar"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-700 bg-white px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              >
                Ver liga demo <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl shadow-gray-200/60 sm:p-8">
            <Eyebrow tone="brand" className="text-sm tracking-[0.15em]">
              Plataforma SaaS
            </Eyebrow>
            <h2 className="mt-3 text-2xl font-semibold text-gray-900">
              Control operativo para ligas locales
            </h2>
            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              {features.map((feature) => (
                <li key={feature} className="flex gap-3">
                  <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 rounded-lg bg-gray-50 p-4 text-xs leading-5 text-gray-500">
              Diseñado para reducir trabajo administrativo, publicar información
              clara y mantener a equipos y jugadores al día.
            </p>
          </div>
        </div>

        {/* Mockups de producto */}
        <div className="mt-20">
          <Eyebrow tone="brand" className="text-sm tracking-[0.15em]">
            Vista previa del producto
          </Eyebrow>
          <h2 className="mt-3 text-2xl font-semibold text-gray-900">
            Todo lo que necesitas, en un solo lugar
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Así se ve FutPro Manager desde el panel de administración hasta la
            consulta pública.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Mockup: Panel administrativo */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Panel administrativo
                </span>
              </div>
              <div className="space-y-3 p-4">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Equipos", value: "8" },
                    { label: "Jugadores", value: "96" },
                    { label: "Partidos", value: "24" },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="rounded-lg border border-gray-100 bg-gray-50 p-2 text-center"
                    >
                      <p className="text-lg font-bold text-gray-900">
                        {m.value}
                      </p>
                      <p className="text-xs text-gray-500">{m.label}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-gray-100 p-3">
                  <p className="mb-2 text-xs font-medium text-gray-500">
                    Próximos partidos
                  </p>
                  {[
                    { local: "Águilas FC", visit: "Lobos Norte", hora: "10:00" },
                    {
                      local: "Real Perote",
                      visit: "Halcones SC",
                      hora: "12:00",
                    },
                  ].map((p) => (
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

            {/* Mockup: Tabla de posiciones */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
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
                    {[
                      {
                        pos: 1,
                        nombre: "Águilas FC",
                        pj: 8,
                        pts: 22,
                        dg: "+14",
                        top: true,
                      },
                      {
                        pos: 2,
                        nombre: "Real Perote",
                        pj: 8,
                        pts: 18,
                        dg: "+9",
                        top: false,
                      },
                      {
                        pos: 3,
                        nombre: "Lobos Norte",
                        pj: 8,
                        pts: 15,
                        dg: "+4",
                        top: false,
                      },
                      {
                        pos: 4,
                        nombre: "Halcones SC",
                        pj: 8,
                        pts: 10,
                        dg: "-2",
                        top: false,
                      },
                    ].map((row) => (
                      <tr key={row.pos} className="text-gray-700">
                        <td className="py-1.5 pr-2">
                          {row.top ? (
                            <span className="font-bold text-emerald-700">
                              {row.pos}
                            </span>
                          ) : (
                            row.pos
                          )}
                        </td>
                        <td className="py-1.5 font-medium">{row.nombre}</td>
                        <td className="py-1.5 text-center text-gray-500">
                          {row.pj}
                        </td>
                        <td className="py-1.5 text-center font-bold">
                          {row.pts}
                        </td>
                        <td className="py-1.5 text-center text-gray-500">
                          {row.dg}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mockup: Detalle de partido */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:col-span-2 lg:col-span-1">
              <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Detalle de partido
                </span>
              </div>
              <div className="space-y-4 p-4">
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
                    {
                      min: "12'",
                      tipo: "Gol",
                      jugador: "R. Méndez",
                      equipo: "Águilas FC",
                    },
                    {
                      min: "34'",
                      tipo: "Gol",
                      jugador: "L. Torres",
                      equipo: "Real Perote",
                    },
                    {
                      min: "67'",
                      tipo: "Gol",
                      jugador: "C. Ríos",
                      equipo: "Águilas FC",
                    },
                    {
                      min: "78'",
                      tipo: "Amarilla",
                      jugador: "M. García",
                      equipo: "Real Perote",
                    },
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
                      <span className="truncate text-gray-400">
                        · {ev.equipo}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Beneficios por tipo de usuario */}
        <div className="mt-20">
          <Eyebrow tone="brand" className="text-sm tracking-[0.15em]">
            ¿Para quién es FutPro Manager?
          </Eyebrow>
          <h2 className="mt-3 text-2xl font-semibold text-gray-900">
            Beneficios para cada parte de la liga
          </h2>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {benefits.map((b) => (
              <div
                key={b.role}
                className={`rounded-xl border p-5 ${b.color}`}
              >
                <Eyebrow className="text-xs tracking-[0.14em]">{b.eyebrow}</Eyebrow>
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  {b.role}
                </h3>
                <ul className="mt-3 space-y-2">
                  {b.items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-gray-700">
                      <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gray-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Sección de Planes y Precios */}
        <div id="planes" className="mt-20 scroll-mt-10">
          <div className="text-center">
            <Eyebrow tone="brand" className="text-sm tracking-[0.15em]">
              Precios Transparentes
            </Eyebrow>
            <h2 className="mt-3 text-2xl font-semibold text-gray-900 sm:text-3xl">
              Planes para cualquier tamaño de liga
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600">
              Comienza hoy mismo sin costos ocultos y escala conforme tu torneo crezca.
            </p>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Plan Lanzamiento */}
            <div className="relative rounded-2xl border-2 border-emerald-600 bg-white p-6 sm:p-8 shadow-lg">
              <div className="absolute -top-3.5 right-6 rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-semibold text-white uppercase tracking-wider">
                Activo / Gratuito
              </div>
              <h3 className="text-xl font-bold text-gray-900">Plan Lanzamiento</h3>
              <p className="mt-1 text-xs text-gray-500">
                Todo lo esencial para digitalizar tu liga amateur de inmediato.
              </p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-gray-900">$0</span>
                <span className="text-sm text-gray-500">/ mes (100% gratis)</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" aria-hidden /> 1 liga o torneo completo
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" aria-hidden /> Equipos y jugadores ilimitados
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" aria-hidden /> Tabla de posiciones y resultados en tiempo real
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" aria-hidden /> Estadísticas individuales (goleo y tarjetas)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" aria-hidden /> Cuadro de liguilla y fases finales
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" aria-hidden /> Tarjetas para compartir en WhatsApp
                </li>
              </ul>
              <div className="mt-8">
                <Link
                  href="/login?mode=register"
                  className="block w-full text-center rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition"
                >
                  Comenzar gratis ahora
                </Link>
              </div>
            </div>

            {/* Plan Pro */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="inline-block rounded-full bg-blue-100 text-blue-800 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider mb-2">
                  Próximamente
                </div>
                <h3 className="text-xl font-bold text-gray-900">Plan Pro & Torneos</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Para organizaciones grandes, múltiples categorías y marcas deportivas.
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-gray-700">Personalizado</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-600" aria-hidden /> Múltiples torneos y categorías simultáneas
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-600" aria-hidden /> Dominio web propio (ej. miliga.com)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-600" aria-hidden /> Cédula arbitral digital con firma en cancha
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-600" aria-hidden /> Espacio para patrocinadores de la liga
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-600" aria-hidden /> Soporte prioritario 24/7 por WhatsApp
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  href="/contacto"
                  className="block w-full text-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 transition"
                >
                  Solicitar información o demo
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Sección FAQ */}
        <div id="faq" className="mt-20 scroll-mt-10">
          <div className="text-center">
            <Eyebrow tone="brand" className="text-sm tracking-[0.15em]">
              Preguntas Frecuentes
            </Eyebrow>
            <h2 className="mt-3 text-2xl font-semibold text-gray-900 sm:text-3xl">
              Resolvemos tus dudas
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600">
              Todo lo que necesitas saber antes de empezar a usar FutPro Manager.
            </p>
          </div>

          <div className="mt-10 max-w-3xl mx-auto divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group py-4 first:pt-0 last:pb-0 cursor-pointer"
              >
                <summary className="flex items-center justify-between font-semibold text-gray-900 hover:text-emerald-700 list-none">
                  <span>{faq.q}</span>
                  <span className="ml-4 shrink-0 transition-transform group-open:rotate-180 text-gray-400">
                    <ChevronDown className="h-4 w-4" aria-hidden />
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* CTA final */}
        <div className="mt-20 flex flex-col items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-6 py-10 text-center sm:px-10">
          <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            Empieza a digitalizar tu liga hoy
          </h2>
          <p className="max-w-md text-sm text-gray-600">
            Sin costo durante el lanzamiento. Sin tarjeta de crédito.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login?mode=register"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
            >
              Crear cuenta gratis
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 transition hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      <FloatingWhatsAppButton />

      <PublicFooter />
    </main>
  );
}
