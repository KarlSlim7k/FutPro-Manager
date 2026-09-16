"use client";

import { openCookieSettings } from "@/components/privacy/cookie-consent";

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className="transition hover:text-emerald-700 hover:underline"
    >
      Preferencias de cookies
    </button>
  );
}
