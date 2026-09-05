import { Router, raw, type Request, type Response } from "express";
import * as Sentry from "@sentry/node";
import { z } from "zod";
import {
  createPaymentIntent, getPaymentIntent, createCheckoutSession,
  verifyWireSignature, WIRE_LIVE, WIRE_WEBHOOK_IP,
} from "../lib/wire.js";
import { sendOrderConfirmation } from "../lib/email.js";

const MEDUSA_URL = process.env.MEDUSA_URL || "http://localhost:9000";
// No baked-in fallback: a wrong/absent key must fail loudly, not silently use a
// key that won't match the deployed Medusa DB (H6). Dev may still export a local one.
const MEDUSA_PK = process.env.MEDUSA_PK || "";
if (!MEDUSA_PK && process.env.NODE_ENV === "production") {
  throw new Error("MEDUSA_PK is required in production (Medusa publishable key).");
}

type OrderItem = { title: string; quantity: number; amount: number };
type Record = {
  cartId: string;
  amount: number;
  email: string;
  shippingMethod: "standard" | "express";
  // pending      → payment not yet captured (or completion still being retried)
  // paid         → cart completed into a real order
  // needs_review → Wire captured money but the cart could not be completed after
  //                MAX_SETTLE_ATTEMPTS (e.g. out of stock); flagged for a human.
  status: "pending" | "paid" | "needs_review";
  attempts?: number;   // completion attempts made (across polls/webhook)
  emailed?: boolean;   // guard: send the confirmation email exactly once
  reported?: boolean;  // guard: alert on an unfulfilled paid order exactly once
  order?: { id: string; total: number; email: string; estimatedDelivery: string; items: OrderItem[] };
};
const intents = new Map<string, Record>();

// How many times we retry completing a paid cart (across poll ticks + webhook)
// before giving up and flagging for manual reconciliation. A transient backend
// blip self-heals within these; a permanent failure (out of stock) ends here.
const MAX_SETTLE_ATTEMPTS = 5;

// Dedupe concurrent settle() calls for the same intent — the storefront poll and
// the Wire webhook can both fire at once; without this they'd race to complete
// the same cart and double-send the confirmation email (H4).
const inFlight = new Map<string, Promise<Record | null>>();

// A paid order that could not be turned into a Medusa order MUST NOT vanish: the
// customer's money is already captured in Wire. Alert loudly (Sentry + structured
// log) with everything an operator needs to reconcile or refund by hand. Fires
// once per intent.
function reportUnfulfilledPayment(intentId: string, rec: Record, err: Error) {
  if (rec.reported) return;
  rec.reported = true;
  const detail = { intentId, cartId: rec.cartId, email: rec.email, amount: rec.amount, error: err.message };
  console.error(`[settle] PAID BUT UNFULFILLED — manual reconciliation needed:`, JSON.stringify(detail));
  try {
    Sentry.captureException(err, { level: "fatal", tags: { kind: "paid_unfulfilled" }, extra: detail });
  } catch { /* Sentry no-op without DSN */ }
}

// Authoritative amount: the cart's server-side total (never trust a client-sent
// amount — otherwise a buyer could pay less than the order is worth).
async function cartTotal(cartId: string): Promise<number> {
  const res = await fetch(`${MEDUSA_URL}/store/carts/${cartId}?fields=id,total,currency_code`, {
    headers: { "content-type": "application/json", "x-publishable-api-key": MEDUSA_PK },
  });
  const data: any = await res.json().catch(() => ({}));
  const total = data?.cart?.total;
  if (typeof total !== "number" || !Number.isFinite(total)) throw new Error("Cart not found");
  return Math.round(total);
}

