import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Archivo, Playfair_Display, Rubik, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import { Toast } from "@/components/Toast";
import { MobileTabBar } from "@/components/MobileTabBar";
import { CartDrawer } from "@/components/CartDrawer";
import { QuickViewModal } from "@/components/QuickViewModal";
import { FlyLayer } from "@/components/FlyLayer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { LangProvider } from "@/components/LangProvider";
import { Consent } from "@/components/Consent";
import { LOCALES, isLang, tFor } from "@/lib/i18n";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://naran.mn"),
  title: "NARAN — Гоо сайхан, нэг дороос",
  description: "Дээд зэрэглэлийн үнэртэй ус, арьс арчилгаа, гоо сайхны бараа — нэг дороос. QPay-ээр төлж, хурдан хүргүүлээрэй.",
  openGraph: {
    title: "NARAN — Гоо сайхан, нэг дороос",
    description: "Дээд зэрэглэлийн үнэртэй ус, арьс арчилгаа, гоо сайхны бараа — нэг дороос.",
    type: "website",
    siteName: "NARAN",
  },
};

// Pre-render both locales → static/ISR pages, no cookies() (fast LCP).
export function generateStaticParams() {
  return LOCALES.map(lang => ({ lang }));
}

// Self-hosted via next/font: no render-blocking external CSS, no FOUT (swap + fallback).
const archivo = Archivo({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--font-archivo", display: "swap" });
// Elegant high-contrast serif for display/headings — full Cyrillic (Mongolian) support.
const playfair = Playfair_Display({ subsets: ["latin", "cyrillic"], weight: ["500", "600", "700", "800", "900"], variable: "--font-playfair", display: "swap" });
const rubik = Rubik({ subsets: ["latin", "cyrillic"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--font-rubik", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains", display: "swap" });

export default function LangLayout({ children, params }: { children: React.ReactNode; params: { lang: string } }) {
  if (!isLang(params.lang)) notFound();
  const lang = params.lang;
  const t = tFor(lang);
  return (
    <html lang={lang} className={`${archivo.variable} ${playfair.variable} ${rubik.variable} ${mono.variable}`}>
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
          <Consent />
        </LangProvider>
      </body>
    </html>
  );
}
