"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { buildWhatsAppShareUrl, buildTwitterShareUrl } from "@/lib/social/share-formatter";

interface SocialShareButtonsProps {
  shareText: string;
  shareUrl?: string;
  title?: string;
  variant?: "compact" | "full";
  className?: string;
}

export function SocialShareButtons({
  shareText,
  shareUrl,
  title = "Compartir",
  variant = "compact",
  className = "",
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getResolvedUrl = () => {
    if (shareUrl) return shareUrl;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  };

  const handleNativeShare = async () => {
    const url = getResolvedUrl();
    if (navigator?.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url,
        });
        return;
      } catch {
        // User cancelled or share failed, fallback gracefully
      }
    }
    handleCopyLink();
  };

  const handleCopyLink = async () => {
    const url = getResolvedUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard write error fallback
    }
  };

  const handleWhatsApp = () => {
    const url = getResolvedUrl();
    const fullText = shareText.includes(url) ? shareText : `${shareText}\n${url}`.trim();
    window.open(buildWhatsAppShareUrl(fullText), "_blank", "noopener,noreferrer");
  };

  const handleTwitter = () => {
    const url = getResolvedUrl();
    window.open(buildTwitterShareUrl(shareText, url), "_blank", "noopener,noreferrer");
  };

  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <button
          type="button"
          onClick={handleWhatsApp}
          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white px-2.5 py-1.5 text-xs font-semibold shadow-sm transition active:scale-95"
          title="Compartir por WhatsApp"
        >
          <span className="text-[13px]">💬</span>
          <span>WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={handleTwitter}
          className="inline-flex items-center gap-1 rounded-lg bg-black/60 hover:bg-black/80 text-white border border-white/10 px-2.5 py-1.5 text-xs font-semibold shadow-sm transition active:scale-95"
          title="Compartir en X / Twitter"
        >
          <span className="font-bold">𝕏</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 px-2.5 py-1.5 text-xs font-medium transition active:scale-95"
          title="Copiar enlace"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">¡Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleWhatsApp}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-sm font-semibold shadow-md transition active:scale-95"
      >
        <span className="text-base">💬</span>
        <span>Compartir en WhatsApp</span>
      </button>

      <button
        type="button"
        onClick={handleTwitter}
        className="inline-flex items-center gap-2 rounded-xl bg-black hover:bg-gray-900 text-white border border-white/20 px-4 py-2 text-sm font-semibold shadow-md transition active:scale-95"
      >
        <span className="font-bold text-sm">𝕏</span>
        <span>Postear en X</span>
      </button>

      {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
        <button
          type="button"
          onClick={handleNativeShare}
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 text-sm font-medium transition active:scale-95"
        >
          <Share2 className="h-4 w-4" />
          <span>Compartir</span>
        </button>
      )}

      <button
        type="button"
        onClick={handleCopyLink}
        className="inline-flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-3.5 py-2 text-sm font-medium transition active:scale-95"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-emerald-400" />
            <span className="text-emerald-400">¡Enlace copiado!</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            <span>Copiar link</span>
          </>
        )}
      </button>
    </div>
  );
}
