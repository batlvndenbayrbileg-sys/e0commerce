"use client";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useT } from "./LangProvider";

// Inline icons (no extra deps).
const SunMark = (p: any) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}>
    <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
const IgIcon = (p: any) => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const FbIcon = (p: any) => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" {...p}>
    <path d="M13.5 21v-7h2.3l.4-2.8h-2.7V9.4c0-.8.24-1.35 1.4-1.35H16.3V5.5c-.26-.03-1.15-.11-2.18-.11-2.16 0-3.62 1.3-3.62 3.7v2.1H8.2V14h2.3v7h3z" />
  </svg>
);
const MailIcon = (p: any) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" />
  </svg>
);
const PhoneIcon = (p: any) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
    <path d="M6.5 3.5 9 4l1 3.5-2 1.5a12 12 0 0 0 5 5l1.5-2 3.5 1 .5 2.5a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z" />
  </svg>
);

export function Footer() {
  const t = useT();
  return (
    <footer className="relative z-10 w-full overflow-hidden px-3 sm:px-4 lg:px-5 pt-12 pb-5 sm:pb-6">
      {/* Soft warm glow */}
      <div className="pointer-events-none absolute inset-0 select-none">
        <div className="absolute -top-24 left-[12%] h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-28 right-[14%] h-80 w-80 rounded-full bg-camel/20 blur-3xl" />
      </div>

      <div className="footer-glass relative mx-auto max-w-[1200px] rounded-[1.75rem] sm:rounded-[2.25rem] px-6 sm:px-10 py-10 sm:py-12">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between md:gap-12">
          {/* Brand */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left md:max-w-xs">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-deep text-white shadow-[0_8px_20px_-6px_rgba(255,106,26,.6)]">
                <SunMark />
              </span>
              <span className="font-display text-2xl font-black tracking-tight foot-gradient-text">NARAN</span>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted">{t("foot.tagline")}</p>

            {/* Contact */}
            <div className="mt-5 flex flex-col items-center gap-2 md:items-start">
              <a href="tel:+97677000329" className="inline-flex items-center gap-2 text-sm text-ink/70 hover:text-accent transition-colors">
                <PhoneIcon className="text-accent" /> {t("foot.phone")}
              </a>
              <a href="mailto:support@naran.mn" className="inline-flex items-center gap-2 text-sm text-ink/70 hover:text-accent transition-colors">
                <MailIcon className="text-accent" /> support@naran.mn
              </a>
            </div>

            {/* Social */}
            <div className="mt-6 flex gap-2.5">
              <Social href="https://instagram.com" label="Instagram"><IgIcon /></Social>
              <Social href="https://facebook.com" label="Facebook"><FbIcon /></Social>
            </div>
          </div>

          {/* Nav */}
          <nav className="grid w-full grid-cols-2 gap-8 text-center sm:grid-cols-3 md:w-auto md:text-left">
            <FootCol title={t("foot.shop")} links={[["/shop?category=Fragrance",t("cat.Fragrance")],["/shop?category=Skincare",t("cat.Skincare")],["/shop?category=Makeup",t("cat.Makeup")],["/shop?category=Gift",t("cat.Gift")]]}/>
            <FootCol title={t("foot.support")} links={[["/refund-policy",t("foot.refund")],["/terms",t("foot.terms")],["/privacy",t("foot.privacy")],["/product/edp-bloom",t("foot.faq")]]}/>
            <FootCol title={t("foot.brand")} links={[["/shop",t("foot.about")],["/shop",t("foot.stores")],["/shop",t("foot.journal")]]}/>
          </nav>
        </div>

        {/* Payment + bottom */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 border-t border-ink/10 pt-6 md:justify-start">
          <span className="mr-1 text-[11px] uppercase tracking-[.2em] text-muted">{t("foot.payments")}</span>
          {["QPay", "Хаан банк", "TDB", "Голомт", "Most Money"].map((m) => (
            <span key={m} className="rounded-full border border-ink/10 bg-white/60 px-3 py-1 text-[12px] text-ink/70">{m}</span>
          ))}
        </div>

        <div className="mt-6 flex flex-col-reverse items-center gap-3 text-[13px] text-muted sm:flex-row sm:justify-between">
          <span>{t("foot.rights")}</span>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            <Link href="/privacy" className="hover:text-accent transition-colors">{t("foot.privacy")}</Link>
            <Link href="/terms" className="hover:text-accent transition-colors">{t("foot.terms")}</Link>
            <Link href="/refund-policy" className="hover:text-accent transition-colors">{t("foot.refund")}</Link>
            <span className="hidden sm:inline text-ink/30">·</span>
            <span className="uppercase tracking-[.15em] text-[11px] text-accent/80">{t("foot.slogan")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Social({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 bg-white/70 text-ink/70 hover:text-white hover:bg-accent hover:border-accent transition-colors"
    >
      {children}
    </a>
  );
}

function FootCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h5 className="mb-4 text-[11px] font-semibold uppercase tracking-[.2em] text-accent">{title}</h5>
      <ul className="space-y-2.5">
        {links.map(([h, l]) => (
          <li key={l}>
            <Link href={h} className="text-sm text-ink/70 hover:text-accent transition-colors">{l}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
