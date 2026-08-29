"use client";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { CheckIcon, LockIcon } from "@/components/Icons";
import { useCart, useToast, useAuth } from "@/lib/store";
import { useT, useLang } from "@/components/LangProvider";
import { money } from "@/lib/api";
import { medusa } from "@/lib/medusa";
import { wire } from "@/lib/wire";

export default function CheckoutPage() {
  const router = useRouter();
  const t = useT();
  const lang = useLang();
  const items = useCart(s => s.items);
  const clear = useCart(s => s.clear);
  const showToast = useToast(s => s.show);
  const user = useAuth(s => s.user);
  const token = useAuth(s => s.token);
  const [email, setEmail] = useState("");
  // Shipping options come from Medusa (single source of truth — no hardcoded prices).
  const [shipOptions, setShipOptions] = useState<{ id: string; name: string; amount: number }[]>([]);
  const [shipOptionId, setShipOptionId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Coupon state
  const [promoInput, setPromoInput] = useState("");
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promo, setPromo] = useState<{ discountTotal: number; shippingTotal: number; total: number } | null>(null);
  const [promoBusy, setPromoBusy] = useState(false);
  const [promoErr, setPromoErr] = useState("");
  useEffect(() => { setMounted(true); if (user?.email) setEmail(e => e || user.email); }, [user]);

  const subtotal = items.reduce((a, b) => a + b.price * b.qty, 0);
  const lineItemsFor = () => items.filter(i => i.variantId).map(i => ({ variantId: i.variantId!, quantity: i.qty }));

  // Fetch real, priced shipping options once the cart items are known.
  useEffect(() => {
    const li = lineItemsFor();
    if (!mounted || li.length === 0 || shipOptions.length) return;
    let cancelled = false;
    medusa.shippingQuote(li)
      .then(opts => { if (!cancelled && opts.length) { setShipOptions(opts); setShipOptionId(id => id || opts[0].id); } })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, items]);

  const selectedShip = shipOptions.find(o => o.id === shipOptionId);
  // Automatic free shipping over the threshold (mirrors the backend promo so the
  // summary matches the charge). Keep in sync with seed-free-shipping.ts.
  const FREE_SHIP_THRESHOLD = 150000;
  const freeByThreshold = subtotal >= FREE_SHIP_THRESHOLD;
  const shipping = freeByThreshold ? 0 : (selectedShip ? selectedShip.amount : 0);
  const tax = 0;
  // Effective totals — Medusa's numbers when a coupon is applied, else local.
  const discount = promo ? promo.discountTotal : 0;
  const total = promo ? promo.total : subtotal + shipping + tax;
  const freeShipRemaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);

  async function applyPromo(code: string) {
    const c = code.trim();
    if (!c) return;
    const li = lineItemsFor();
    if (li.length === 0) { setPromoErr(t("toast.readd")); return; }
    setPromoBusy(true); setPromoErr("");
    try {
      const res = await medusa.previewPromo({ items: li, shippingOptionId: shipOptionId || undefined, promoCode: c });
      if (!res.valid) { setPromo(null); setPromoCode(null); setPromoErr(t("co.promoInvalid")); return; }
      setPromo({ discountTotal: res.discountTotal, shippingTotal: res.shippingTotal, total: res.total });
      setPromoCode(res.code);
    } catch { setPromoErr(t("co.promoInvalid")); }
    finally { setPromoBusy(false); }
  }
  function clearPromo() { setPromo(null); setPromoCode(null); setPromoInput(""); setPromoErr(""); }
  // Re-price the coupon if the selected shipping option changes (FREESHIP etc.).
  useEffect(() => {
    if (!promoCode) return;
    let cancelled = false;
    medusa.previewPromo({ items: lineItemsFor(), shippingOptionId: shipOptionId || undefined, promoCode: promoCode })
      .then(res => { if (!cancelled && res.valid) setPromo({ discountTotal: res.discountTotal, shippingTotal: res.shippingTotal, total: res.total }); })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipOptionId]);

  async function place(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return showToast(t("toast.cartEmpty"));
    const lineItems = items.filter(i => i.variantId).map(i => ({ variantId: i.variantId!, quantity: i.qty }));
    if (lineItems.length === 0) return showToast(t("toast.readd"));

    const fd = new FormData(e.target as HTMLFormElement);
    const address = {
      first_name: String(fd.get("first_name") || "Customer"),
      last_name: String(fd.get("last_name") || ""),
      address_1: String(fd.get("address_1") || ""),
      city: String(fd.get("city") || ""),
      postal_code: String(fd.get("postal_code") || ""),
      country_code: "mn",
      phone: String(fd.get("phone") || ""),
    };

    setBusy(true);
    try {
      // Coarse method label for the payment intent (metadata only).
      const coarse: "standard" | "express" = /express/i.test(selectedShip?.name || "") ? "express" : "standard";
      // 1. Build the Medusa cart (not completed yet)
      const { cartId, total: cartTotal } = await medusa.prepareCart({ email, items: lineItems, shippingOptionId: shipOptionId || undefined, address, token: token ?? undefined, promoCode: promoCode ?? undefined });
      // 2. Start a Wire payment (QPay / bank apps)
      const intent = await wire.createIntent({ cartId, amount: cartTotal, email, shippingMethod: coarse });
      // 3a. Live → redirect to Wire hosted checkout; 3b. mock → our processing page polls
      if (intent.live && intent.checkoutUrl) {
        window.location.href = intent.checkoutUrl;
        return;
      }
      router.push(`/${lang}/checkout/processing?pi=${encodeURIComponent(intent.intentId)}`);
    } catch (err: any) {
      showToast(err.message || t("toast.payFailed"));
      setBusy(false);
    }
  }

  return (
    <>
      <div className="px-3 pt-3 sm:px-4 sm:pt-4 lg:px-5 lg:pt-5 pb-2 mesh-light min-h-screen">
        <div className="max-w-[1100px] mx-auto">
          <Nav />

        <div className="text-[11px] font-mono tracking-wider text-subtle flex items-center gap-2 mt-6">
          <Link href="/cart" className="hover:text-ink uppercase">{t("bc.cart")}</Link><span className="opacity-40">/</span><span className="text-ink uppercase">{t("bc.checkout")}</span>
        </div>

        <h1 className="font-display text-[30px] sm:text-[44px] uppercase tracking-tight leading-[.95] mt-3 mb-5">{t("co.titlePre")}<span className="text-accent">{t("co.titleAccent")}</span></h1>

        <div className="flex gap-1.5 sm:gap-2 mb-7 text-[12px] overflow-x-auto no-scrollbar">
          <Step n={1} label={t("co.cart")} done/>
          <Sep/>
          <Step n={2} label={t("co.information")} active/>
          <Sep/>
          <Step n={3} label={t("co.payment")}/>
          <Sep/>
          <Step n={4} label={t("co.confirm")}/>
        </div>

        <form onSubmit={place} className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5 lg:gap-8 pb-10">
          <div>
            <FormCard title={t("co.contact")}>
              <div className="grid gap-3.5">
                <Field label={t("co.email")} required>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder={t("news.placeholder")}/>
                </Field>
              </div>
            </FormCard>

            <FormCard title={t("co.shippingAddress")}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <Field label={t("co.firstName")}><input name="first_name" placeholder="Bat" defaultValue="Bat" required/></Field>
                <Field label={t("co.lastName")}><input name="last_name" placeholder="Erdene" defaultValue="Erdene" required/></Field>
                <Field label={t("co.address")} full><input name="address_1" placeholder="District, street, building" defaultValue="Sukhbaatar District, 1-r khoroo" required/></Field>
                <Field label={t("co.city")}><input name="city" placeholder="Ulaanbaatar" defaultValue="Ulaanbaatar" required/></Field>
                <Field label={t("co.postal")}><input name="postal_code" placeholder="14200" defaultValue="14200" required/></Field>
                <Field label={t("co.country")}>
                  <select name="country"><option value="mn">{t("co.mongolia")}</option></select>
                </Field>
                <Field label={t("co.phone")}><input name="phone" placeholder="+976 …" defaultValue="+976 9911 2233"/></Field>
              </div>
            </FormCard>

            <FormCard title={t("co.shippingMethod")}>
              {shipOptions.length === 0 ? (
                <div className="text-sm text-muted py-2">{t("common.pleaseWait")}</div>
              ) : shipOptions.map(o => {
                const isExpress = /express/i.test(o.name);
                const isStandard = /standard/i.test(o.name);
                const title = isExpress ? t("co.express") : isStandard ? t("co.standard") : o.name;
                const sub = isExpress ? t("co.expressSub") : isStandard ? t("co.standardSub") : undefined;
                return (
                  <Radio key={o.id} name="ship" checked={shipOptionId === o.id} onChange={() => setShipOptionId(o.id)}
                    title={title} sub={sub} right={o.amount === 0 ? t("common.free") : money(o.amount)}/>
                );
              })}
            </FormCard>

            <FormCard title={t("co.payment")}>
              <div className="border-2 border-ink rounded-xl p-4 flex items-center gap-3.5 bg-surface-2">
                <input type="radio" name="pay" checked readOnly className="accent-ink"/>
                <div className="flex-1">
                  <div className="font-semibold">{t("co.wireTitle")}</div>
                  <div className="tiny">{t("co.wireSub")}</div>
                </div>
                <span className="px-2.5 h-7 grid place-items-center rounded-pill bg-ink text-white text-[11px] font-bold tracking-wide">QPay</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[12px] text-muted">
                <LockIcon width={14} height={14}/> {t("co.wireNote")}
              </div>
            </FormCard>

            <button disabled={busy} type="submit" className="btn btn-primary w-full justify-center h-[60px] text-base disabled:opacity-50">
              {busy ? t("co.starting") : t("co.payWire")}
              <span className="arrow-cap"><CheckIcon width={14} height={14}/></span>
            </button>
            <p className="tiny text-center mt-3.5">
              {t("co.termsPre")}{" "}
              <Link href="/terms" className="underline hover:text-ink">{t("foot.terms")}</Link>,{" "}
              <Link href="/privacy" className="underline hover:text-ink">{t("foot.privacy")}</Link>{t("co.termsPost")}
            </p>
          </div>

          <aside className="card p-7 h-fit lg:sticky lg:top-6">
            <h3 className="hd-3">{t("co.order")}</h3>
            <div className="my-3.5 py-3.5 border-t border-b border-border">
              {mounted && items.map(i => (
                <div key={i.id} className="flex justify-between py-2 text-muted">
                  <span>{i.name} × {i.qty}</span>
                  <span>{money(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
            {/* Coupon */}
            <div className="mb-3.5">
              {!promoCode ? (
                <>
                  <div className="flex gap-2">
                    <input
                      value={promoInput}
                      onChange={e => { setPromoInput(e.target.value); setPromoErr(""); }}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); applyPromo(promoInput); } }}
                      placeholder={t("co.promoPlaceholder")}
                      className="flex-1 min-w-0 uppercase tracking-wide"
                      aria-label={t("co.promoTitle")}
                    />
                    <button type="button" onClick={() => applyPromo(promoInput)} disabled={promoBusy || !promoInput.trim()}
                      className="btn btn-ghost px-4 whitespace-nowrap disabled:opacity-50">
                      {promoBusy ? "…" : t("co.promoApply")}
                    </button>
                  </div>
                  {promoErr && <div className="text-[12px] text-red-600 mt-1.5">{promoErr}</div>}
                </>
              ) : (
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-green-50 border border-green-200">
                  <span className="text-[13px] font-semibold text-green-700 flex items-center gap-1.5">
                    <CheckIcon width={13} height={13}/> {promoCode} {t("co.promoApplied")}
                  </span>
                  <button type="button" onClick={clearPromo} className="text-[12px] text-muted hover:text-ink underline">{t("co.promoRemove")}</button>
                </div>
              )}
            </div>
            <Row k={t("cart.subtotal")} v={money(subtotal)}/>
            {discount > 0 && <Row k={t("co.discount")} v={`− ${money(discount)}`}/>}
            <Row k={t("cart.shipping")} v={shipping === 0 ? t("common.free") : money(shipping)}/>
            {mounted && !promo && (freeByThreshold
              ? <div className="text-[12px] text-green-600 -mt-1 mb-1">✓ {t("co.freeShipEarned")}</div>
              : freeShipRemaining > 0 && <div className="text-[12px] text-muted -mt-1 mb-1">{t("co.freeShipHintPre")} {money(freeShipRemaining)} {t("co.freeShipHintPost")}</div>
            )}
            <Row k={t("cart.tax")} v={money(tax)}/>
            <div className="flex justify-between border-t border-border pt-4.5 mt-3 text-[18px] font-semibold">
              <span>{t("cart.total")}</span><span>{money(total)}</span>
            </div>
            <div className="flex items-center gap-2.5 mt-4 p-3 bg-surface-2 rounded-xl text-[13px] text-muted">
              <LockIcon width={14} height={14}/> {t("co.secure")}
            </div>
          </aside>
        </form>
        </div>
      </div>
    </>
  );
}

