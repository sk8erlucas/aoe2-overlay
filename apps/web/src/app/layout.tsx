import type { Metadata } from "next";
import { Anton, Archivo } from "next/font/google";
import type { ReactNode } from "react";
import { SITE_URL } from "@/lib/config";
import "./globals.css";

// next/font descarga las fuentes en el build y las sirve desde nuestro dominio.
const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" });
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
});

const DESCRIPTION =
  "Overlay open source de estrategias de apertura para Age of Empires II: DE. Gratis, encima del juego y sin tocar su memoria.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "AoE2 Overlay", template: "%s · AoE2 Overlay" },
  description: DESCRIPTION,
  icons: { icon: "/logo.svg" },
  // La imagen sale de app/opengraph-image.tsx.
  openGraph: {
    type: "website",
    siteName: "AoE2 Overlay",
    locale: "es_AR",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${anton.variable} ${archivo.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
