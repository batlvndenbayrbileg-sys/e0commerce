import { Router, raw, type Request, type Response } from "express";
import { z } from "zod";
import {
  createPaymentIntent, getPaymentIntent, createCheckoutSession,
  verifyWireSignature, WIRE_LIVE, WIRE_WEBHOOK_IP,
} from "../lib/wire.js";
import { sendOrderConfirmation } from "../lib/email.js";

const MEDUSA_URL = process.env.MEDUSA_URL || "http://localhost:9000";
const MEDUSA_PK = process.env.MEDUSA_PK || "pk_6352a937fd8593d7cff1b41f32d7dd564df486a1b789b75533bed1abd3cf5271";

type OrderItem = { title: string; quantity: number; amount: number };
type Record = {
  cartId: string;
  amount: number;
  email: string;
  shippingMethod: "standard" | "express";
  status: "pending" | "paid";
  order?: { id: string; total: number; email: string; estimatedDelivery: string; items: OrderItem[] };
};
const intents = new Map<string, Record>();

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

async function settle(intentId: string): Promise<Record | null> {
  const rec = intents.get(intentId);
  if (!rec) return null;
  if (rec.status === "paid") return rec;
  const intent = await getPaymentIntent(intentId);
  if (intent.status === "succeeded") {
    rec.order = await completeMedusaCart(rec.cartId, rec.shippingMethod);
    rec.status = "paid";
    intents.set(intentId, rec);
    // fire-and-forget order confirmation email
    sendOrderConfirmation(rec.order).catch(() => {});
  }
  return rec;
}

const router = Router();

const intentSchema = z.object({
  cartId: z.string().min(1),
  amount: z.number().int().nonnegative(),
  email: z.string().email(),
  shippingMethod: z.enum(["standard", "express"]).default("standard"),
  origin: z.string().url().optional(),
});

// Create Wire intent + hosted checkout session
router.post("/intent", async (req, res) => {
  const parsed = intentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { cartId, amount, email, shippingMethod, origin } = parsed.data;
  try {
    const intent = await createPaymentIntent({
      amount, idempotencyKey: `cart_${cartId}`,
      metadata: { cartId, email },
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
    res.json({ data: { status: rec.status === "paid" ? "succeeded" : "pending", order: rec.order ?? null } });
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
