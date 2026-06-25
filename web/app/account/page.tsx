"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useAuth, useWish, useToast, useOrders, type OrderRecord } from "@/lib/store";
import { useT } from "@/components/LangProvider";
import { Skeleton } from "@/components/Skeleton";
import { CountUp } from "@/components/CountUp";
import { api, money } from "@/lib/api";
import type { Product } from "@/lib/types";

const TABS = ["Overview", "Orders", "Wishlist", "Addresses", "Settings"] as const;
type Tab = (typeof TABS)[number];
const TAB_KEY: Record<Tab, string> = {
  Overview: "acc.overview", Orders: "acc.orders", Wishlist: "acc.wishlist",
  Addresses: "acc.addresses", Settings: "acc.settings",
};

const statusStyle: Record<string, string> = {
  processing: "bg-amber-100 text-amber-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
};

export default function AccountPage() {
  const router = useRouter();
  const t = useT();
  const user = useAuth(s => s.user);
  const signOut = useAuth(s => s.signOut);
  const wishIds = useWish(s => s.ids);
  const showToast = useToast(s => s.show);
  const orders = useOrders(s => s.orders);
  const [tab, setTab] = useState<Tab>("Overview");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user) { router.push("/auth"); return; }
    api.products.list({}).then(r => setAllProducts(r.data)).catch(() => {}).finally(() => setLoadingProducts(false));
  }, [user, router]);

  if (!mounted || !user) return null;

  const totalSpent = orders.reduce((a, b) => a + b.total, 0);
  const wished = allProducts.filter(p => wishIds.includes(p.id));

  return (
    <>
      <div className="px-3 pt-3 sm:px-4 sm:pt-4 lg:px-5 lg:pt-5 pb-2 mesh-light min-h-screen">
        <div className="max-w-[1100px] mx-auto">
          <Nav />

          {/* Profile header */}
          <div className="mt-6 bg-white border border-line rounded-3xl p-5 sm:p-7 shadow-soft">
            <div className="flex items-center gap-4">
              <span className="w-16 h-16 rounded-full grid place-items-center text-white font-display text-[22px]"
                style={{ background: "linear-gradient(135deg,#FF8A3D,#E8550A)" }}>
                {user.firstName[0]}{user.lastName[0]}
              </span>
              <div className="min-w-0">
                <h1 className="font-display text-[24px] tracking-tight truncate">{user.firstName} {user.lastName}</h1>
                <p className="text-muted text-[13px] truncate">{user.email}</p>
                <span className="inline-flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-accent bg-accent-soft px-2.5 py-1 rounded-pill">
                  {t("acc.goldMember")} · 1,240 {t("acc.pts")}
                </span>
              </div>
              <button onClick={() => { signOut(); router.push("/"); }}
                className="ml-auto hidden sm:inline-flex btn btn-outline btn-sm">{t("acc.signOut")}</button>
            </div>

            {/* Stat tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              <Stat label={t("acc.statOrders")} value={<CountUp value={orders.length}/>}/>
              <Stat label={t("acc.statSpent")} value={<CountUp value={totalSpent} format={money}/>}/>
              <Stat label={t("acc.statWishlist")} value={<CountUp value={wished.length}/>}/>
              <Stat label={t("acc.statPoints")} value={<CountUp value={1240}/>}/>
            </div>
          </div>

          {/* Tabs */}
          <div className="sticky top-2 z-20 mt-4 -mx-3 px-3 sm:mx-0 sm:px-0">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar bg-white/80 backdrop-blur border border-line rounded-pill p-1.5 shadow-soft">
              {TABS.map(tb => (
                <button key={tb} onClick={() => setTab(tb)}
                  className={`h-9 px-4 rounded-pill text-[13px] font-medium whitespace-nowrap shrink-0 transition ${
                    tab === tb ? "bg-ink text-white" : "text-muted hover:text-ink"
                  }`}>{t(TAB_KEY[tb])}</button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="mt-5 mb-10">
            {tab === "Overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card title={t("acc.recentOrder")}>
                  {orders.length === 0 ? <Empty msg={t("acc.noOrders")}/> : (
                    <OrderRow o={orders[orders.length - 1]}/>
                  )}
                </Card>
                <Card title={t("acc.defaultAddress")}>
                  <p className="text-muted leading-relaxed text-sm">
                    {user.firstName} {user.lastName}<br/>
                    140 Performance Ave, Apt 3B<br/>
                    Los Angeles, CA 90012<br/>+1 (213) 555-0142
                  </p>
                </Card>
                <Card title={t("acc.paymentMethod")}>
                  <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-xl">
                    <svg width={40} height={26} viewBox="0 0 40 26"><rect width="40" height="26" rx="4" fill="#1A1F71"/><circle cx="15" cy="13" r="7" fill="#EB001B"/><circle cx="24" cy="13" r="7" fill="#F79E1B" opacity=".85"/></svg>
                    <div><div className="font-semibold text-sm">•••• 4242</div><div className="tiny">{t("acc.expires")} 09/28</div></div>
                  </div>
                </Card>
                <Card title={t("acc.loyalty")}>
                  <p className="text-sm text-muted">{t("acc.loyaltyA")} <span className="text-ink font-semibold">{t("acc.loyaltyPoints")}</span> {t("acc.loyaltyB")}</p>
                  <div className="h-2 bg-surface-2 rounded-pill mt-3 overflow-hidden"><div className="h-full bg-accent rounded-pill" style={{ width: "62%" }}/></div>
                </Card>
              </div>
            )}

            {tab === "Orders" && (
              <Card title={`${orders.length} ${t("acc.ordersWord")}`}>
                {orders.length === 0 ? (
                  <Empty msg={t("acc.noOrders")} cta/>
                ) : (
                  <div className="divide-y divide-line">
                    {orders.slice().reverse().map(o => <OrderRow key={o.id} o={o}/>)}
                  </div>
                )}
              </Card>
            )}

            {tab === "Wishlist" && (
              loadingProducts ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[0, 1, 2, 3].map(i => <Skeleton key={i} className="aspect-[4/5] rounded-[1.4rem]"/>)}
                </div>
              ) : wished.length === 0 ? (
                <Card><Empty msg={t("acc.wishEmpty")} cta/></Card>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {wished.map((p, i) => <ProductCard key={p.id} product={p} index={i}/>)}
                </div>
              )
            )}

            {tab === "Addresses" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card title={t("acc.defaultHome")}>
                  <p className="text-muted leading-relaxed text-sm">{user.firstName} {user.lastName}<br/>140 Performance Ave, Apt 3B<br/>Los Angeles, CA 90012</p>
                  <button onClick={() => showToast(t("toast.editAddress"))} className="btn btn-outline btn-sm mt-4">{t("common.edit")}</button>
                </Card>
                <button onClick={() => showToast(t("toast.addAddress"))}
                  className="border-2 border-dashed border-line rounded-2xl p-6 text-muted hover:border-ink/30 hover:text-ink transition grid place-items-center min-h-[140px]">
                  <span className="text-3xl leading-none">+</span>
                  <span className="text-sm mt-2">{t("acc.addAddress")}</span>
                </button>
              </div>
            )}

            {tab === "Settings" && (
              <Card title={t("acc.profileSettings")}>
                <form onSubmit={(e) => { e.preventDefault(); showToast(t("toast.profileSaved")); }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label={t("co.firstName")} defaultValue={user.firstName}/>
                  <Field label={t("co.lastName")} defaultValue={user.lastName}/>
                  <Field label={t("co.email")} defaultValue={user.email} full type="email"/>
                  <Field label={t("co.phone")} defaultValue="+1 (213) 555-0142" full/>
                  <label className="sm:col-span-2 flex items-center gap-2.5 text-sm text-muted">
                    <input type="checkbox" defaultChecked className="accent-accent"/> {t("acc.emailOptin")}
                  </label>
                  <div className="sm:col-span-2 flex gap-3 mt-2">
                    <button type="submit" className="btn btn-primary">{t("acc.saveChanges")}</button>
                    <button type="button" onClick={() => { signOut(); router.push("/"); }} className="btn btn-outline sm:hidden">{t("acc.signOut")}</button>
                  </div>
                </form>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-surface-2 rounded-2xl p-4">
      <div className="text-[12px] text-muted">{label}</div>
      <div className="font-display text-[24px] tracking-tight mt-1 num-tabular">{value}</div>
    </div>
  );
}
function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-line rounded-2xl p-5 shadow-soft">
      {title && <h3 className="font-display text-[17px] tracking-tight mb-4">{title}</h3>}
      {children}
    </div>
  );
}
function OrderRow({ o }: { o: OrderRecord }) {
  const t = useT();
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-sm truncate">{o.items.map(i => i.name).join(", ")}</div>
        <div className="tiny">#{o.id} · {o.createdAt.slice(0, 10)}</div>
      </div>
      <span className={`px-2.5 py-1 rounded-pill text-[11px] font-semibold ${statusStyle[o.status]}`}>{t(`acc.status_${o.status}`)}</span>
      <span className="font-semibold text-sm num-tabular">{money(o.total)}</span>
    </div>
  );
}
function Empty({ msg, cta }: { msg: string; cta?: boolean }) {
  const t = useT();
  return (
    <div className="py-8 text-center">
      <p className="text-muted">{msg}</p>
      {cta && <Link href="/shop" className="btn btn-primary btn-sm mt-4 inline-flex">{t("acc.startShopping")}</Link>}
    </div>
  );
}
function Field({ label, defaultValue, full, type = "text" }: { label: string; defaultValue?: string; full?: boolean; type?: string }) {
  return (
    <label className={`field flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-muted">{label}</span>
      <input type={type} defaultValue={defaultValue}/>
    </label>
  );
}
