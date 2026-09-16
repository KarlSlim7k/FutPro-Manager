// Central public contact configuration (provisional).
// WhatsApp is intentionally unconfigured: the dedicated business number
// is pending, so the UI renders WhatsApp entry points as "Próximamente".

export const CONTACT_EMAIL = "karoldelgado7k@gmail.com";

// Set to the dedicated WhatsApp number (digits only, with country code,
// e.g. "5212821234567") once available. `null` = coming soon.
export const WHATSAPP_NUMBER: string | null = null;

export function buildWhatsAppLink(message: string): string | null {
  if (!WHATSAPP_NUMBER) return null;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_DEFAULT_MESSAGE =
  "Hola FutPro Manager, quisiera información sobre la plataforma";
