import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "FutPro Manager",
    template: "%s | FutPro Manager",
  },
  description:
    "Plataforma SaaS para administrar ligas, equipos, jugadores y partidos de fútbol amateur.",
  openGraph: {
    siteName: "FutPro Manager",
    locale: "es_MX",
    type: "website",
    images: [{ url: "/og/futpro-manager.jpg", width: 640, height: 640 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/futpro-manager.jpg"],
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
