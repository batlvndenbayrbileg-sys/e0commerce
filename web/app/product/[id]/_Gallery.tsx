"use client";
import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { ProductVisual } from "@/components/ProductVisual";
import type { Product } from "@/lib/types";

const clamp = (n: number) => Math.min(100, Math.max(0, n));

// Main product image with a cursor-tracking hover zoom (desktop). The zoom is a
// CSS transform on an inner wrapper, so the reduced-motion guardrail removes the
// easing while still allowing the magnify.
export function Gallery({ product, img }: { product: Product; img: string }) {
  const imgs = product.images?.length ? product.images : [img];
  const ref = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(imgs[0]);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  // Desktop uses hover; touch devices (no hover) tap to toggle zoom.
  const [canHover, setCanHover] = useState(true);
  useEffect(() => { setCanHover(window.matchMedia("(hover: hover)").matches); }, []);

  function pointFromEvent(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return { x: 50, y: 50 };
    const r = el.getBoundingClientRect();
    return { x: clamp(((e.clientX - r.left) / r.width) * 100), y: clamp(((e.clientY - r.top) / r.height) * 100) };
  }
  function onMove(e: React.MouseEvent) {
    if (!canHover) return;
    setPos(pointFromEvent(e));
  }
  function onClick(e: React.MouseEvent) {
    if (canHover) return;
    setPos(pointFromEvent(e));
    setZoom(z => !z);
  }

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-3">
      {imgs.length > 1 && (
        <div className="flex lg:flex-col gap-2.5 overflow-x-auto no-scrollbar">
          {imgs.map((src, i) => (
            <button key={i} onClick={() => { setCurrent(src); setZoom(false); }}
              aria-label={`${product.name} ${i + 1}`} aria-pressed={current === src}
              className={`w-16 h-16 lg:w-20 lg:h-20 shrink-0 rounded-xl overflow-hidden bg-graphite cursor-pointer ring-2 transition ${current === src ? "ring-accent" : "ring-transparent hover:ring-ink/30"}`}>
              <Photo src={src} alt={product.name}
                fallback={<div className="w-full h-full grid place-items-center card-dark"><ProductVisual product={product} size="sm"/></div>}
                imgClassName="w-full h-full object-cover"/>
            </button>
          ))}
        </div>
      )}

      <div
        ref={ref}
        onMouseEnter={() => canHover && setZoom(true)}
        onMouseLeave={() => canHover && setZoom(false)}
        onMouseMove={onMove}
        onClick={onClick}
        className="flex-1 rounded-[1.5rem] aspect-[4/5] sm:aspect-square overflow-hidden bg-graphite relative cursor-zoom-in"
      >
        <div
          className="absolute inset-0"
          style={{
            transform: zoom ? "scale(1.9)" : "scale(1)",
            transformOrigin: `${pos.x}% ${pos.y}%`,
            transition: "transform 0.25s ease-out",
          }}
        >
          <Photo src={current} alt={product.name}
            fallback={<div className="absolute inset-0 grid place-items-center card-dark"><ProductVisual product={product} size="lg"/></div>}
            imgClassName="absolute inset-0 w-full h-full object-cover"/>
        </div>
        {product.badge && (
          <span className={`absolute top-4 left-4 z-10 text-[11px] uppercase tracking-[.14em] font-semibold px-3 h-7 rounded-pill grid place-items-center ${product.badge === "New" ? "bg-accent text-white" : "bg-white text-ink"}`}>{product.badge}</span>
        )}
      </div>
    </div>
  );
}
