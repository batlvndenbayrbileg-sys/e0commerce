import { randomUUID, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Wire Payment client (https://wire.mn) — QPay + Mongolian bank apps.
 * Same model as Stripe: PaymentIntent → Hosted Checkout → Webhook.
 * No WIRE_SECRET_KEY → MOCK mode (auto-succeeds after 5s) for dev/demo.
 */

const BASE = "https://api.wire.mn/v1";
const KEY = process.env.WIRE_SECRET_KEY;
export const WIRE_LIVE = !!KEY;
export const WIRE_TEST_MODE = KEY?.startsWith("sk_test_") ?? false;
const ALLOWED_OPERATORS = WIRE_TEST_MODE ? ["sandbox"] : ["qpay"];
export const WIRE_WEBHOOK_IP = "65.109.117.186";
const MOCK_DELAY_MS = 5000;

type Json = Record<string, any>;

async function wireFetch<T>(path: string, init: any = {}): Promise<T> {
  const headers: Record<string, string> = { Authorization: `Bearer ${KEY}` };
  let body: string | undefined;
  if (init.json) { headers["Content-Type"] = "application/json"; body = JSON.stringify(init.json); }
  if (init.idempotencyKey) headers["Idempotency-Key"] = init.idempotencyKey;
  const res = await fetch(`${BASE}${path}`, { ...init, body, headers, cache: "no-store" } as any);
  const data: any = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error?.message || `Wire failed (${res.status})`);
  return data as T;
}

/* ---------- MOCK helpers ---------- */
function mockIntent(amount: number, metadata: Json) {
  const id = `pi_mock_${Date.now()}_${randomUUID().slice(0, 8)}`;
  return { id, status: "requires_payment", amount, currency: "MNT", metadata,
    qr_text: "0002010102...mockQPay", created: Date.now() };
}
function mockStatusFromId(id: string): string {
  const ts = Number(id.split("_")[2]);
  if (!ts) return "requires_payment";
  return Date.now() - ts > MOCK_DELAY_MS ? "succeeded" : "requires_payment";
}

/* ---------- API ---------- */
export async function createPaymentIntent(opts: { amount: number; metadata?: Json; idempotencyKey: string }) {
  if (!WIRE_LIVE) return mockIntent(opts.amount, opts.metadata ?? {});
  return wireFetch<Json>("/payment_intents", {
    method: "POST", idempotencyKey: opts.idempotencyKey,
    json: { amount: opts.amount, currency: "MNT", allowed_operators: ALLOWED_OPERATORS, metadata: opts.metadata ?? {} },
  });
}

export async function getPaymentIntent(id: string): Promise<Json> {
  if (!WIRE_LIVE) return { id, status: mockStatusFromId(id) };
  return wireFetch<Json>(`/payment_intents/${id}`, { method: "GET" });
}

export async function createCheckoutSession(opts: { paymentIntentId: string; successUrl?: string; idempotencyKey: string }) {
  if (!WIRE_LIVE) return { id: `cs_mock_${randomUUID()}`, url: "", payment_intent: opts.paymentIntentId };
  return wireFetch<Json>("/checkout/sessions", {
    method: "POST", idempotencyKey: opts.idempotencyKey,
    json: { payment_intent: opts.paymentIntentId, success_url: opts.successUrl },
  });
}

// Verify a Wire webhook signature (Stripe-style `t=<unix>,v1=<hmac>`).
// `toleranceSec` rejects stale/replayed events (default 5 min).
export function verifyWireSignature(
  rawBody: string,
  sigHeader: string | null,
  secret?: string,
  toleranceSec = 300,
): boolean {
  if (!sigHeader || !secret) return false;
  const parts = Object.fromEntries(sigHeader.split(",").map(kv => kv.split("=").map(s => s.trim())));
  const { t, v1 } = parts as any;
  if (!t || !v1) return false;
  // Replay protection: the signed timestamp must be recent.
  const ts = Number(t);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > toleranceSec) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  const a = Buffer.from(v1), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
