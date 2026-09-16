"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import {
  COOKIE_SETTINGS_EVENT,
  readCookieConsent,
  writeCookieConsent,
} from "@/components/privacy/cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const needsConsent = !readCookieConsent();
      if (needsConsent) {
        setVisible(true);
        window.dispatchEvent(new CustomEvent("futpro:cookie-banner-change", { detail: { open: true } }));
      }
    }, 0);
    const reopen = () => {
      setVisible(true);
      window.dispatchEvent(new CustomEvent("futpro:cookie-banner-change", { detail: { open: true } }));
    };
    window.addEventListener(COOKIE_SETTINGS_EVENT, reopen);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(COOKIE_SETTINGS_EVENT, reopen);
    };
  }, []);

  const decide = useCallback((optional: boolean) => {
    writeCookieConsent(optional);
    setVisible(false);
    window.dispatchEvent(new CustomEvent("futpro:cookie-banner-change", { detail: { open: false } }));
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] sm:px-6 sm:pb-6"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl shadow-gray-900/10">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
            <Cookie className="h-5 w-5 text-emerald-700" aria-hidden />
          </span>
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-gray-900">
              Usamos cookies necesarias
            </p>
            <p className="mt-1 leading-6">
              Utilizamos cookies estrictamente necesarias para mantener tu
              sesión iniciada y la seguridad del sitio. No usamos cookies de
              publicidad ni rastreo de terceros. Puedes aceptar o seguir solo
              con las necesarias.{" "}
              <Link href="/privacidad" className="font-medium text-emerald-700 hover:underline">
                Ver aviso de privacidad
              </Link>
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => decide(false)}
            className="flex min-h-[44px] items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-400 active:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 touch-manipulation"
          >
            Solo necesarias
          </button>
          <button
            type="button"
            onClick={() => decide(true)}
            className="flex min-h-[44px] items-center justify-center rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 active:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 touch-manipulation"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
}
