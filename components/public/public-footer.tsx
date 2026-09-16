import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { CookieSettingsButton } from "@/components/privacy/cookie-settings-button";
import { buildWhatsAppLink } from "@/lib/site";

const whatsappHref = buildWhatsAppLink(
  "Hola, quisiera información sobre FutPro Manager"
);

export function PublicFooter() {
  return (
    <footer className="mt-20 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Eyebrow tone="brand" className="text-sm tracking-[0.18em]">
              FutPro Manager
            </Eyebrow>
            <p className="mt-3 max-w-sm text-sm text-gray-600">
              Plataforma SaaS para digitalizar ligas de fútbol amateur. Administra
              equipos, plantillas, resultados y estadísticas oficiales en un solo lugar.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span>Plataforma activa y en evolución continua</span>
            </div>
          </div>

          {/* Navegación y consulta */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900">
              Explorar
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>
                <Link
                  href="/"
                  className="transition hover:text-emerald-700 hover:underline"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/explorar"
                  className="transition hover:text-emerald-700 hover:underline"
                >
                  Buscar ligas
                </Link>
              </li>
              <li>
                <Link
                  href="/explorar"
                  className="transition hover:text-emerald-700 hover:underline"
                >
                  Liga demo
                </Link>
              </li>
              <li>
                <Link
                  href="/#planes"
                  className="transition hover:text-emerald-700 hover:underline"
                >
                  Planes y precios
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="transition hover:text-emerald-700 hover:underline"
                >
                  Preguntas frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Soporte y ayuda */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900">
              Soporte
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>
                <Link
                  href="/contacto"
                  className="transition hover:text-emerald-700 hover:underline"
                >
                  Contacto directo
                </Link>
              </li>
              <li>
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 transition hover:text-emerald-700 hover:underline"
                  >
                    <span>WhatsApp soporte</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-gray-400" aria-hidden />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-gray-400">
                    <span>WhatsApp soporte</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                      Próximamente
                    </span>
                  </span>
                )}
              </li>
              <li>
                <Link
                  href="/login"
                  className="transition hover:text-emerald-700 hover:underline"
                >
                  Acceso administradores
                </Link>
              </li>
              <li>
                <Link
                  href="/login?mode=register"
                  className="transition hover:text-emerald-700 hover:underline"
                >
                  Crear cuenta gratis
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900">
              Legal
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>
                <Link
                  href="/privacidad"
                  className="transition hover:text-emerald-700 hover:underline"
                >
                  Aviso de privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/terminos"
                  className="transition hover:text-emerald-700 hover:underline"
                >
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <CookieSettingsButton />
              </li>
              <li>
                <span className="text-xs text-gray-400">
                  Cumplimiento LFPDPPP
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-100 pt-6 flex flex-col items-center justify-between gap-4 sm:flex-row text-xs text-gray-500">
          <p>© {new Date().getFullYear()} FutPro Manager. Todos los derechos reservados.</p>
          <p className="text-center sm:text-right">
            Desarrollado con pasión para impulsar el deporte y fútbol amateur.
          </p>
        </div>
      </div>
    </footer>
  );
}
