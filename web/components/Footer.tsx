"use client";
import Link from "next/link";
import { useT } from "./LangProvider";

export function Footer() {
  const t = useT();
  return (
    <footer className="hidden md:block relative mx-3 sm:mx-4 lg:mx-5 mb-3 sm:mb-4 lg:mb-5 rounded-[2.5rem] bg-ink text-white pt-20 pb-10 overflow-hidden grainy">
      <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-white/10 blur-3xl"/>
      <div className="container relative">
        {/* Massive logotype */}
        <div className="border-b border-white/10 pb-12 mb-12">
          <div className="grid lg:grid-cols-[1.6fr_1fr] gap-10 items-end">
            <div>
              <span className="eyebrow text-white/40">Performance · Worldwide</span>
              <h2 className="h-mega gradient-text-light mt-6">NARAN</h2>
            </div>
            <p className="text-white/55 text-[17px] leading-relaxed max-w-[380px]">
              {t("foot.tagline")}
            </p>
          </div>
        </div>

        {/* Link grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-white/10">
          <div className="col-span-2">
            <h5 className="text-[12px] uppercase tracking-[.2em] text-white/55 font-semibold mb-5">{t("foot.flagship")}</h5>
            <p className="text-sm text-white/80 leading-relaxed">
              Сүхбаатарын талбай<br/>
              Улаанбаатар хот<br/>
              Монгол Улс
            </p>
            <p className="text-sm text-white/55 mt-4">support@naran.mn</p>
          </div>
          <FootCol title={t("foot.shop")} links={[["/shop?category=Fragrance",t("cat.Fragrance")],["/shop?category=Skincare",t("cat.Skincare")],["/shop?category=Makeup",t("cat.Makeup")],["/shop?category=Gift",t("cat.Gift")]]}/>
          <FootCol title={t("foot.support")} links={[["#","Contact"],["#","Shipping"],["#","Returns"],["/product/edp-bloom","FAQ"]]}/>
          <FootCol title={t("foot.brand")} links={[["#","About"],["#","Brands"],["#","Stores"],["#","Journal"]]}/>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8 text-[13px] text-white/45">
          <div className="flex items-center gap-6">
            <span>{t("foot.rights")}</span>
            <Link href="#" className="hover:text-white">Privacy</Link>
            <Link href="#" className="hover:text-white">Terms</Link>
            <Link href="#" className="hover:text-white">Accessibility</Link>
          </div>
          <span className="text-[13px] uppercase tracking-[.18em] text-white/55">{t("foot.slogan")}</span>
        </div>
      </div>
    </footer>
  );
}

function FootCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h5 className="text-[12px] uppercase tracking-[.2em] text-white/55 font-semibold mb-5">{title}</h5>
      {links.map(([h, l]) => (
        <Link key={l} href={h} className="block py-1.5 text-sm text-white/80 hover:text-white transition-colors">{l}</Link>
      ))}
    </div>
  );
}