function Step({ n, label, active, done }: { n: number; label: string; active?: boolean; done?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 font-medium ${active ? "text-ink" : done ? "text-ink" : "text-subtle"}`}>
      <span className={`w-6.5 h-6.5 rounded-full grid place-items-center text-xs ${
        done ? "bg-green-600 text-white" : active ? "bg-ink text-white" : "bg-surface-2"
      }`} style={{ width: 26, height: 26 }}>{n}</span>
      {label}
    </div>
  );
}
function Sep() { return <span className="w-8 h-px bg-border self-center"/> }
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between py-2 text-muted"><span>{k}</span><span>{v}</span></div>;
}
function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-7 mb-4">
      <h3 className="hd-3 mb-4">{title}</h3>
      {children}
    </div>
  );
}
function Field({ label, full, children, required }: { label: string; full?: boolean; children: React.ReactNode; required?: boolean }) {
  return (
    <label className={`field flex flex-col gap-1.5 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-muted">{label}{required && " *"}</span>
      {children}
    </label>
  );
}
function Radio({ name, title, sub, right, checked, onChange }: { name: string; title: string; sub?: string; right?: string; checked?: boolean; onChange?: () => void }) {
  return (
    <label className={`border rounded-xl p-4 flex items-center gap-3.5 cursor-pointer mb-2.5 ${checked ? "border-ink bg-surface-2" : "border-border"}`}>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="accent-ink"/>
      <div className="flex-1">
        <div className="font-semibold">{title}</div>
        {sub && <div className="tiny">{sub}</div>}
      </div>
      {right && <div className="font-semibold">{right}</div>}
    </label>
  );
}
