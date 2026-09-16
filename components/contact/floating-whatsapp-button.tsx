import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/site";

// Only renders once a dedicated WhatsApp number is configured.
export function FloatingWhatsAppButton() {
  const href = buildWhatsAppLink(WHATSAPP_DEFAULT_MESSAGE);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-900/20 transition hover:bg-emerald-600 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="h-5 w-5" aria-hidden />
      <span className="hidden sm:inline text-xs font-medium">¿Dudas? Chatea con nosotros</span>
    </a>
  );
}
