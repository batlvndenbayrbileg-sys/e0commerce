"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { CheckIcon, LockIcon } from "@/components/Icons";
import { useCart, useToast } from "@/lib/store";
import { money } from "@/lib/api";
import { medusa } from "@/lib/medusa";
import { wire } from "@/lib/wire";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart(s => s.items);
  const clear = useCart(s => s.clear);
  const showToast = useToast(s => s.show);
  const [email, setEmail] = useState("");
  const [shipMethod, setShipMethod] = useState<"standard" | "express">("standard");
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const subtotal = items.reduce((a, b) => a + b.price * b.qty, 0);
  const shipping = shipMethod === "express" ? 18 : subtotal > 200 ? 0 : 12;
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = subtotal + shipping + tax;

  async function place(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return showToast("Cart is empty");
    const lineItems = items.filter(i => i.variantId).map(i => ({ variantId: i.variantId!, quantity: i.qty }));
    if (lineItems.length === 0) return showToast("Please re-add items to your bag");

    const fd = new FormData(e.target as HTMLFormElement);
    const address = {
      first_name: String(fd.get("first_name") || "Customer"),
      last_name: String(fd.get("last_name") || ""),
      address_1: String(fd.get("address_1") || ""),
      city: String(fd.get("city") || ""),
      postal_code: String(fd.get("postal_code") || ""),
      country_code: "us",
      phone: String(fd.get("phone") || ""),
    };

    setBusy(true);
    try {
      // 1. Build the Medusa cart (not completed yet)
      const { cartId, total: cartTotal } = await medusa.prepareCart({ email, items: lineItems, shippingMethod: shipMethod, address });
      // 2. Start a Wire payment (QPay / bank apps)
      const intent = await wire.createIntent({ cartId, amount: cartTotal, email, shippingMethod: shipMethod });
      // 3a. Live → redirect to Wire hosted checkout; 3b. mock → our processing page polls
      if (intent.live && intent.checkoutUrl) {
        window.location.href = intent.checkoutUrl;
        return;
      }
      router.push(`/checkout/processing?pi=${encodeURIComponent(intent.intentId)}`);
    } catch (err: any) {
      showToast(err.message || "Payment could not be started");
      setBusy(false);
    }
  }

  return (
    <>
      <div className="px-3 pt-3 sm:px-4 sm:pt-4 lg:px-5 lg:pt-5 pb-2 mesh-light min-h-screen">
        <div className="max-w-[1100px] mx-auto">
          <Nav />

        <div className="text-[11px] font-mono tracking-wider text-subtle flex items-center gap-2 mt-6">
          <Link href="/cart" className="hover:text-ink">CART</Link><span className="opacity-40">/</span><span className="text-ink">CHECKOUT</span>
        </div>

        <h1 className="font-display text-[30px] sm:text-[44px] uppercase tracking-tight leading-[.95] mt-3 mb-5">Check<span className="text-accent">out</span></h1>

        <div className="flex gap-1.5 sm:gap-2 mb-7 text-[12px] overflow-x-auto no-scrollbar">
          <Step n={1} label="Cart" done/>
          <Sep/>
          <Step n={2} label="Information" active/>
          <Sep/>
          <Step n={3} label="Payment"/>
          <Sep/>
          <Step n={4} label="Confirm"/>
        </div>

        <form onSubmit={place} className="grid lg:grid-cols-[1.4fr_1fr] gap-5 lg:gap-8 pb-10">
          <div>
            <FormCard title="Contact">
              <div className="grid gap-3.5">
                <Field label="Email" required>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com"/>
                </Field>
              </div>
            </FormCard>

            <FormCard title="Shipping address">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <Field label="First name"><input name="first_name" placeholder="Alex" defaultValue="Alex" required/></Field>
                <Field label="Last name"><input name="last_name" placeholder="Rivera" defaultValue="Rivera" required/></Field>
                <Field label="Address" full><input name="address_1" placeholder="Street and number" defaultValue="140 Performance Ave" required/></Field>
                <Field label="City"><input name="city" placeholder="Los Angeles" defaultValue="Los Angeles" required/></Field>
                <Field label="Postal code"><input name="postal_code" placeholder="90012" defaultValue="90012" required/></Field>
                <Field label="Country">
                  <select name="country"><option value="us">United States</option></select>
                </Field>
                <Field label="Phone"><input name="phone" placeholder="+1 …" defaultValue="+1 213 555 0142"/></Field>
              </div>
            </FormCard>

            <FormCard title="Shipping method">
              <Radio name="ship" checked={shipMethod === "standard"} onChange={() => setShipMethod("standard")}
                title="Standard — 3 to 5 business days" sub="Tracked, insured" right="Free"/>
              <Radio name="ship" checked={shipMethod === "express"} onChange={() => setShipMethod("express")}
                title="Express — 1 to 2 business days" sub="Priority handling" right="$18"/>
            </FormCard>

            <FormCard title="Payment">
              <div className="border-2 border-ink rounded-xl p-4 flex items-center gap-3.5 bg-surface-2">
                <input type="radio" name="pay" checked readOnly className="accent-ink"/>
                <div className="flex-1">
                  <div className="font-semibold">Wire — QPay & bank apps</div>
                  <div className="tiny">Scan with QPay or pay from any Mongolian bank app</div>
                </div>
                <span className="px-2.5 h-7 grid place-items-center rounded-pill bg-ink text-white text-[11px] font-bold tracking-wide">QPay</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[12px] text-muted">
                <LockIcon width={14} height={14}/> You'll confirm payment securely on Wire, then return here.
              </div>
            </FormCard>

            <button disabled={busy} type="submit" className="btn btn-primary w-full justify-center h-[60px] text-base disabled:opacity-50">
              {busy ? "Starting payment…" : "Pay with Wire"}
              <span className="arrow-cap"><CheckIcon width={14} height={14}/></span>
            </button>
            <p className="tiny text-center mt-3.5">By placing this order you agree to our <a href="#" className="underline">Terms</a> & <a href="#" className="underline">Privacy</a>.</p>
          </div>

          <aside className="card p-7 h-fit lg:sticky lg:top-6">
            <h3 className="h-3">Order</h3>
            <div className="my-3.5 py-3.5 border-t border-b border-border">
              {mounted && items.map(i => (
                <div key={i.id} className="flex justify-between py-2 text-muted">
                  <span>{i.name} × {i.qty}</span>
                  <span>{money(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
            <Row k="Subtotal" v={money(subtotal)}/>
            <Row k="Shipping" v={shipping === 0 ? "Free" : money(shipping)}/>
            <Row k="Tax (est.)" v={money(tax)}/>
            <div className="flex justify-between border-t border-border pt-4.5 mt-3 text-[18px] font-semibold">
              <span>Total</span><span>{money(total)}</span>
            </div>
            <div className="flex items-center gap-2.5 mt-4 p-3 bg-surface-2 rounded-xl text-[13px] text-muted">
              <LockIcon width={14} height={14}/> 256‑bit SSL · PCI compliant
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
      <h3 className="h-3 mb-4">{title}</h3>
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
