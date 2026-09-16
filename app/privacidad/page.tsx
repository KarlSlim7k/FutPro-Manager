import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Trophy } from "lucide-react";
import { PublicFooter } from "@/components/public/public-footer";

export const metadata: Metadata = {
  title: "Aviso de Privacidad",
  description:
    "Aviso de Privacidad integral de FutPro Manager conforme a la normativa de protección de datos personales.",
};

export default function PrivacyPage() {
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
            id="privacy-tactical-grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 60 0 L 0 0 0 60" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#privacy-tactical-grid)" />
        <circle cx="80%" cy="30%" r="220" fill="none" className="stroke-emerald-400/[0.04]" />
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
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Legal y Cumplimiento</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Aviso de Privacidad{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
              Integral
            </span>
          </h1>
          <p className="text-xs text-gray-400 font-mono">
            Última actualización: Septiembre de 2026
          </p>
        </div>

        <div className="space-y-8 rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-10 backdrop-blur-xl shadow-2xl shadow-emerald-950/40 text-gray-300 leading-relaxed text-sm sm:text-base animate-enter-fade-up anim-delay-150">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              1. Identidad y Domicilio del Responsable
            </h2>
            <p>
              <strong className="text-white">FutPro Manager</strong>, con operación y desarrollo en el
              municipio de Perote, Veracruz, México, es responsable del uso,
              tratamiento y protección de los datos personales recabados a través
              del portal web y sus servicios conexos, en estricto apego a la Ley
              Federal de Protección de Datos Personales en Posesión de los
              Particulares (LFPDPPP) y su Reglamento.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              2. Datos Personales que Recabamos
            </h2>
            <p>
              Para prestar los servicios de gestión deportiva y consulta
              pública, recabamos las siguientes categorías de datos:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-300">
              <li>
                <strong className="text-white">Administradores de liga y cuerpo técnico:</strong> nombre
                completo, dirección de correo electrónico, contraseña cifrada,
                número de teléfono (opcional) y rol asignado en la liga.
              </li>
              <li>
                <strong className="text-white">Jugadores:</strong> nombre, apellidos, fotografía de
                perfil (opcional), número dorsal, posición deportiva y estadísticas
                en partidos oficiales. No recabamos datos biométricos ni
                documentos de identidad sensible sin consentimiento expreso.
              </li>
              <li>
                <strong className="text-white">Árbitros y oficiales:</strong> nombre, designación de
                partido e incidencias reportadas en cédula arbitral.
              </li>
              <li>
                <strong className="text-white">Usuarios y visitantes públicos:</strong> dirección IP,
                identificadores de dispositivo y analíticas de navegación anónimas
                con fines de rendimiento y seguridad.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              3. Finalidades del Tratamiento
            </h2>
            <p>Los datos recabados son utilizados para:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-300">
              <li>Creación y gestión de cuentas de usuario en la plataforma.</li>
              <li>
                Administración de ligas, temporadas, calendarios de juego y
                cédulas arbitrales digitales.
              </li>
              <li>
                Publicación de resultados deportivos, tablas de posiciones y
                estadísticas de goleo en el portal público.
              </li>
              <li>
                Comunicación operativa relacionada con el servicio, avisos de
                seguridad y recuperación de accesos.
              </li>
              <li>
                Atención a solicitudes de soporte, dudas y demostraciones del
                sistema.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              4. Transferencia de Datos
            </h2>
            <p>
              FutPro Manager <strong className="text-white">no vende, alquila ni comercializa</strong> sus
              datos personales a terceros. Únicamente compartimos información con
              proveedores de infraestructura tecnológica indispensables para la
              operación (alojamiento en la nube y bases de datos seguras con cifrado en reposo y en tránsito), bajo estrictos acuerdos de
              confidencialidad.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              5. Derechos ARCO y Revocación del Consentimiento
            </h2>
            <p>
              Usted tiene derecho a conocer qué datos personales tenemos de usted,
              para qué los utilizamos y las condiciones del uso que les damos
              (Acceso). Asimismo, es su derecho solicitar la corrección de su
              información personal en caso de que esté desactualizada, sea
              inexacta o incompleta (Rectificación); que la eliminemos de
              nuestros registros o bases de datos cuando considere que la misma
              no está siendo utilizada adecuadamente (Cancelación); así como
              oponerse al uso de sus datos personales para fines específicos
              (Oposición).
            </p>
            <p>
              Para el ejercicio de cualquiera de los derechos ARCO o para revocar
              su consentimiento, envíe una solicitud a través de nuestra página de{" "}
              <Link href="/contacto" className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline">
                Contacto
              </Link>
              . Su solicitud será atendida en un plazo máximo de 20 días hábiles.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              6. Uso de Cookies y Tecnologías de Rastreo
            </h2>
            <p>
              Utilizamos cookies estrictamente necesarias para el inicio de sesión
              y la seguridad de la sesión, así como cookies analíticas para
              comprender el uso del sitio. Puede gestionar sus preferencias en
              cualquier momento desde el pie de página del portal.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              7. Cambios al Aviso de Privacidad
            </h2>
            <p>
              El presente aviso de privacidad puede sufrir modificaciones,
              cambios o actualizaciones derivadas de nuevos requerimientos legales
              o de mejoras en nuestras prácticas de privacidad. Cualquier cambio
              sustancial será publicado en esta misma sección.
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
