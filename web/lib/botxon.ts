// Storefront → Express Botxon gateway (/api/* is rewritten to the Express API).
// Botxon uses an invoice/QR model: create an invoice, render its QR + bank
// deeplinks on our own page, then poll status (the webhook settles server-side).

export type BotxonBankUrl = { name?: string; description?: string; logo?: string; link: string };
export type BotxonInvoice = {
  invoiceId: string;
  qrText: string;
  qrImage: string;
  shortUrl: string;
  urls: BotxonBankUrl[];
  live: boolean;
};
// "review" = paid but the order couldn't be finalized (e.g. sold out during
// payment); the customer isn't charged twice and the team is alerted.
export type BotxonStatus = {
  status: "pending" | "succeeded" | "review" | "failed";
  order: { id: string; total: number; email: string; estimatedDelivery: string } | null;
  invoice: Omit<BotxonInvoice, "live"> | null;
};

export const botxon = {
  createInvoice: async (input: {
    cartId: string; amount: number; email: string;
    shippingMethod: "standard" | "express"; description?: string;
  }): Promise<BotxonInvoice> => {
    const r = await fetch("/api/payments/botxon/invoice", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    const d = await r.json();
    // Prefer a human message (e.g. the out-of-stock notice) over the error code.
    if (!r.ok) throw new Error(d.message || d.error || "Payment could not be started");
    return d.data;
  },
  status: async (invoiceId: string): Promise<BotxonStatus> => {
    const r = await fetch(`/api/payments/botxon/invoice?id=${encodeURIComponent(invoiceId)}`, { cache: "no-store" });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || d.error || "Could not verify payment");
    return d.data;
  },
};
