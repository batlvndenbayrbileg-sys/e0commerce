import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight } from "@/components/Icons";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

const cats = ["all", "Outerwear", "Tops", "Bottoms", "Base Layers", "Accessories"];

export default async function ShopPage({
  searchParams,
}: { searchParams: { category?: string; sort?: string; q?: string } }) {
  const { data: products, total } = await api.products.list({
    category: searchParams.category,
    sort: searchParams.sort,
    q: searchParams.q,
  });

  return (
    <>
      <div className="px-3 pt-3 sm:px-4 sm:pt-4 lg:px-5 lg:pt-5 pb-2 mesh-light min-h-screen">
        <div className="max-w-[1280px] mx-auto">
          <Nav />

          {/* Title */}
          <header className="mt-6 sm:mt-8">
            <div className="text-[11px] font-mono tracking-wider text-subtle flex items-center gap-2">
              <Link href="/" className="hover:text-ink">HOME</Link><span className="opacity-40">/</span>
              <span className="text-ink">SHOP</span><span className="opacity-40 mx-1">·</span><span>{total} items</span>
            </div>
            <h1 className="font-display text-[34px] sm:text-[52px] tracking-tight leading-[.95] uppercase mt-3">
              The <span className="text-accent">collection</span>
            </h1>
          </header>

          {/* Sticky toolbar: categories + sort */}
          <div className="sticky top-2 z-20 mt-5 -mx-3 px-3 sm:mx-0 sm:px-0">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur border border-line rounded-pill p-1.5 shadow-soft">
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-1">
                {cats.map(c => {
                  const active = (!searchParams.category && c === "all") || searchParams.category === c;
                  return (
                    <Link key={c} href={c === "all" ? "/shop" : `/shop?category=${encodeURIComponent(c)}`}
                      className={`h-9 px-4 rounded-pill text-[13px] font-medium inline-flex items-center whitespace-nowrap shrink-0 transition ${
                        active ? "bg-ink text-white" : "text-muted hover:text-ink"
                      }`}>
                      {c === "all" ? "All" : c}
                    </Link>
                  );
                })}
              </div>
              <form className="shrink-0">
                <select name="sort" defaultValue={searchParams.sort}
                  className="h-9 pl-3 pr-2 rounded-pill bg-surface-2 text-[13px] font-medium outline-none cursor-pointer border-none">
                  <option value="">Sort</option>
                  <option value="new">Newest</option>
                  <option value="price-asc">Price ↑</option>
                  <option value="price-desc">Price ↓</option>
                  <option value="rating">Top rated</option>
                </select>
              </form>
            </div>
          </div>

          {/* Collapsible filters */}
          <details className="mt-3 group">
            <summary className="list-none cursor-pointer inline-flex items-center gap-2 text-[13px] font-semibold text-ink bg-white border border-line rounded-pill px-4 h-10 shadow-soft">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
              Filters
              <svg className="transition-transform group-open:rotate-180" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
            </summary>
            <div className="mt-3 grid sm:grid-cols-3 gap-4 bg-white border border-line rounded-2xl p-5 shadow-soft">
              <FilterBlock title="Price">
                <div className="flex items-center gap-2 mt-1">
                  <input className="h-10 px-3 rounded-xl border border-line bg-surface-2 text-[13px] w-full" placeholder="Min" defaultValue="0"/>
                  <span className="text-subtle">—</span>
                  <input className="h-10 px-3 rounded-xl border border-line bg-surface-2 text-[13px] w-full" placeholder="Max" defaultValue="200"/>
                </div>
              </FilterBlock>
              <FilterBlock title="Colour">
                <div className="flex gap-2 flex-wrap mt-1">
                  {["#1A1A1A","#3A3B3F","#2A3142","#5A5246","#7A6E62","#EDEAE2"].map(c => (
                    <button key={c} className="w-7 h-7 rounded-full border-2 border-white hover:scale-110 transition"
                      style={{ background: c, boxShadow: "0 0 0 1px rgba(14,15,16,.1)" }}/>
                  ))}
                </div>
              </FilterBlock>
              <FilterBlock title="Tech">
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {["Stretch", "Thermal", "Wicking", "Water-repellent"].map(t => (
                    <span key={t} className="text-[12px] px-3 h-8 rounded-pill bg-surface-2 inline-flex items-center text-muted">{t}</span>
                  ))}
                </div>
              </FilterBlock>
            </div>
          </details>

          {/* Grid */}
          {products.length === 0 ? (
            <div className="mt-10 bg-white border border-line rounded-2xl p-12 text-center">
              <h3 className="font-display text-[22px]">Nothing here yet</h3>
              <p className="text-muted mt-2 text-sm">Try a different category.</p>
              <Link href="/shop" className="btn btn-primary mt-5 inline-flex">Reset <ArrowRight width={14} height={14}/></Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
                {products.map((p, i) => <ProductCard key={p.id} product={p} index={i}/>)}
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-10">
                <button className="w-10 h-10 rounded-full border border-line bg-white grid place-items-center text-muted">←</button>
                {["1","2","3"].map((l, i) => (
                  <button key={i} className={`min-w-[40px] h-10 px-3 rounded-full text-sm font-medium ${l === "1" ? "bg-ink text-white" : "bg-white border border-line text-ink"}`}>{l}</button>
                ))}
                <button className="w-10 h-10 rounded-full border border-line bg-white grid place-items-center text-ink">→</button>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[12px] font-semibold uppercase tracking-wide text-muted">{title}</div>
      {children}
    </div>
  );
}
