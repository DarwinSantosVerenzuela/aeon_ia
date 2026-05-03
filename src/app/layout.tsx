import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Aeon IA — Inteligencia Soberana",
    template: "%s | Aeon IA",
  },
  description:
    "Plataforma de inteligencia artificial con soberanía total sobre tus datos. Sin nubes públicas. Sin compromisos.",
  keywords: ["AI", "inteligencia artificial", "soberana", "privacidad", "chat"],
  authors: [{ name: "Aeon IA" }],
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aeon IA",
    startupImage: [
      {
        url: "/icons/icon-512x512.png",
      },
    ],
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Aeon IA",
    title: "Aeon IA — Inteligencia Soberana",
    description:
      "Plataforma de inteligencia artificial con soberanía total sobre tus datos.",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#3d3d3d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* PWA — Apple specific */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Aeon IA" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        {/* MS Tiles */}
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <meta name="msapplication-TileColor" content="#3d3d3d" />
      </head>
      <body className="min-h-full flex flex-col" style={{ background: "#f5f5f7", color: "#48484a" }} suppressHydrationWarning>
        {children}
        {/* Service Worker registration */}
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js', { scope: '/' })
              .then(function() {})
              .catch(function() {});
          }
        `}</Script>
      </body>
    </html>
  );
}
