import { LocaleLink as Link } from "@/components/LocaleLink";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight } from "@/components/Icons";
import { api } from "@/lib/api";
import { tFor, type Lang } from "@/lib/i18n";
import { SortSelect, ShopFilters } from "./_ShopControls";
import { Reveal } from "@/app/[lang]/_components/Reveal";

// Reads searchParams (filters) → dynamic; product data is still fetch-cached.
export const dynamic = "force-dynamic";

const cats = ["all", "Fragrance", "Skincare", "Makeup", "Body", "Gift"];

export default async function ShopPage({
  params,
  searchParams,
}: { params: { lang: Lang }; searchParams: { category?: string; sort?: string; q?: string; gender?: string; filter?: string; color?: string; tech?: string; minPrice?: string; maxPrice?: string } }) {
  const t = tFor(params.lang);
  const [{ data: products, total }, allForColors] = await Promise.all([
    api.products.list({
      category: searchParams.category,
      sort: searchParams.sort,
      q: searchParams.q,
      gender: searchParams.gender,
      filter: searchParams.filter,
      color: searchParams.color,
      tech: searchParams.tech,
      minPrice: searchParams.minPrice,
      maxPrice: searchParams.maxPrice,
    }),
    api.products.list({}),
  ]);
  // Real swatches: unique product accents, so every colour chip yields results.
  const availableColors = Array.from(new Set(allForColors.data.map(p => p.accent)));

  return (
    <>
      <div className="px-3 pt-3 sm:px-4 sm:pt-4 lg:px-5 lg:pt-5 pb-2 mesh-light min-h-screen">
        <div className="max-w-[1280px] mx-auto">
          <Nav />

          {/* Title */}
          <header className="mt-6 sm:mt-8">
            <Reveal>
              <div className="text-[11px] font-mono tracking-wider text-subtle flex items-center gap-2">
                <Link href="/" className="hover:text-ink uppercase">{t("bc.home")}</Link><span className="opacity-40">/</span>
                <span className="text-ink uppercase">{t("bc.shop")}</span><span className="opacity-40 mx-1">·</span><span>{total} {t("shop.items")}</span>
              </div>
              <h1 className="font-display text-[34px] sm:text-[52px] tracking-tight leading-[.95] uppercase mt-3">
                {t("shop.titlePre")} <span className="text-accent">{t("shop.titleAccent")}</span>
              </h1>
            </Reveal>
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
                      {t(`cat.${c}`)}
                    </Link>
                  );
                })}
              </div>
              <div className="shrink-0">
                <SortSelect/>
              </div>
            </div>
          </div>

          {/* Collapsible filters */}
          <ShopFilters colors={availableColors}/>

          {/* Grid */}
          {products.length === 0 ? (
            <div className="mt-10 bg-white border border-line rounded-2xl p-12 text-center">
              <h3 className="font-display text-[22px]">{t("shop.emptyTitle")}</h3>
              <p className="text-muted mt-2 text-sm">{t("shop.emptyDesc")}</p>
              <Link href="/shop" className="btn btn-primary mt-5 inline-flex">{t("shop.reset")} <ArrowRight width={14} height={14}/></Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
                {products.map((p, i) => <ProductCard key={p.id} product={p} index={i}/>)}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