// Complete the Medusa cart (already has address + shipping + payment session) → real order
async function completeMedusaCart(cartId: string, shippingMethod: "standard" | "express") {
  const res = await fetch(`${MEDUSA_URL}/store/carts/${cartId}/complete`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-publishable-api-key": MEDUSA_PK },
    body: "{}",
  });
  const data: any = await res.json().catch(() => ({}));
  if (data?.type !== "order") throw new Error(data?.message || "Cart completion failed");
  const o = data.order;
  return {
    id: o.display_id ? `NT-${o.display_id}` : o.id,
    total: Math.round(o.total),
    email: o.email,
    estimatedDelivery: new Date(Date.now() + (shippingMethod === "express" ? 2 : 4) * 86400000).toISOString().slice(0, 10),
    items: (o.items || []).map((it: any): OrderItem => ({
      title: it.product_title || it.title || "Item",
      quantity: it.quantity,
      amount: Math.round(Number(it.total ?? it.unit_price * it.quantity) || 0),
    })),
  };
}

function settle(intentId: string): Promise<Record | null> {
  const cached = intents.get(intentId);
  if (cached?.status === "paid") return Promise.resolve(cached);
  // Coalesce concurrent callers (poll + webhook) onto one in-flight settlement.
  const running = inFlight.get(intentId);
  if (running) return running;
  const p = doSettle(intentId).finally(() => inFlight.delete(intentId));
  inFlight.set(intentId, p);
  return p;
}

async function doSettle(intentId: string): Promise<Record | null> {
  const cached = intents.get(intentId);
  if (cached?.status === "paid") return cached;

  const intent = await getPaymentIntent(intentId);
  // Recover the intent's details from Wire's stored metadata when the local
  // cache is cold — i.e. the api restarted or another instance handled /intent.
  // Wire (the payment provider) is the durable source of truth, so no local
  // persistence is needed; completing the cart is idempotent on Medusa's side.
  const meta = (intent?.metadata || {}) as { cartId?: string; email?: string; shippingMethod?: string };
  const cartId = cached?.cartId ?? meta.cartId;
  if (!cartId) return null; // unknown intent (nothing to settle)
  const email = cached?.email ?? meta.email ?? "";
  const shippingMethod = (cached?.shippingMethod ?? meta.shippingMethod ?? "standard") as "standard" | "express";

  const rec: Record = cached ?? { cartId, amount: 0, email, shippingMethod, status: "pending", attempts: 0 };

  // Payment not captured yet → nothing to do (still "pending").
  if (intent.status !== "succeeded") { intents.set(intentId, rec); return rec; }
  if (rec.status === "paid") return rec;

  // Wire has the money. Turn the cart into a real Medusa order. This is the
  // money-critical step: on failure we retry (transient) and, if it persists,
  // flag for reconciliation rather than losing a paid order (B2).
  rec.attempts = (rec.attempts ?? 0) + 1;
  try {
    const order = await completeMedusaCart(cartId, shippingMethod); // idempotent: same cart → same order
    rec.order = order;
    rec.amount = order.total;
    rec.status = "paid";
    // M2 — the amount captured in Wire must equal the order total. A mismatch
    // means cart pricing changed between charge and completion; alert, don't block.
    const captured = typeof intent.amount === "number" ? Math.round(intent.amount) : null;
    if (captured != null && captured !== order.total) {
      console.error(`[settle] amount mismatch intent=${intentId} captured=${captured} order=${order.total}`);
      try { Sentry.captureMessage(`Wire amount mismatch: intent ${intentId} captured ${captured} vs order ${order.total}`, "warning"); } catch { /* no DSN */ }
    }
    if (!rec.emailed) { rec.emailed = true; sendOrderConfirmation(order).catch(() => {}); } // once
  } catch (e: any) {
    // Paid but not completed. Keep it retryable across the next poll ticks; once
    // we've exhausted attempts it's almost certainly permanent (e.g. out of
    // stock) → alert for manual reconciliation. Never silently drop it.
    rec.status = "needs_review";
    if (rec.attempts >= MAX_SETTLE_ATTEMPTS) reportUnfulfilledPayment(intentId, rec, e);
    else console.error(`[settle] completion attempt ${rec.attempts}/${MAX_SETTLE_ATTEMPTS} failed for cart ${cartId}: ${e.message}`);
  }
  intents.set(intentId, rec);
  return rec;
}

const router = Router();

