// Cookie consent state (stored locally, no tracking).
// Categories: "necessary" (auth session, always on) and "optional"
// (future analytics/preferences — currently unused).

export const COOKIE_CONSENT_KEY = "futpro-cookie-consent";
export const COOKIE_SETTINGS_EVENT = "futpro:open-cookie-settings";

export type CookieConsent = {
  necessary: true;
  optional: boolean;
  decidedAt: string;
};

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (typeof parsed.optional !== "boolean") return null;
    return { necessary: true, optional: parsed.optional, decidedAt: String(parsed.decidedAt ?? "") };
  } catch {
    return null;
  }
}

export function writeCookieConsent(optional: boolean): CookieConsent {
  const consent: CookieConsent = {
    necessary: true,
    optional,
    decidedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
  return consent;
}

export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent(COOKIE_SETTINGS_EVENT));
}
