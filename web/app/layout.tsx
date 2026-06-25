import type { Metadata } from "next";
import "./globals.css";
import { Toast } from "@/components/Toast";
import { MobileTabBar } from "@/components/MobileTabBar";

export const metadata: Metadata = {
  title: "VEXO — Gear Up Every Season.",
  description: "Performance-driven workout wear engineered for every season — built for summer heat and winter cold.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=Archivo+Black&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans pb-24 lg:pb-0">
        {children}
        <Toast />
        <MobileTabBar />
      </body>
    </html>
  );
}
