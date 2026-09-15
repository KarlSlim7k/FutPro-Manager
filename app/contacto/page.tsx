import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PublicFooter } from "@/components/public/public-footer";

export const metadata: Metadata = {
  title: "Contacto y Soporte",
  description:
    "Ponte en contacto con el equipo de FutPro Manager. Asesoría para digitalizar tu liga de fútbol amateur, soporte técnico y demostraciones.",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-gradient-to-b from-emerald-50 via-white to-gray-100">
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded"
          >
            ← Volver al inicio
          </Link>
          <div className="mt-4">
            <Eyebrow tone="brand" className="text-sm tracking-[0.16em]">
              Atención y Soporte
            </Eyebrow>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Contacto y Asesoría para tu Liga
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              ¿Quieres digitalizar tu torneo, resolver dudas técnicas o agendar
              una demostración guiada? Nuestro equipo te acompaña en la cancha.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Canales de Contacto Rápido */}
          <div className="space-y-4 lg:col-span-1">
            {/* WhatsApp */}
            <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-xl">
                  💬
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">WhatsApp Directo</h3>
                  <p className="text-xs text-gray-500">Respuesta rápida</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-600 leading-relaxed">
                El canal más rápido para organizadores de torneos. Chatea
                directamente con un asesor deportivo.
              </p>
              <a
                href="https://wa.me/522821105432?text=Hola%20FutPro%20Manager,%20quisiera%20informaci%C3%B3n%20para%20mi%20liga"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600"
              >
                <span>Enviar mensaje por WhatsApp</span>
                <span>↗</span>
              </a>
            </div>

            {/* Email */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-xl">
                  ✉️
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">Correo Electrónico</h3>
                  <p className="text-xs text-gray-500">Soporte general</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-600 leading-relaxed">
                Para solicitudes institucionales, aclaraciones legales o reportes
                técnicos.
              </p>
              <a
                href="mailto:contacto@futpromanager.com"
                className="mt-3 inline-block text-xs font-medium text-emerald-700 hover:underline"
              >
                contacto@futpromanager.com
              </a>
            </div>

            {/* Horario de Atención */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-xs text-gray-600">
              <p className="font-semibold text-gray-800">Horario de soporte:</p>
              <p className="mt-1">Lunes a Viernes: 9:00 AM – 7:00 PM</p>
              <p>Sábados y Domingos: Guardia activa para jornadas de fin de semana.</p>
            </div>
          </div>

          {/* Formulario de Contacto */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900">
              Cuéntanos sobre tu liga o torneo
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Déjanos tus datos y nos pondremos en contacto contigo para ayudarte
              a configurar tu torneo en minutos.
            </p>

            <form
              className="mt-6 space-y-4"
              action="mailto:contacto@futpromanager.com"
              method="GET"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="name" className="text-xs font-medium text-gray-700">
                    Tu nombre completo
                  </label>
                  <input
                    id="name"
                    name="subject"
                    required
                    placeholder="Ej. Roberto Sánchez"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="league" className="text-xs font-medium text-gray-700">
                    Nombre de tu liga o torneo
                  </label>
                  <input
                    id="league"
                    placeholder="Ej. Liga Dominical Premier"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="email" className="text-xs font-medium text-gray-700">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="tu-correo@ejemplo.com"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="phone" className="text-xs font-medium text-gray-700">
                    Teléfono o WhatsApp (opcional)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Ej. 282 123 4567"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="body" className="text-xs font-medium text-gray-700">
                  ¿En qué podemos ayudarte?
                </label>
                <textarea
                  id="body"
                  name="body"
                  rows={4}
                  required
                  placeholder="Cuéntanos cuántos equipos tienes, qué formato juegas o qué dudas tienes sobre la plataforma..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              >
                Enviar consulta por correo
              </button>
            </form>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
