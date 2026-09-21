import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Flame,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { LogtoSignInButton } from "@/components/auth/logto-buttons";
import { createClient } from "@/lib/supabase/server";
import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/app/logto";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; suspended?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let logtoAuthenticated = false;
  try {
    if (logtoConfig.appSecret && logtoConfig.cookieSecret) {
      const ctx = await getLogtoContext(logtoConfig);
      logtoAuthenticated = ctx.isAuthenticated;
    }
  } catch {
    logtoAuthenticated = false;
  }

  if (user || logtoAuthenticated) {
    redirect("/dashboard");
  }

  const { mode, suspended } = await searchParams;
  const initialMode =
    mode === "register"
      ? "register"
      : mode === "forgot_password"
      ? "forgot_password"
      : "login";

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white selection:bg-emerald-500 selection:text-white">
      {/* Luces de ambiente y orbes de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-600/15 blur-[120px] animate-float-ambient"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-teal-600/10 blur-[140px] animate-pulse-glow-ring"
      />

      {/* Trazos geométricos de cancha de fútbol en SVG */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full stroke-emerald-500/[0.04] stroke-[1.5]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="tactical-grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 60 0 L 0 0 0 60" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tactical-grid)" />
        {/* Círculo central estilizado */}
        <circle cx="20%" cy="50%" r="180" fill="none" className="stroke-emerald-400/[0.05]" />
        <line x1="20%" y1="0" x2="20%" y2="100%" className="stroke-emerald-400/[0.04]" />
      </svg>

      {/* Contenedor principal */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-4 py-6 sm:px-6 lg:px-8">
        {/* Barra superior de navegación */}
        <header className="flex items-center justify-between animate-enter-fade-down">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-gray-200 backdrop-blur-md transition hover:border-emerald-400/40 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5 text-emerald-400" />
            <span>Volver al inicio</span>
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-md shadow-emerald-950">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white sm:text-base">
              FutPro <span className="text-emerald-400">Manager</span>
            </span>
          </Link>
        </header>

        {/* Sección central con 2 columnas */}
        <div className="my-auto grid w-full gap-10 py-8 lg:grid-cols-12 lg:items-center lg:gap-14">
          {/* Columna Izquierda: Showcase de la plataforma */}
          <section className="space-y-6 lg:col-span-6 xl:col-span-7 animate-enter-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Plataforma Cloud para Fútbol Amateur</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.15]">
                Lleva la gestión de tu liga al{" "}
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
                  siguiente nivel
                </span>
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-gray-300 sm:text-base">
                Olvida las hojas de cálculo y los grupos desorganizados. Administra
                torneos, cédulas digitales en cancha, tablas automáticas y plantillas en un solo lugar.
              </p>
            </div>

            {/* Ventajas destacadas */}
            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-sm transition hover:border-emerald-500/30 hover:bg-white/[0.07]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white">Tablas y Goleo en Vivo</h2>
                  <p className="mt-0.5 text-[11px] text-gray-400 leading-snug">
                    Puntos y estadísticas recalculados al instante de terminar el partido.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-sm transition hover:border-emerald-500/30 hover:bg-white/[0.07]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white">Cédulas y Árbitros</h2>
                  <p className="mt-0.5 text-[11px] text-gray-400 leading-snug">
                    Captura goles y tarjetas desde el celular sin papeles mojados ni pérdidas.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-sm transition hover:border-emerald-500/30 hover:bg-white/[0.07]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white">Equipos y Fichajes</h2>
                  <p className="mt-0.5 text-[11px] text-gray-400 leading-snug">
                    Control de plantillas, dorsales y habilitación de jugadores federados.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-sm transition hover:border-emerald-500/30 hover:bg-white/[0.07]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white">Portal Público 100% Abierto</h2>
                  <p className="mt-0.5 text-[11px] text-gray-400 leading-snug">
                    Jugadores y aficionados consultan roles y resultados sin necesidad de cuenta.
                  </p>
                </div>
              </div>
            </div>

            {/* Widget interactivo de partido en vivo simulado */}
            <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/50 via-slate-900/60 to-emerald-950/40 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="font-semibold text-emerald-300">Torneo Apertura 2026</span>
                </div>
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-gray-300">
                  Jornada 10 · Min 78&apos;
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-emerald-700/80 flex items-center justify-center text-[10px] font-bold">
                    DA
                  </div>
                  <span className="text-xs font-medium text-white">Deportivo Azteca</span>
                </div>
                <div className="rounded-lg bg-black/40 px-3 py-1 font-mono text-sm font-bold text-emerald-400">
                  3 - 2
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white">Real Sporting</span>
                  <div className="h-6 w-6 rounded-full bg-blue-700/80 flex items-center justify-center text-[10px] font-bold">
                    RS
                  </div>
                </div>
              </div>
              <p className="mt-2.5 text-[11px] text-emerald-400/80 flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" />
                Actualización instantánea en la tabla general de posiciones
              </p>
            </div>
          </section>

          {/* Columna Derecha: Tarjeta con Formulario */}
          <section className="lg:col-span-6 xl:col-span-5 animate-enter-fade-scale anim-delay-150">
            <div className="relative rounded-3xl border border-white/15 bg-white/95 p-6 shadow-2xl shadow-emerald-950/50 backdrop-blur-2xl sm:p-8 md:p-9 text-gray-900">
              {/* Micro línea decorativa superior */}
              <div className="absolute inset-x-8 -top-px h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

              <LoginForm initialMode={initialMode} suspendedNotice={suspended === "1"} />
              <div className="mt-4 border-t border-gray-200 pt-4">
                <p className="mb-2 text-center text-xs text-gray-500">
                  ¿Sin correo? Usa tu cuenta social
                </p>
                <LogtoSignInButton />
              </div>
            </div>
          </section>
        </div>

        {/* Footer minimalista */}
        <footer className="mt-8 border-t border-white/10 pt-6 animate-enter-fade-up anim-delay-300">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row text-xs text-gray-400">
            <p>© {new Date().getFullYear()} FutPro Manager. Todos los derechos reservados.</p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <Link href="/" className="transition hover:text-emerald-300 hover:underline">
                Inicio
              </Link>
              <Link href="/explorar" className="transition hover:text-emerald-300 hover:underline">
                Explorar ligas
              </Link>
              <Link href="/contacto" className="transition hover:text-emerald-300 hover:underline">
                Contacto
              </Link>
              <Link href="/privacidad" className="transition hover:text-emerald-300 hover:underline">
                Aviso de privacidad
              </Link>
              <Link href="/terminos" className="transition hover:text-emerald-300 hover:underline">
                Términos y condiciones
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
