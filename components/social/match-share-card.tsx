"use client";

import { useState } from "react";
import { Share2, Download, MessageCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MatchShareCardProps {
  leagueName: string;
  seasonName?: string;
  roundName?: string | null;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  matchStatus: string;
  matchDate: string;
  matchUrl?: string;
}

export function MatchShareCard({
  leagueName,
  seasonName,
  roundName,
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore,
  matchStatus,
  matchDate,
  matchUrl,
}: MatchShareCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const getShareText = () => {
    const statusText = matchStatus === "completed" ? "Resultado Final" : "Partido";
    const shareUrl = typeof window !== "undefined" ? matchUrl || window.location.href : "";
    return `⚽ *${leagueName}* (${statusText})\n\n🟢 *${homeTeamName}* ${homeScore} - ${awayScore} *${awayTeamName}* 🔴\n📅 ${matchDate}${roundName ? ` • ${roundName}` : ""}\n\n👉 Sigue el partido en vivo y consulta las incidencias:\n${shareUrl}`;
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleCopyLink = async () => {
    const url = typeof window !== "undefined" ? matchUrl || window.location.href : "";
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadImage = () => {
    setIsGenerating(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Fondo degradado profesional
      const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
      gradient.addColorStop(0, "#0b1320");
      gradient.addColorStop(0.5, "#064e3b");
      gradient.addColorStop(1, "#022c22");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 630);

      // Marco decorativo
      ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 30, 1140, 570);

      // 2. Encabezado de la Liga
      ctx.textAlign = "center";
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText(leagueName.toUpperCase(), 600, 90);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "20px sans-serif";
      const sub = [seasonName, roundName, matchDate].filter(Boolean).join(" • ");
      ctx.fillText(sub, 600, 125);

      // 3. Etiqueta de Estado
      ctx.fillStyle = matchStatus === "completed" ? "#10b981" : "#f59e0b";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText(
        matchStatus === "completed" ? "RESULTADO FINAL" : matchStatus.toUpperCase(),
        600,
        170
      );

      // 4. Equipo Local
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 48px sans-serif";
      ctx.fillText(homeTeamName, 430, 310);

      // 5. Marcador Central
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 96px sans-serif";
      ctx.fillText(`${homeScore}  -  ${awayScore}`, 600, 325);

      // 6. Equipo Visitante
      ctx.textAlign = "left";
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 48px sans-serif";
      ctx.fillText(awayTeamName, 770, 310);

      // 7. Pie de página
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "20px sans-serif";
      ctx.fillText("Generado con FutPro Manager", 600, 540);

      // Descargar imagen
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `resultado-${homeTeamName}-vs-${awayTeamName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error al generar imagen de partido:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleShareWhatsApp}
        className="flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-300"
      >
        <MessageCircle className="h-4 w-4 text-emerald-600" />
        <span>Enviar por WhatsApp</span>
      </Button>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleDownloadImage}
        disabled={isGenerating}
        className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gray-900 border-gray-300"
      >
        <Download className="h-4 w-4 text-gray-500" />
        <span>{isGenerating ? "Generando..." : "Descargar Imagen PNG"}</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={handleCopyLink}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
        <span>{copied ? "¡Enlace copiado!" : "Copiar link"}</span>
      </Button>
    </div>
  );
}
