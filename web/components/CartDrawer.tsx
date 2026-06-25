"use client";
import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart, useUI } from "@/lib/store";
import { useT } from "./LangProvider";
import { money } from "@/lib/api";
import { Photo } from "./Photo";
import { ProductVisual } from "./ProductVisual";
import { productImg } from "@/lib/images";
import { ArrowRight, TrashIcon } from "./Icons";

export function CartDrawer() {
  const open = useUI(s => s.cartOpen);
  const close = useUI(s => s.closeCart);
  const items = useCart(s => s.items);
  const setQty = useCart(s => s.setQty);
  const remove = useCart(s => s.remove);
  const t = useT();
  const subtotal = items.reduce((a, b) => a + b.price * b.qty, 0);

  // Esc closes the drawer; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            className="fixed inset-0 z-[80] bg-ink/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            className="fixed right-0 top-0 bottom-0 z-[81] w-[min(420px,92vw)] bg-white shadow-deep flex flex-col"
            role="dialog" aria-modal="true" aria-label={t("cart.title")}
          >
            <header className="flex items-center justify-between px-5 h-16 border-b border-line shrink-0">
              <h2 className="font-display text-[20px] tracking-tight">{t("cart.title")}</h2>
              <button onClick={close} aria-label={t("common.close")}
                className="w-9 h-9 rounded-full grid place-items-center hover:bg-surface-2 text-xl leading-none">×</button>
            </header>

            {items.length === 0 ? (
              <div className="flex-1 grid place-items-center text-center px-6">
                <div>
                  <h3 className="font-display text-[20px] mb-2">{t("cart.emptyTitle")}</h3>
                  <p className="text-muted text-sm mb-5">{t("cart.emptyDesc")}</p>
                  <Link href="/shop" onClick={close} className="btn btn-primary inline-flex">
                    {t("common.browseShop")} <span className="arrow-cap !bg-white !text-ink"><ArrowRight width={14} height={14}/></span>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-3 py-2">
                  {items.map(it => (
                    <div key={it.variantId || it.id} className="flex gap-3 items-center p-2.5 border-b border-line last:border-none">
                      <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-graphite">
                        <Photo src={it.image ?? productImg(it.id)} alt={it.name}
                          fallback={<div className="w-full h-full grid place-items-center card-dark"><ProductVisual product={{ shape: it.shape, accent: it.accent }} size="sm"/></div>}
                          imgClassName="w-full h-full object-cover"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[14px] truncate">{it.name}</div>
                        <div className="tiny">{it.category}{it.size ? ` · ${it.size}` : ""}</div>
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="inline-flex items-center bg-surface-2 rounded-pill p-0.5">
                            <button onClick={() => setQty(it.variantId || it.id, it.qty - 1)} className="w-7 h-7 rounded-full grid place-items-center hover:bg-white">−</button>
                            <span className="px-2.5 text-sm font-semibold num-tabular">{it.qty}</span>
                            <button onClick={() => setQty(it.variantId || it.id, it.qty + 1)} className="w-7 h-7 rounded-full grid place-items-center hover:bg-white">+</button>
                          </div>
                          <span className="font-display text-[15px] num-tabular">{money(it.price * it.qty)}</span>
                        </div>
                      </div>
                      <button onClick={() => remove(it.variantId || it.id)} aria-label={t("common.remove")}
                        className="w-8 h-8 rounded-full grid place-items-center text-muted hover:text-red-500 hover:bg-red-50 self-start transition"><TrashIcon width={15} height={15}/></button>
                    </div>
                  ))}
                </div>
                <footer className="border-t border-line p-4 shrink-0">
                  <div className="flex justify-between font-display text-[18px] mb-1">
                    <span>{t("cart.subtotal")}</span><span className="num-tabular">{money(subtotal)}</span>
                  </div>
                  <p className="tiny mb-3">{t("cart.freeNote")}</p>
                  <Link href="/checkout" onClick={close} className="btn btn-primary w-full justify-center">
                    {t("cart.checkout")} <span className="arrow-cap !bg-white !text-ink"><ArrowRight width={14} height={14}/></span>
                  </Link>
                  <Link href="/cart" onClick={close} className="btn btn-ghost w-full justify-center mt-2">{t("cart.viewBag")}</Link>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
