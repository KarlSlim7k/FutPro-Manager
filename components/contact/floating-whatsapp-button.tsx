"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/site";
import { COOKIE_SETTINGS_EVENT, readCookieConsent } from "@/components/privacy/cookie-consent";

// Only renders once a dedicated WhatsApp number is configured.
export function FloatingWhatsAppButton() {
  const [hasCookieBanner, setHasCookieBanner] = useState(false);
  const href = buildWhatsAppLink(WHATSAPP_DEFAULT_MESSAGE);

  useEffect(() => {
    // Si no ha aceptado cookies, el banner estará visible inicialmente
    const timer = window.setTimeout(() => {
      if (!readCookieConsent()) {
        setHasCookieBanner(true);
      }
    }, 0);

    const handleBannerChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ open?: boolean }>;
      setHasCookieBanner(Boolean(customEvent.detail?.open));
    };

    const handleOpenSettings = () => {
      setHasCookieBanner(true);
    };

    window.addEventListener("futpro:cookie-banner-change", handleBannerChange);
    window.addEventListener(COOKIE_SETTINGS_EVENT, handleOpenSettings);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("futpro:cookie-banner-change", handleBannerChange);
      window.removeEventListener(COOKIE_SETTINGS_EVENT, handleOpenSettings);
    };
  }, []);

  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed right-4 sm:right-6 z-40 flex min-h-[44px] items-center gap-2 rounded-full bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-900/20 transition-all duration-300 hover:bg-emerald-600 hover:scale-105 active:scale-95 active:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 touch-manipulation select-none ${
        hasCookieBanner
          ? "bottom-[calc(env(safe-area-inset-bottom,0px)+11.5rem)] sm:bottom-[calc(env(safe-area-inset-bottom,0px)+6.5rem)]"
          : "bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)] sm:bottom-6"
      }`}
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
      <span className="hidden sm:inline text-xs font-medium">¿Dudas? Chatea con nosotros</span>
    </a>
  );
}
