import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, Headphones, Mail, MessageCircle, Trophy } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { PublicFooter } from "@/components/public/public-footer";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto y Soporte",
  description:
    "Ponte en contacto con el equipo de FutPro Manager. Asesoría para digitalizar tu liga de fútbol amateur, soporte técnico y demostraciones.",
};

export default function ContactPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      {/* Luces de ambiente y orbes de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-600/15 blur-[120px] animate-float-ambient"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-10 -right-40 h-[600px] w-[600px] rounded-full bg-teal-600/10 blur-[140px] animate-pulse-glow-ring"
      />

      {/* Trazos geométricos de cancha de fútbol en SVG */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full stroke-emerald-500/[0.035] stroke-[1.5]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="contact-tactical-grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 60 0 L 0 0 0 60" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#contact-tactical-grid)" />
        <circle cx="20%" cy="45%" r="180" fill="none" className="stroke-emerald-400/[0.04]" />
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

        {/* Encabezado */}
        <div className="mb-10 space-y-3 animate-enter-fade-up">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
            <Headphones className="h-3.5 w-3.5 text-emerald-400" />
            <span>Atención y Soporte</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Contacto y Asesoría para{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
              tu Liga
            </span>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base">
            ¿Quieres digitalizar tu torneo, resolver dudas técnicas o agendar una demostración guiada?
            Nuestro equipo te acompaña directamente en la cancha.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start animate-enter-fade-up anim-delay-150">
          {/* Canales de Contacto Rápido (Izquierda: 5 columnas) */}
          <div className="space-y-4 lg:col-span-5">
            {/* WhatsApp */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md transition hover:border-emerald-500/30 hover:bg-white/[0.06]">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 shadow-inner">
                  <MessageCircle className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-bold text-white text-base">WhatsApp Directo</h3>
                  <p className="text-xs text-emerald-400">Respuesta ágil en cancha</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-300">
                Estamos habilitando un número oficial dedicado para asesoría y atención inmediata a presidentes de liga.
              </p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-gray-300">
                  <Clock className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
                  Habilitándose
                </span>
              </div>
            </div>

            {/* Email */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md transition hover:border-emerald-500/30 hover:bg-white/[0.06]">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 shadow-inner">
                  <Mail className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-bold text-white text-base">Correo Electrónico</h3>
                  <p className="text-xs text-gray-400">Soporte general e institucional</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-300">
                Para solicitudes institucionales, aclaraciones de torneos o reportes técnicos de la plataforma.
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-3 inline-block break-all text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </div>

            {/* Horario de Atención */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-xs text-gray-400">
              <p className="font-semibold text-white">Horario de soporte:</p>
              <p className="mt-1 text-gray-300">Lunes a Viernes: 9:00 AM – 7:00 PM</p>
              <p className="text-gray-300">Sábados y Domingos: Guardia activa durante jornadas de partidos.</p>
            </div>
          </div>

          {/* Formulario de Contacto (Derecha: 7 columnas, estilo tarjeta /login) */}
          <div className="relative rounded-3xl border border-white/15 bg-white/95 p-6 shadow-2xl shadow-emerald-950/50 backdrop-blur-2xl sm:p-8 md:p-9 text-gray-900 lg:col-span-7">
            {/* Micro línea decorativa superior */}
            <div className="absolute inset-x-8 -top-px h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Cuéntanos sobre tu liga o torneo
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Déjanos tus datos y nos pondremos en contacto contigo para ayudarte a configurar tu torneo en minutos.
            </p>

            <ContactForm />
          </div>
        </div>
      </main>

      <div className="relative z-10 mt-16">
        <PublicFooter theme="dark" />
      </div>
    </div>
  );
}
