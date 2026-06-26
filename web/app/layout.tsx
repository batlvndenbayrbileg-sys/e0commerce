import type { Metadata } from "next";
import { Archivo, Archivo_Black, Rubik, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toast } from "@/components/Toast";
import { MobileTabBar } from "@/components/MobileTabBar";
import { CartDrawer } from "@/components/CartDrawer";
import { QuickViewModal } from "@/components/QuickViewModal";
import { FlyLayer } from "@/components/FlyLayer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { LangProvider } from "@/components/LangProvider";
import { getServerLang, getServerT } from "@/lib/lang";

export const metadata: Metadata = {
  title: "VEXO — Gear Up Every Season.",
  description: "Performance-driven workout wear engineered for every season — built for summer heat and winter cold.",
};

// Self-hosted via next/font: no render-blocking external CSS, no FOUT (swap + fallback).
const archivo = Archivo({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--font-archivo", display: "swap" });
const archivoBlack = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-archivo-black", display: "swap" });
const rubik = Rubik({ subsets: ["latin", "cyrillic"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--font-rubik", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains", display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = getServerLang();
  const t = getServerT();
  return (
    <html lang={lang} className={`${archivo.variable} ${archivoBlack.variable} ${rubik.variable} ${mono.variable}`}>
      <body className="font-sans pb-24 lg:pb-0">
        <a href="#main" className="skip-link">{t("a11y.skip")}</a>
        <LangProvider lang={lang}>
          <SmoothScroll />
          <main id="main">{children}</main>
          <Toast />
          <CartDrawer />
          <QuickViewModal />
          <FlyLayer />
          <MobileTabBar />
        </LangProvider>
      </body>
    </html>
  );
}
