"use client";
import Link from "next/link";
import { useEffect } from "react";

// Branded error boundary — replaces the raw "Application error" white screen if a
// page throws (e.g. a transient backend hiccup during SSR). Dependency-free on
// purpose so it can never itself fail.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { /* could log to a service */ }, [error]);
  return (
    <div className="min-h-screen grid place-items-center p-6 mesh-light text-center">
      <div className="max-w-[440px]">
        <div className="font-display text-[22px] tracking-[.04em]">NARAN</div>
        <h1 className="hd-2 !text-[26px] mt-6">Уучлаарай / Something went wrong</h1>
        <p className="text-muted mt-3">Түр зуурын алдаа гарлаа. Дахин оролдоно уу.<br/>A temporary error occurred — please try again.</p>
        <div className="flex flex-wrap gap-2.5 justify-center mt-6">
          <button onClick={reset} className="btn btn-primary">Дахин оролдох</button>
          <Link href="/" className="btn btn-ghost">Нүүр</Link>
        </div>
      </div>
    </div>
  );
}
