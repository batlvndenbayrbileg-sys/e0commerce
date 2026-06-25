import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ProductVisual } from "@/components/ProductVisual";
import { Photo } from "@/components/Photo";
import { api, money } from "@/lib/api";
import { productImg } from "@/lib/images";
import { AddToCart } from "./_AddToCart";
import { Tabs } from "./_Tabs";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { data: product, related } = await api.products.get(params.id);
  const img = product.image ?? productImg(product.id);

  return (
    <>
      <div className="px-3 pt-3 sm:px-4 sm:pt-4 lg:px-5 lg:pt-5 pb-2 mesh-light min-h-screen">
        <div className="max-w-[1280px] mx-auto">
          <Nav />

          <div className="text-[11px] font-mono tracking-wider text-subtle flex items-center gap-2 mt-6">
            <Link href="/" className="hover:text-ink">HOME</Link><span className="opacity-40">/</span>
            <Link href="/shop" className="hover:text-ink">SHOP</Link><span className="opacity-40">/</span>
            <span className="text-ink uppercase">{product.name}</span>
          </div>

          <section className="grid lg:grid-cols-2 gap-6 lg:gap-12 mt-5">
            {/* Gallery */}
            <div className="flex flex-col-reverse lg:flex-row gap-3">
              <div className="flex lg:flex-col gap-2.5 overflow-x-auto no-scrollbar">
                {[0,1,2,3].map(i => (
                  <div key={i} className={`w-16 h-16 lg:w-20 lg:h-20 shrink-0 rounded-xl overflow-hidden bg-graphite cursor-pointer ring-2 transition ${i===0?"ring-accent":"ring-transparent hover:ring-ink/30"}`}>
                    <Photo src={img} alt={product.name}
                      fallback={<div className="w-full h-full grid place-items-center card-dark"><ProductVisual product={product} size="sm"/></div>}
                      imgClassName="w-full h-full object-cover"/>
                  </div>
                ))}
              </div>
              <div className="flex-1 rounded-[1.5rem] aspect-[4/5] sm:aspect-square overflow-hidden bg-graphite relative">
                <Photo src={img} alt={product.name}
                  fallback={<div className="absolute inset-0 grid place-items-center card-dark"><ProductVisual product={product} size="lg"/></div>}
                  imgClassName="absolute inset-0 w-full h-full object-cover"/>
                {product.badge && (
                  <span className={`absolute top-4 left-4 text-[11px] uppercase tracking-[.14em] font-semibold px-3 h-7 rounded-pill grid place-items-center ${product.badge==="New"?"bg-accent text-white":"bg-white text-ink"}`}>{product.badge}</span>
                )}
              </div>
            </div>

            {/* Side */}
            <div className="bg-white border border-line rounded-[1.5rem] p-6 sm:p-8 shadow-soft h-fit">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-surface-2 text-[12px] font-medium uppercase tracking-wide">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: product.accent }}/> {product.category}
              </span>
              <h1 className="font-display text-[28px] sm:text-[40px] uppercase tracking-[-.02em] leading-[.95] mt-4">{product.name}</h1>
              <div className="flex items-center gap-2 text-[13px] text-muted mt-3">
                <span className="text-[#F4B400]">★★★★★</span>
                <span className="num-tabular">{product.rating}</span><span className="opacity-40">·</span>
                <span className="num-tabular">{product.reviews.toLocaleString()} reviews</span>
              </div>

              <div className="flex items-baseline gap-3 mt-5">
                <span className="font-display text-[30px] text-accent">{money(product.price)}</span>
                {product.was && <span className="text-subtle line-through num-tabular">{money(product.was)}</span>}
                {product.was && (
                  <span className="bg-accent-soft text-accent-deep px-2.5 py-1 rounded-pill text-xs font-semibold">
                    −{Math.round((1 - product.price / product.was) * 100)}%
                  </span>
                )}
              </div>

              <p className="text-[12px] uppercase tracking-[.16em] text-subtle font-medium mt-5 mb-2">{product.fabric}</p>
              <p className="text-muted text-[15px] leading-relaxed">{product.description}</p>

              <AddToCart product={product}/>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-line">
                <Trust label="Free shipping over $200"/>
                <Trust label="Free 30-day returns"/>
                <Trust label="1-year warranty"/>
              </div>
            </div>
          </section>

          <Tabs product={product}/>

          <section className="pt-8 pb-10">
            <h2 className="font-display text-[24px] sm:text-[32px] uppercase tracking-tight mb-5">You may also <span className="text-accent">like</span></h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i}/>)}
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
}

function Trust({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-[13px] text-muted">
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="m5 12 5 5L20 7"/>
      </svg>
      {label}
    </div>
  );
}
