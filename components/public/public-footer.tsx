import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { CookieSettingsButton } from "@/components/privacy/cookie-settings-button";
import { buildWhatsAppLink } from "@/lib/site";
import { cn } from "@/lib/utils";

const whatsappHref = buildWhatsAppLink(
  "Hola, quisiera información sobre FutPro Manager"
);

export function PublicFooter({
  theme = "light",
  className,
}: {
  theme?: "dark" | "light";
  className?: string;
}) {
  const isDark = theme === "dark";

  return (
    <footer
      className={cn(
        "mt-20 border-t transition-colors",
        isDark
          ? "border-white/10 bg-slate-950 text-gray-400"
          : "border-gray-200 bg-white text-gray-600",
        className
      )}
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Eyebrow
              tone={isDark ? "brand" : "brand"}
              className={cn(
                "text-sm tracking-[0.18em]",
                isDark && "text-emerald-400"
              )}
            >
              FutPro Manager
            </Eyebrow>
            <p
              className={cn(
                "mt-3 max-w-sm text-sm",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              Plataforma SaaS para digitalizar ligas de fútbol amateur. Administra
              equipos, plantillas, resultados y estadísticas oficiales en un solo lugar.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                Plataforma activa y en evolución continua
              </span>
            </div>
          </div>

          {/* Navegación y consulta */}
          <div>
            <h3
              className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              Explorar
            </h3>
            <ul
              className={cn(
                "mt-3 space-y-2 text-sm",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              <li>
                <Link
                  href="/"
                  className={cn(
                    "transition hover:underline",
                    isDark ? "hover:text-emerald-400" : "hover:text-emerald-700"
                  )}
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/explorar"
                  className={cn(
                    "transition hover:underline",
                    isDark ? "hover:text-emerald-400" : "hover:text-emerald-700"
                  )}
                >
                  Buscar ligas
                </Link>
              </li>
              <li>
                <Link
                  href="/explorar"
                  className={cn(
                    "transition hover:underline",
                    isDark ? "hover:text-emerald-400" : "hover:text-emerald-700"
                  )}
                >
                  Liga demo
                </Link>
              </li>
              <li>
                <Link
                  href="/#planes"
                  className={cn(
                    "transition hover:underline",
                    isDark ? "hover:text-emerald-400" : "hover:text-emerald-700"
                  )}
                >
                  Planes y precios
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className={cn(
                    "transition hover:underline",
                    isDark ? "hover:text-emerald-400" : "hover:text-emerald-700"
                  )}
                >
                  Preguntas frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Soporte y ayuda */}
          <div>
            <h3
              className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              Soporte
            </h3>
            <ul
              className={cn(
                "mt-3 space-y-2 text-sm",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              <li>
                <Link
                  href="/contacto"
                  className={cn(
                    "transition hover:underline",
                    isDark ? "hover:text-emerald-400" : "hover:text-emerald-700"
                  )}
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
                    className={cn(
                      "inline-flex items-center gap-1.5 transition hover:underline",
                      isDark ? "hover:text-emerald-400" : "hover:text-emerald-700"
                    )}
                  >
                    <span>WhatsApp soporte</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-gray-400" aria-hidden />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-gray-400">
                    <span>WhatsApp soporte</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        isDark ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-600"
                      )}
                    >
                      Próximamente
                    </span>
                  </span>
                )}
              </li>
              <li>
                <Link
                  href="/login"
                  className={cn(
                    "transition hover:underline",
                    isDark ? "hover:text-emerald-400" : "hover:text-emerald-700"
                  )}
                >
                  Acceso administradores
                </Link>
              </li>
              <li>
                <Link
                  href="/login?mode=register"
                  className={cn(
                    "transition hover:underline",
                    isDark ? "hover:text-emerald-400" : "hover:text-emerald-700"
                  )}
                >
                  Crear cuenta gratis
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3
              className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              Legal
            </h3>
            <ul
              className={cn(
                "mt-3 space-y-2 text-sm",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              <li>
                <Link
                  href="/privacidad"
                  className={cn(
                    "transition hover:underline",
                    isDark ? "hover:text-emerald-400" : "hover:text-emerald-700"
                  )}
                >
                  Aviso de privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/terminos"
                  className={cn(
                    "transition hover:underline",
                    isDark ? "hover:text-emerald-400" : "hover:text-emerald-700"
                  )}
                >
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <CookieSettingsButton />
              </li>
              <li>
                <span className="text-xs text-gray-500">
                  Cumplimiento LFPDPPP
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div
          className={cn(
            "mt-10 border-t pt-6 flex flex-col items-center justify-between gap-4 sm:flex-row text-xs",
            isDark
              ? "border-white/10 text-gray-500"
              : "border-gray-100 text-gray-500"
          )}
        >
          <p>© {new Date().getFullYear()} FutPro Manager. Todos los derechos reservados.</p>
          <p className="text-center sm:text-right">
            Desarrollado con pasión para impulsar el deporte y fútbol amateur.
          </p>
        </div>
      </div>
    </footer>
  );
}