const intentSchema = z.object({
  cartId: z.string().min(1),
  // `amount` is accepted for backwards-compat but IGNORED — the charge amount is
  // always the cart's server-side total (see cartTotal), so it can't be tampered.
  amount: z.number().int().nonnegative().optional(),
  email: z.string().email(),
  shippingMethod: z.enum(["standard", "express"]).default("standard"),
  origin: z.string().url().optional(),
});

// Create Wire intent + hosted checkout session
router.post("/intent", async (req, res) => {
  const parsed = intentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { cartId, email, shippingMethod, origin } = parsed.data;
  try {
    // Authoritative amount from the cart, not the client. This also confirms the
    // cart still exists/prices before we charge.
    // NOTE (B3): Medusa reserves inventory only at cart completion, so there is a
    // small window where two buyers can both pay for the last unit. That is not a
    // money-loss bug here — settle() catches an un-completable paid cart, flags it
    // (needs_review + Sentry alert) and never double-charges. True pre-payment
    // inventory reservation is a separate backend feature (see audit B3).
    const amount = await cartTotal(cartId);
    const intent = await createPaymentIntent({
      amount, idempotencyKey: `cart_${cartId}`,
      // Metadata is the durable record used to settle after an api restart.
      metadata: { cartId, email, shippingMethod },
    });
    const base = origin || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const session = await createCheckoutSession({
      paymentIntentId: intent.id,
      successUrl: `${base}/checkout/processing?pi=${intent.id}`,
      idempotencyKey: `sess_${cartId}`,
    });
    intents.set(intent.id, { cartId, amount, email, shippingMethod, status: "pending" });
    res.json({ data: { intentId: intent.id, checkoutUrl: session.url, live: WIRE_LIVE } });
  } catch (e: any) {
    console.error("wire intent error:", e.message);
    res.status(502).json({ error: "Payment could not be started" });
  }
});

// Poll status — completes the Medusa order once Wire reports success
router.get("/intent", async (req, res) => {
  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: "id required" });
  try {
    const rec = await settle(id);
    if (!rec) return res.status(404).json({ error: "intent not found" });
    // "review" = paid but we couldn't complete after all retries; tell the
    // storefront to stop polling and show the "we've got your payment, confirming
    // your order" message instead of spinning until timeout.
    const exhausted = rec.status === "needs_review" && (rec.attempts ?? 0) >= MAX_SETTLE_ATTEMPTS;
    const status = rec.status === "paid" ? "succeeded" : exhausted ? "review" : "pending";
    res.json({ data: { status, order: rec.order ?? null } });
  } catch (e: any) {
    console.error("wire settle error:", e.message);
    res.status(502).json({ error: "Could not verify payment" });
  }
});

export default router;

// Webhook (mounted with raw body in index.ts)
function clientIp(req: Request): string {
  const xff = (req.headers["x-forwarded-for"] as string) || "";
  return xff.split(",")[0].trim() || req.socket.remoteAddress || "";
}
export async function wireWebhook(req: Request, res: Response) {
  const rawBody = (req.body as Buffer)?.toString("utf8") || "";
  const secret = process.env.WIRE_WEBHOOK_SECRET;
  // In live mode the webhook MUST be authenticated. Refuse if misconfigured
  // rather than trusting an unsigned request. (settle() re-verifies with Wire
  // regardless, but this closes the gap for good.)
  if (WIRE_LIVE && !secret) {
    console.error("wire webhook: WIRE_WEBHOOK_SECRET not set in live mode — refusing");
    return res.status(500).json({ error: "Webhook not configured" });
  }
  if (secret) {
    if (clientIp(req) !== WIRE_WEBHOOK_IP) return res.status(403).json({ error: "Forbidden" });
    if (!verifyWireSignature(rawBody, (req.headers["wirepayment-signature"] as string) || null, secret))
      return res.status(400).json({ error: "Invalid signature" });
  }
  let event: any;
  try { event = JSON.parse(rawBody); } catch { return res.json({ received: true }); }
  if (event?.type === "payment_intent.succeeded") {
    const intentId = (event.data?.object ?? event.data)?.id;
    if (intentId) { try { await settle(intentId); } catch (e: any) { console.error("webhook settle:", e.message); } }
  }
  res.json({ received: true });
}
