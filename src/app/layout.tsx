import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Aeon IA",
    title: "Aeon IA — Inteligencia Soberana",
    description:
      "Plataforma de inteligencia artificial con soberanía total sobre tus datos.",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f5f7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ background: "#f5f5f7", color: "#48484a" }}>
        {children}
      </body>
    </html>
  );
}
