import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, Mail, MessageCircle } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { ContactForm } from "@/components/contact/contact-form";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PublicFooter } from "@/components/public/public-footer";
import { CONTACT_EMAIL } from "@/lib/site";

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
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Volver al inicio
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
            {/* WhatsApp (próximamente) */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-200">
                  <MessageCircle className="h-5 w-5 text-gray-500" aria-hidden />
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">WhatsApp Directo</h3>
                  <p className="text-xs text-gray-500">Respuesta rápida</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-600">
                Estamos habilitando un número dedicado para atención por
                WhatsApp.
              </p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-500">
                  <Clock className="h-4 w-4" aria-hidden />
                  Próximamente
                </span>
              </div>
              <div className="mt-3 flex justify-center">
                <StatusBadge variant="neutral">Próximamente</StatusBadge>
              </div>
            </div>

            {/* Email */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                  <Mail className="h-5 w-5 text-blue-700" aria-hidden />
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
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-3 inline-block break-all text-xs font-medium text-emerald-700 hover:underline"
              >
                {CONTACT_EMAIL}
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

            <ContactForm />
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
