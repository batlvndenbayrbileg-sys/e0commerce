"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SearchIcon, BagIcon, UserIcon } from "./Icons";
import { useAuth, useCart } from "@/lib/store";
import { useT } from "./LangProvider";
import { LangToggle } from "./LangToggle";

function Bell({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>
    </svg>
  );
}
function Sliders({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>
    </svg>
  );
}

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const items = useCart(s => s.items);
  const user = useAuth(s => s.user);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? items.reduce((a, b) => a + b.qty, 0) : 0;
  const t = useT();

  const [q, setQ] = useState("");
  // Keep the field in sync with the active query when browsing the shop.
  useEffect(() => { setQ(searchParams.get("q") ?? ""); }, [searchParams]);
  function search(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
  }

  const Bag = (
    <Link href="/cart" className="relative w-11 h-11 rounded-full bg-white border border-line shadow-soft grid place-items-center text-ink hover:bg-mist transition" aria-label={t("nav.cart")}>
      <BagIcon width={18} height={18}/>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-bold grid place-items-center border-2 border-white num-tabular">{count}</span>
      )}
    </Link>
  );

  return (
    <>
      {/* ---------- Mobile bar ---------- */}
      <div className="lg:hidden flex items-center gap-2.5">
        <button className="w-11 h-11 rounded-full bg-white border border-line shadow-soft grid place-items-center text-ink" aria-label={t("nav.notifications")}>
          <Bell/>
        </button>
        <form onSubmit={search} className="flex-1 h-11 bg-white border border-line shadow-soft rounded-pill flex items-center gap-2.5 px-4">
          <button type="submit" className="text-subtle hover:text-ink shrink-0" aria-label={t("nav.search")}><SearchIcon width={16} height={16}/></button>
          <input value={q} onChange={e => setQ(e.target.value)} aria-label={t("nav.search")}
            className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-subtle min-w-0" placeholder={t("nav.searchShort")}/>
          <Link href="/shop" className="text-subtle hover:text-ink shrink-0" aria-label={t("shop.filters")}><Sliders size={17}/></Link>
        </form>
        <LangToggle/>
        {Bag}
      </div>

      {/* ---------- Desktop bar ---------- */}
      <nav className="hidden lg:flex items-center gap-4 bg-white/85 backdrop-blur rounded-pill pl-6 pr-2 py-2.5 border border-line shadow-soft">
        <div className="flex items-center gap-6">
          {[["/shop","nav.shop"],["/shop?gender=Men","nav.men"],["/shop?gender=Women","nav.women"],["/shop?filter=new","nav.trending"]].map(([h,k]) => (
            <Link key={k} href={h} className={`text-[12px] uppercase tracking-[.12em] font-medium transition-colors ${pathname===h?"text-ink":"text-muted hover:text-ink"}`}>{t(k)}</Link>
          ))}
        </div>
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 font-display text-[22px] tracking-[.04em] leading-none">VEXO</Link>
        <div className="flex items-center gap-3 ml-auto">
          <form onSubmit={search} className="flex items-center gap-2.5 bg-surface-2 rounded-pill px-4 py-2.5 border border-transparent focus-within:border-line focus-within:bg-white transition w-[220px]">
            <button type="submit" className="text-subtle hover:text-ink shrink-0" aria-label={t("nav.search")}><SearchIcon width={16} height={16}/></button>
            <input value={q} onChange={e => setQ(e.target.value)} aria-label={t("nav.search")}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-subtle min-w-0" placeholder={t("nav.searchShort")}/>
          </form>
          <LangToggle/>
          {Bag}
          <Link href={user ? "/account" : "/auth"} aria-label={t("nav.account")} className="flex items-center gap-2.5 bg-ink text-white rounded-pill pl-4 pr-1.5 py-1.5 text-[12px] font-semibold uppercase tracking-[.1em] hover:opacity-90 transition">
            {user ? user.firstName : t("nav.signin")}
            <span className="w-8 h-8 rounded-full bg-white/15 grid place-items-center"><UserIcon width={15} height={15}/></span>
          </Link>
        </div>
      </nav>
    </>
  );
}
