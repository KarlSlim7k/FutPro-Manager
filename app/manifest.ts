import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FutPro Manager - Gestión de Ligas de Fútbol",
    short_name: "FutPro Manager",
    description: "Plataforma integral para administrar ligas, equipos, jugadores, partidos y estadísticas de fútbol amateur.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#022c22",
    theme_color: "#059669",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
