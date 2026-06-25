"use client";
import { useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { ProductVisual } from "@/components/ProductVisual";
import type { Product } from "@/lib/types";

// Main product image with a cursor-tracking hover zoom (desktop). The zoom is a
// CSS transform on an inner wrapper, so the reduced-motion guardrail removes the
// easing while still allowing the magnify.
export function Gallery({ product, img }: { product: Product; img: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      x: Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)),
      y: Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)),
    });
  }

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-3">
      <div className="flex lg:flex-col gap-2.5 overflow-x-auto no-scrollbar">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`w-16 h-16 lg:w-20 lg:h-20 shrink-0 rounded-xl overflow-hidden bg-graphite cursor-pointer ring-2 transition ${i === 0 ? "ring-accent" : "ring-transparent hover:ring-ink/30"}`}>
            <Photo src={img} alt={product.name}
              fallback={<div className="w-full h-full grid place-items-center card-dark"><ProductVisual product={product} size="sm"/></div>}
              imgClassName="w-full h-full object-cover"/>
          </div>
        ))}
      </div>

      <div
        ref={ref}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
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
          <Photo src={img} alt={product.name}
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
