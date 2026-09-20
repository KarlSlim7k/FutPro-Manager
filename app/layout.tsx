import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { CookieBanner } from "@/components/privacy/cookie-banner";
import { GlobalSearchModal } from "@/components/search/global-search-modal";
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
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
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
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon.svg",
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        {children}
        <CookieBanner />
        <GlobalSearchModal />
      </body>
    </html>
  );
}
