"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, useToast } from "@/lib/store";
import { useT } from "@/components/LangProvider";
import { ArrowUpRight, ArrowRight } from "@/components/Icons";
import type { Product } from "@/lib/types";

const COLOR_NAMES: Record<string, string> = {
  "#1A1A1A": "Black", "#3A3B3F": "Graphite", "#2A3142": "Navy", "#5A5246": "Khaki",
  "#7A6E62": "Taupe", "#EDEAE2": "Bone", "#C9B7A4": "Sand", "#4A4636": "Olive",
  "#5A5246FF": "Khaki",
};
const colorName = (hex: string) => COLOR_NAMES[hex.toUpperCase()] ?? COLOR_NAMES[hex] ?? "Colour";

export function AddToCart({ product }: { product: Product }) {
  const router = useRouter();
  const t = useT();
  const add = useCart(s => s.add);
  const showToast = useToast(s => s.show);
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(product.colors[0]);
  const sizable = product.sizes.length > 1;
  const [size, setSize] = useState(sizable ? "" : product.sizes[0]);

  const sizeStock = (s: string) => product.variants?.find(v => v.size === s)?.stock ?? 9999;
  const soldOut = (product.variants?.length ?? 0) > 0 && product.variants!.every(v => v.stock === 0);

  function handleAdd(then?: () => void) {
    if (soldOut) { showToast(t("common.soldOut")); return; }
    if (sizable && !size) { showToast(t("toast.selectSize")); return; }
    if (size && sizeStock(size) === 0) { showToast(t("toast.sizeSoldOut")); return; }
    const variantId = product.variants?.find(v => v.size === size)?.id ?? product.variants?.[0]?.id;
    add(product, qty, { size, variantId });
    showToast(`${product.name} ${t("toast.addedToBag")}`);
    then?.();
  }

  return (
    <div className="mt-2">
      <Group label={t("common.colour")} sub={colorName(color)}>
        <div className="flex gap-2.5">
          {product.colors.map(c => (
            <button key={c}
              onClick={() => setColor(c)}
              className="w-9 h-9 rounded-full border-[3px] border-white"
              style={{ background: c, boxShadow: color === c ? "0 0 0 2px #0A0A0B" : "0 0 0 1px rgba(10,10,11,.08)" }}
              aria-label={colorName(c)}
            />
          ))}
        </div>
      </Group>

      {sizable && (
        <Group label={t("common.size")} action={<button className="text-subtle font-normal underline hover:text-ink">{t("common.sizeGuide")}</button>}>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map(s => {
              const out = sizeStock(s) === 0;
              return (
                <button key={s} disabled={out} onClick={() => !out && setSize(s)}
                  className={`min-w-[52px] px-4 py-2.5 rounded-pill border text-sm transition ${
                    out ? "border-border bg-surface-2 text-subtle line-through cursor-not-allowed"
                    : size === s ? "bg-ink text-white border-ink" : "border-border bg-white hover:border-ink"
                  }`}>{s}</button>
              );
            })}
          </div>
        </Group>
      )}

      <Group label={t("common.quantity")}>
        <div className="inline-flex items-center bg-white rounded-pill border border-border p-1">
          <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-full grid place-items-center hover:bg-surface-2">−</button>
          <span className="px-3.5 font-semibold min-w-[36px] text-center">{qty}</span>
          <button onClick={() => setQty(q => q + 1)} className="w-9 h-9 rounded-full grid place-items-center hover:bg-surface-2">+</button>
        </div>
      </Group>

      {soldOut ? (
        <div className="mt-6">
          <button disabled className="btn btn-dark w-full justify-center opacity-50 cursor-not-allowed">{t("common.soldOut")}</button>
          <p className="tiny text-center mt-2">{t("pdp.outOfStock")}</p>
        </div>
      ) : (
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => handleAdd()}
            className="btn btn-dark flex-1 justify-center"
          >
            {t("common.addToBag")}
            <span className="arrow-cap"><ArrowRight width={14} height={14}/></span>
          </button>
          <button
            onClick={() => handleAdd(() => router.push("/checkout"))}
            className="btn flex-1 justify-center bg-white text-ink border border-ink/15 hover:border-ink hover:-translate-y-0.5 transition-all"
          >
            {t("common.buyNow")}
            <span className="arrow-cap !bg-ink !text-white"><ArrowUpRight width={14} height={14}/></span>
          </button>
        </div>
      )}
    </div>
  );
}

function Group({ label, sub, action, children }: { label: string; sub?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="my-5">
      <div className="flex justify-between items-center text-[13px] font-semibold mb-2.5">
        <span>{label}{sub && <span className="text-subtle font-normal ml-2">{sub}</span>}</span>
        {action}
      </div>
      {children}
    </div>
  );
}
