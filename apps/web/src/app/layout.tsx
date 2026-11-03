import type { Metadata } from "next";
import { Anton, Archivo } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

// next/font descarga las fuentes en el build y las sirve desde nuestro dominio.
const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" });
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: { default: "AoE2 Overlay", template: "%s · AoE2 Overlay" },
  description:
    "Overlay open source de estrategias de apertura para Age of Empires II: DE. Gratis, encima del juego y sin tocar su memoria.",
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${anton.variable} ${archivo.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
