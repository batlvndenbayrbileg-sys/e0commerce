"use client";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckIcon } from "@/components/Icons";

function Success() {
  const params = useSearchParams();
  const id = params.get("id");
  const total = params.get("total");
  const eta = new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10);

  return (
    <div
      className="min-h-screen grid place-items-center p-6"
      style={{
        background: `radial-gradient(1000px 500px at 20% -100px, #EAF1FF 0%, transparent 60%),
                     radial-gradient(700px 400px at 110% 110%, #F2F7E5 0%, transparent 60%), #F3F4EE`,
      }}
    >
      <div className="bg-white rounded-3xl p-10 max-w-[560px] w-full border border-border shadow-lift text-center">
        <Link href="/" className="flex items-center justify-center font-display text-[22px] tracking-[.04em]">
          VEXO
        </Link>

        <div className="my-8 mx-auto w-[88px] h-[88px] rounded-full bg-ink grid place-items-center animate-pop">
          <CheckIcon width={42} height={42} className="text-white"/>
        </div>

        <h1 className="font-display text-[28px] sm:text-[34px] uppercase tracking-tight leading-none mt-6 mb-3">Order placed</h1>
        <p className="text-muted text-[15px] leading-relaxed">A confirmation has been sent to your email. Your gear is being packed — tracking arrives within 24 hours.</p>

        <div className="bg-surface-2 rounded-xl p-5 my-7 text-left">
          <div className="flex justify-between mb-1.5"><span className="tiny">Order number</span><span className="font-mono font-semibold">{id ?? "—"}</span></div>
          <div className="flex justify-between mb-1.5"><span className="tiny">Estimated delivery</span><span className="font-medium">{eta}</span></div>
          <div className="flex justify-between"><span className="tiny">Total</span><span className="font-medium">{total ? `₮${Number(total).toLocaleString()}` : "—"}</span></div>
        </div>

        <div className="flex justify-center gap-2.5">
          <Link href="/account" className="btn btn-primary">View orders</Link>
          <Link href="/" className="btn btn-ghost">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return <Suspense fallback={null}><Success /></Suspense>;
}
