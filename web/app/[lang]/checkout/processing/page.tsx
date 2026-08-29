"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart, useOrders } from "@/lib/store";
import { useT, useLang } from "@/components/LangProvider";
import { wire } from "@/lib/wire";

function Processing() {
  const t = useT();
  const lang = useLang();
  const router = useRouter();
  const params = useSearchParams();
  const pi = params.get("pi");
  const items = useCart(s => s.items);
  const clear = useCart(s => s.clear);
  const addOrder = useOrders(s => s.addOrder);
  const [error, setError] = useState<string | null>(null);
  const done = useRef(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    if (!pi) { setError(t("proc.missingRef")); return; }
    let tries = 0;
    const tick = async () => {
      if (done.current) return;
      try {
        const { status, order } = await wire.status(pi);
        if (status === "succeeded" && order) {
          done.current = true;
          addOrder({
            id: order.id,
            email: order.email,
            total: order.total,
            items: itemsRef.current.map(i => ({ name: i.name + (i.size ? ` · ${i.size}` : ""), qty: i.qty, price: i.price })),
            status: "processing",
            createdAt: new Date().toISOString(),
            estimatedDelivery: order.estimatedDelivery,
          });
          clear();
          router.replace(`/${lang}/checkout/success?id=${encodeURIComponent(order.id)}&total=${order.total}`);
          return;
        }
      } catch (e: any) {
        if (++tries > 3) { setError(e.message || t("proc.verifyFailed")); return; }
      }
      if (++tries > 40) { setError(t("proc.timeout")); return; }
      setTimeout(tick, 1500);
    };
    tick();
  }, [pi, addOrder, clear, router]);

  return (
    <div className="min-h-screen grid place-items-center p-6 mesh-light">
      <div className="bg-white rounded-3xl p-10 max-w-[460px] w-full border border-line shadow-lift text-center">
        <span className="font-display text-[22px] tracking-[.04em]">NARAN</span>
        {!error ? (
          <>
            <div className="my-8 mx-auto w-[72px] h-[72px] rounded-full border-4 border-surface-3 border-t-accent animate-spin"/>
            <h1 className="font-display text-[26px] uppercase tracking-tight">{t("proc.title")}</h1>
            <p className="text-muted mt-3">{t("proc.desc")}</p>
            <div className="mt-5 inline-flex items-center gap-2 text-[12px] text-muted bg-surface-2 px-3 py-1.5 rounded-pill">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"/> {t("proc.waiting")}
            </div>
          </>
        ) : (
          <>
            <div className="my-8 mx-auto w-[72px] h-[72px] rounded-full bg-surface-2 grid place-items-center text-2xl">!</div>
            <h1 className="font-display text-[24px] uppercase tracking-tight">{t("proc.pendingTitle")}</h1>
            <p className="text-muted mt-3">{error}</p>
            <button onClick={() => router.push(`/${lang}/cart`)} className="btn btn-primary mt-6">{t("proc.backToCart")}</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ProcessingPage() {
  return <Suspense fallback={null}><Processing /></Suspense>;
}
