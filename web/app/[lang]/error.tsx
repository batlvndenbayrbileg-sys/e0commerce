"use client";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useEffect } from "react";

// Branded error boundary — replaces the raw "Application error" white screen if a
// page throws (e.g. a transient backend hiccup during SSR). Kept dependency-free
// on purpose (CSS-only motion, no framer / i18n context) so it can never itself
// fail, and shown bilingually since the language context may not be reachable.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { /* could log to a service */ }, [error]);
  return (
    <div className="relative min-h-screen grid place-items-center p-6 mesh-light text-center overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] max-w-[90vw] rounded-full bg-accent/10 blur-3xl" />
      <div className="relative max-w-[440px] animate-rise">
        <div className="font-display uppercase text-[20px] tracking-[.14em] text-accent">NARAN</div>
        <span className="mx-auto my-7 grid h-16 w-16 place-items-center rounded-full bg-surface-2 text-ink/50">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>
          </svg>
        </span>
        <h1 className="hd-2 !text-[26px]">Уучлаарай</h1>
        <p className="text-muted mt-3 text-[14px] leading-relaxed">
          Түр зуурын алдаа гарлаа. Дахин оролдоно уу.<br/>
          <span className="text-subtle">A temporary error occurred — please try again.</span>
        </p>
        <div className="flex flex-wrap gap-2.5 justify-center mt-7">
          <button onClick={reset} className="btn btn-primary">Дахин оролдох</button>
          <Link href="/" className="btn btn-ghost">Нүүр</Link>
        </div>
      </div>
    </div>
  );
}
