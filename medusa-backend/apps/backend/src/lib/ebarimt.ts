// e-Barimt (Mongolian VAT receipt, ҮТЕГ) — SCAFFOLD.
//
// Real integration requires: the company to be a registered VAT payer, ҮТЕГ POS
// API (posapi) access, and merchant credentials (see open question Q-03). This
// module builds the receipt (10% VAT breakdown) and, when EBARIMT_URL is set,
// POSTs it to the posapi; otherwise it runs in MOCK mode (logs + returns a
// placeholder reference) so the order flow is never blocked.
const VAT_RATE = 0.1;
const ENABLED = !!process.env.EBARIMT_URL;

export type EbarimtLine = { name: string; quantity: number; unitPrice: number };
export type EbarimtReceipt = {
  status: "issued" | "mock" | "failed";
  id?: string;      // receipt id / lottery (ddtd) from ҮТЕГ
  qrData?: string;
  totalAmount: number;
  vatAmount: number;
  raw?: unknown;
};

// VAT is included in the ₮ price (Mongolia). Extract the VAT portion.
export function vatBreakdown(totalInclVat: number) {
  const vat = Math.round(totalInclVat - totalInclVat / (1 + VAT_RATE));
  return { total: Math.round(totalInclVat), vat, net: Math.round(totalInclVat) - vat };
}

export async function createEbarimtReceipt(input: {
  orderDisplayId: string;
  lines: EbarimtLine[];
  customerTin?: string; // optional buyer register (for B2B receipts)
}): Promise<EbarimtReceipt> {
  const total = input.lines.reduce((a, l) => a + l.unitPrice * l.quantity, 0);
  const { vat } = vatBreakdown(total);

  if (!ENABLED) {
    // eslint-disable-next-line no-console
    console.log(`[ebarimt mock] order ${input.orderDisplayId}: total ₮${total}, VAT ₮${vat} (set EBARIMT_URL to issue for real)`);
    return { status: "mock", id: `MOCK-${input.orderDisplayId}`, totalAmount: total, vatAmount: vat };
  }

  // Real posapi call (shape depends on the ҮТЕГ posapi version deployed on the
  // merchant's machine; adjust the body to the account's spec).
  try {
    const body = {
      merchantTin: process.env.EBARIMT_MERCHANT_TIN,
      type: input.customerTin ? "B2B_RECEIPT" : "B2C_RECEIPT",
      customerTin: input.customerTin,
      totalAmount: total,
      totalVAT: vat,
      districtCode: process.env.EBARIMT_DISTRICT_CODE,
      items: input.lines.map(l => ({ name: l.name, qty: l.quantity, unitPrice: l.unitPrice, totalAmount: l.unitPrice * l.quantity })),
    };
    const res = await fetch(process.env.EBARIMT_URL!, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`posapi ${res.status}: ${await res.text()}`);
    const data: any = await res.json();
    return { status: "issued", id: data.id ?? data.billId ?? data.ddtd, qrData: data.qrData, totalAmount: total, vatAmount: vat, raw: data };
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error(`[ebarimt] failed for order ${input.orderDisplayId}:`, e.message);
    return { status: "failed", totalAmount: total, vatAmount: vat };
  }
}
