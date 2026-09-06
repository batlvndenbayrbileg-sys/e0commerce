import { Nav } from "@/components/Nav";
import { Skeleton } from "@/components/Skeleton";

// Fallback while a product page (ISR / on-demand) resolves. Mirrors the gallery +
// info two-column layout so the real page swaps in without a jump.
export default function ProductLoading() {
  return (
    <div className="px-3 pt-3 sm:px-4 sm:pt-4 lg:px-5 lg:pt-5 pb-2 mesh-light min-h-screen">
      <div className="max-w-[1280px] mx-auto">
        <Nav />

        <div className="mt-6"><Skeleton className="h-3 w-56" /></div>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mt-5">
          {/* gallery */}
          <div className="flex flex-col-reverse lg:flex-row gap-3">
            <div className="flex lg:flex-col gap-2.5">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="w-16 h-16 lg:w-20 lg:h-20 shrink-0 rounded-xl" />)}
            </div>
            <Skeleton className="flex-1 rounded-[1.5rem] aspect-[4/5] sm:aspect-square" />
          </div>

          {/* info */}
          <div className="pt-2 space-y-5">
            <Skeleton className="h-6 w-24 rounded-pill" />
            <Skeleton className="h-11 w-3/4" />
            <Skeleton className="h-7 w-32" />
            <div className="space-y-2.5 pt-2">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
              <Skeleton className="h-3.5 w-2/3" />
            </div>
            <div className="flex gap-2 pt-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-16 rounded-xl" />)}
            </div>
            <div className="flex gap-3 pt-4">
              <Skeleton className="h-[52px] flex-1 rounded-pill" />
              <Skeleton className="h-[52px] w-[52px] rounded-pill" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
