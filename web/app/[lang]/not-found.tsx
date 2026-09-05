"use client";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useT } from "@/components/LangProvider";

// Rendered whenever notFound() is called inside the [lang] segment (e.g. an
// unknown product slug). Branded, bilingual, and offers a way back — a proper
// 404, not the generic 500 error boundary.
export default function NotFound() {
  const t = useT();
  return (
    <div className="min-h-screen grid place-items-center px-6 py-16 mesh-light text-center">
      <div>
        <span className="font-display text-[22px] tracking-[.06em] text-accent">NARAN</span>
        <p className="mt-8 font-display text-[80px] leading-none tracking-tight text-ink/90">404</p>
        <h1 className="mt-4 font-display text-[24px] tracking-tight">{t("nf.title")}</h1>
        <p className="mt-2 text-[14px] text-muted max-w-[380px] mx-auto">{t("nf.desc")}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn btn-primary">{t("nf.home")}</Link>
          <Link href="/shop" className="btn btn-ghost">{t("nf.shop")}</Link>
        </div>
      </div>
    </div>
  );
}
