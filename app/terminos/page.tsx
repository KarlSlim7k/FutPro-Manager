import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, Trophy } from "lucide-react";
import { PublicFooter } from "@/components/public/public-footer";

export const metadata: Metadata = {
  title: "Términos y Condiciones del Servicio",
  description:
    "Términos y condiciones de uso de la plataforma SaaS FutPro Manager para ligas de fútbol amateur.",
};

export default function TermsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      {/* Luces de ambiente y orbes de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-600/15 blur-[120px] animate-float-ambient"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-1/4 -right-40 h-[600px] w-[600px] rounded-full bg-teal-600/10 blur-[140px] animate-pulse-glow-ring"
      />

      {/* Trazos geométricos de cancha de fútbol en SVG */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full stroke-emerald-500/[0.035] stroke-[1.5]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="terms-tactical-grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 60 0 L 0 0 0 60" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#terms-tactical-grid)" />
        <circle cx="20%" cy="40%" r="200" fill="none" className="stroke-emerald-400/[0.04]" />
      </svg>

      <main className="relative z-10 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
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

        {/* Encabezado */}
        <div className="mb-8 space-y-3 animate-enter-fade-up">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
            <FileText className="h-3.5 w-3.5 text-emerald-400" />
            <span>Legal y Servicio</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Términos y Condiciones de{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
              Servicio
            </span>
          </h1>
          <p className="text-xs text-gray-400 font-mono">
            Última actualización: Septiembre de 2026
          </p>
        </div>

        <div className="space-y-8 rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-10 backdrop-blur-xl shadow-2xl shadow-emerald-950/40 text-gray-300 leading-relaxed text-sm sm:text-base animate-enter-fade-up anim-delay-150">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              1. Aceptación de los Términos
            </h2>
            <p>
              Al acceder, registrarse o utilizar el sitio web y los servicios de{" "}
              <strong className="text-white">FutPro Manager</strong>, usted declara que ha leído,
              entendido y acepta quedar legalmente obligado por los presentes
              Términos y Condiciones. Si no está de acuerdo con alguna parte de
              estos términos, deberá abstenerse de utilizar la plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              2. Descripción del Servicio
            </h2>
            <p>
              FutPro Manager es una plataforma informática de tipo Software as a
              Service (SaaS) destinada a facilitar la gestión operativa y la
              difusión pública de información para ligas, torneos, clubes y
              equipos de fútbol amateur. Entre sus funcionalidades se incluyen el
              registro de equipos y plantillas, generación de roles de juego,
              captura de cédulas arbitrales en cancha, cálculo automatizado de
              tablas de posiciones y consulta pública en tiempo real.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              3. Cuentas de Usuario y Seguridad
            </h2>
            <p>
              Para acceder a las herramientas administrativas es necesario crear
              una cuenta. El usuario es el único responsable de mantener la
              confidencialidad de sus credenciales de acceso y de todas las
              actividades que ocurran bajo su cuenta. Se compromete a notificar de
              inmediato cualquier uso no autorizado.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              4. Uso Aceptable y Contenido
            </h2>
            <p>El usuario se compromete a no:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-300">
              <li>
                Registrar datos falsos de jugadores, equipos o resultados
                deportivos con el propósito de alterar indebidamente las
                competencias.
              </li>
              <li>
                Subir material que infrinja derechos de autor, marcas registradas
                o que resulte ofensivo, difamatorio o ilegal.
              </li>
              <li>
                Intentar vulnerar la seguridad, autenticación o infraestructura
                técnica de los servidores del servicio.
              </li>
              <li>
                Utilizar mecanismos automatizados (bots, scrapers) que degraden el
                rendimiento del portal para otros usuarios.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              5. Disponibilidad del Servicio
            </h2>
            <p>
              Nos esforzamos por mantener una disponibilidad continua del
              servicio. No obstante, el acceso puede suspenderse temporalmente por
              mantenimiento programado, actualizaciones de seguridad o causas de
              fuerza mayor fuera de nuestro control. FutPro Manager no asume
              responsabilidad por pérdidas derivadas de interrupciones técnicas
              imprevistas.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              6. Propiedad Intelectual
            </h2>
            <p>
              El código fuente, diseño, logotipos, elementos gráficos y marcas
              asociadas a FutPro Manager son propiedad exclusiva de sus
              desarrolladores. Los datos deportivos ingresados por cada liga
              (nombres de equipos, resultados, fotografías aportadas) pertenecen a
              sus respectivos titulares, otorgando a FutPro Manager una licencia
              no exclusiva para su procesamiento y difusión en el portal.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              7. Ley Aplicable y Jurisdicción
            </h2>
            <p>
              Los presentes términos se rigen por las leyes federales de los
              Estados Unidos Mexicanos. Para la resolución de cualquier
              controversia, las partes se someten a la jurisdicción de los
              tribunales competentes del Estado de Veracruz, renunciando a
              cualquier otro fuero que pudiera corresponderles por razón de sus
              domicilios presentes o futuros.
            </p>
          </section>
        </div>
      </main>

      <div className="relative z-10 mt-16">
        <PublicFooter theme="dark" />
      </div>
    </div>
  );
}
