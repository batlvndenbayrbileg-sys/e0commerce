// Storefront → Express Wire gateway (/api/* is rewritten to the Express API).

export type IntentResponse = { intentId: string; checkoutUrl: string; live: boolean };
// "review" = Wire captured the payment but the order couldn't be finalized
// (e.g. an item sold out during payment); the customer is not charged twice and
// the team is alerted to reconcile. The storefront shows a reassuring message.
export type IntentStatus = { status: "pending" | "succeeded" | "review"; order: { id: string; total: number; email: string; estimatedDelivery: string } | null };

export const wire = {
  createIntent: async (input: {
    cartId: string; amount: number; email: string;
    shippingMethod: "standard" | "express";
  }): Promise<IntentResponse> => {
    const r = await fetch("/api/payments/intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...input, origin: window.location.origin }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Payment could not be started");
    return d.data;
  },
  status: async (intentId: string): Promise<IntentStatus> => {
    const r = await fetch(`/api/payments/intent?id=${encodeURIComponent(intentId)}`, { cache: "no-store" });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Could not verify payment");
    return d.data;
  },
};
