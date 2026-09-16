import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { CookieBanner } from "@/components/privacy/cookie-banner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "FutPro Manager",
    template: "%s | FutPro Manager",
  },
  description:
    "Plataforma para administrar ligas, equipos, jugadores y partidos de fútbol amateur.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FutPro Manager",
  },
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
    <html lang="es" className={inter.variable}>
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>{children}<CookieBanner /></body>
    </html>
  );
}
