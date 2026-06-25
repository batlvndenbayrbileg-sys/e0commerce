import type { Metadata } from "next";
import "./globals.css";
import { Toast } from "@/components/Toast";
import { MobileTabBar } from "@/components/MobileTabBar";
import { CartDrawer } from "@/components/CartDrawer";
import { FlyLayer } from "@/components/FlyLayer";
import { LangProvider } from "@/components/LangProvider";
import { getServerLang } from "@/lib/lang";

export const metadata: Metadata = {
  title: "VEXO — Gear Up Every Season.",
  description: "Performance-driven workout wear engineered for every season — built for summer heat and winter cold.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = getServerLang();
  return (
    <html lang={lang}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=Archivo+Black&family=Rubik:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans pb-24 lg:pb-0">
        <LangProvider lang={lang}>
          {children}
          <Toast />
          <CartDrawer />
          <FlyLayer />
          <MobileTabBar />
        </LangProvider>
      </body>
    </html>
  );
}
