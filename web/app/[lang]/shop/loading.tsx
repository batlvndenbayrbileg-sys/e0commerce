import { Nav } from "@/components/Nav";
import { Skeleton } from "@/components/Skeleton";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";

// Route-level fallback shown while the (force-dynamic) shop re-fetches — e.g. on
// every filter/sort/search change. Mirrors the page layout so nothing jumps.
export default function ShopLoading() {
  return (
    <div className="px-3 pt-3 sm:px-4 sm:pt-4 lg:px-5 lg:pt-5 pb-2 mesh-light min-h-screen">
      <div className="max-w-[1280px] mx-auto">
        <Nav />

        <div className="mt-6 mb-4 flex items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-44" />
          </div>
          <Skeleton className="h-10 w-32 rounded-pill" />
        </div>

        {/* category chips */}
        <div className="flex gap-2 mb-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9 w-24 rounded-pill shrink-0" />)}
        </div>

        <div className="mt-6">
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </div>
  );
}
