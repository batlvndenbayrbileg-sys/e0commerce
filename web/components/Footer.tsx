"use client";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useT } from "./LangProvider";
import { ArrowUpRight } from "./Icons";

// Minimal inline brand icons (no extra deps).
const IgIcon = (p: any) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const FbIcon = (p: any) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...p}>
    <path d="M13.5 21v-7h2.3l.4-2.8h-2.7V9.4c0-.8.24-1.35 1.4-1.35H16.3V5.5c-.26-.03-1.15-.11-2.18-.11-2.16 0-3.62 1.3-3.62 3.7v2.1H8.2V14h2.3v7h3z" />
  </svg>
);
const MailIcon = (p: any) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" />
  </svg>
);
const PhoneIcon = (p: any) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
    <path d="M6.5 3.5 9 4l1 3.5-2 1.5a12 12 0 0 0 5 5l1.5-2 3.5 1 .5 2.5a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z" />
  </svg>
);

export function Footer() {
  const t = useT();
  return (
    <footer className="relative mx-3 sm:mx-4 lg:mx-5 mb-3 sm:mb-4 lg:mb-5 rounded-[1.75rem] sm:rounded-[2.5rem] bg-ink text-white pt-12 sm:pt-20 pb-8 sm:pb-10 overflow-hidden grainy">
      {/* Subtle warm accent, kept tight in the corner so it reads as a kiss of
          brand colour, not a haze over the content. */}
      <div className="pointer-events-none absolute -top-28 -right-20 w-[240px] h-[240px] rounded-full bg-accent/10 blur-[90px]" />

      <div className="container relative">
        {/* Statement */}
        <div className="border-b border-white/10 pb-10 sm:pb-12 mb-10 sm:mb-12">
          <div className="grid lg:grid-cols-[1.6fr_1fr] gap-8 lg:gap-10 lg:items-end">
            <div>
              <span className="eyebrow text-accent/90">{t("foot.eyebrow")}</span>
              <h2 className="h-mega gradient-text-light mt-4 sm:mt-6">NARAN</h2>
            </div>
            <p className="text-white/60 text-[15px] sm:text-[17px] leading-relaxed max-w-[380px]">
              {t("foot.tagline")}
            </p>
          </div>
        </div>

        {/* Links + contact */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-9 sm:gap-8 pb-10 sm:pb-12 border-b border-white/10">
          <div className="col-span-2">
            <h5 className="text-[11px] uppercase tracking-[.2em] text-white/50 font-semibold mb-4">{t("foot.contact")}</h5>
            <p className="text-sm text-white/70 leading-relaxed">
              Сүхбаатарын талбай<br/>Улаанбаатар хот, Монгол Улс
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a href="tel:+97677000329" className="inline-flex items-center gap-2 text-sm text-white/75 hover:text-accent transition-colors">
                <PhoneIcon className="text-accent" /> {t("foot.phone")}
              </a>
              <a href="mailto:support@naran.mn" className="inline-flex items-center gap-2 text-sm text-white/75 hover:text-accent transition-colors">
                <MailIcon className="text-accent" /> support@naran.mn
              </a>
            </div>
            {/* Social */}
            <div className="mt-5">
              <span className="block text-[11px] uppercase tracking-[.2em] text-white/40 mb-2.5">{t("foot.follow")}</span>
              <div className="flex items-center gap-2.5">
                <SocialBtn href="https://instagram.com" label="Instagram"><IgIcon /></SocialBtn>
                <SocialBtn href="https://facebook.com" label="Facebook"><FbIcon /></SocialBtn>
              </div>
            </div>
          </div>
          <FootCol title={t("foot.shop")} links={[["/shop?category=Fragrance",t("cat.Fragrance")],["/shop?category=Skincare",t("cat.Skincare")],["/shop?category=Makeup",t("cat.Makeup")],["/shop?category=Gift",t("cat.Gift")]]}/>
          <FootCol title={t("foot.support")} links={[["/refund-policy",t("foot.refund")],["/terms",t("foot.terms")],["/privacy",t("foot.privacy")],["/product/edp-bloom",t("foot.faq")]]}/>
          <FootCol title={t("foot.brand")} links={[["/shop",t("foot.about")],["/shop",t("foot.stores")],["/shop",t("foot.journal")]]}/>
        </div>

        {/* Payment / trust */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 py-6 border-b border-white/10">
          <span className="text-[11px] uppercase tracking-[.2em] text-white/40 mr-1">{t("foot.payments")}</span>
          {["QPay", "Хаан банк", "TDB", "Голомт", "Most Money"].map((m) => (
            <span key={m} className="rounded-full border border-white/12 bg-white/[.04] px-3 py-1 text-[12px] text-white/70">{m}</span>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pt-7 text-[13px] text-white/45">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>{t("foot.rights")}</span>
            <Link href="/privacy" className="hover:text-white transition-colors">{t("foot.privacy")}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">{t("foot.terms")}</Link>
            <Link href="/refund-policy" className="hover:text-white transition-colors">{t("foot.refund")}</Link>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4">
            <span className="text-[12px] uppercase tracking-[.18em] text-white/50">{t("foot.slogan")}</span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label={t("foot.backToTop")}
              className="grid place-items-center w-9 h-9 rounded-full border border-white/15 text-white/70 hover:text-accent hover:border-accent/50 transition-colors shrink-0"
            >
              <ArrowUpRight width={15} height={15} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialBtn({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
      className="grid place-items-center w-9 h-9 rounded-full border border-white/12 bg-white/[.04] text-white/75 hover:text-ink hover:bg-accent hover:border-accent transition-colors"
    >
      {children}
    </a>
  );
}

function FootCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h5 className="text-[11px] uppercase tracking-[.2em] text-white/50 font-semibold mb-4">{title}</h5>
      {links.map(([h, l]) => (
        <Link key={l} href={h} className="block py-1.5 text-sm text-white/70 hover:text-accent transition-colors">{l}</Link>
      ))}
    </div>
  );
}
