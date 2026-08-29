import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

// Sales reporting (spec A-24/25/26). Revenue = Σ (unit_price × quantity) from
// line items (same basis as the analytics dashboard). MNT prices are VAT-
// inclusive (Mongolia, 10%), so VAT and net are extracted from the gross.

export const VAT_RATE = 0.1;
const MAX_SCAN = 20000;
const PAGE = 500;

export type SalesReport = {
  from: string | null;
  to: string | null;
  totals: { revenue: number; orders: number; aov: number; net: number; vat: number };
  daily: { date: string; revenue: number; orders: number }[];
  byCategory: { name: string; revenue: number; qty: number }[];
  byProduct: { name: string; revenue: number; qty: number }[];
  scanned: number;
  capped: boolean;
};

// productId → category name (first category), for the by-category breakdown.
async function productCategoryMap(scope: { resolve: (k: any) => any }) {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY);
  const map = new Map<string, string>();
  for (let skip = 0; skip < 50000; skip += 1000) {
    const { data } = await query.graph({
      entity: "product",
      fields: ["id", "categories.name"],
      pagination: { take: 1000, skip },
    });
    const batch = (data || []) as any[];
    for (const p of batch) map.set(p.id, (p.categories?.[0]?.name as string) || "Ангилалгүй");
    if (batch.length < 1000) break;
  }
  return map;
}

export async function salesReport(
  scope: { resolve: (k: any) => any },
  fromISO?: string,
  toISO?: string,
): Promise<SalesReport> {
  const orderModule = scope.resolve(Modules.ORDER);
  const from = fromISO ? new Date(fromISO) : null;
  const to = toISO ? new Date(toISO) : null;
  if (to) to.setHours(23, 59, 59, 999);

  const catMap = await productCategoryMap(scope);

  const daily = new Map<string, { revenue: number; orders: number }>();
  const byCat = new Map<string, { revenue: number; qty: number }>();
  const byProd = new Map<string, { revenue: number; qty: number }>();
  let revenue = 0;
  let orders = 0;
  let scanned = 0;
  let capped = false;

  for (let skip = 0; skip < MAX_SCAN; skip += PAGE) {
    const batch: any[] = await orderModule.listOrders(
      {},
      { take: PAGE, skip, order: { created_at: "DESC" } as any, relations: ["items"] as any,
        select: ["id", "created_at"] as any },
    );
    for (const o of batch) {
      const created = new Date(o.created_at);
      if (from && created < from) continue;
      if (to && created > to) continue;
      scanned++;
      const day = created.toISOString().slice(0, 10);
      let orderRev = 0;
      for (const it of o.items || []) {
        const sub = Math.round(Number(it.unit_price || 0) * Number(it.quantity || 0));
        const qty = Number(it.quantity || 0);
        orderRev += sub;
        const pname = it.product_title || it.title || "Бараа";
        const pAgg = byProd.get(pname) || { revenue: 0, qty: 0 };
        pAgg.revenue += sub; pAgg.qty += qty; byProd.set(pname, pAgg);
        const cname = it.product_id ? (catMap.get(it.product_id) || "Ангилалгүй") : "Ангилалгүй";
        const cAgg = byCat.get(cname) || { revenue: 0, qty: 0 };
        cAgg.revenue += sub; cAgg.qty += qty; byCat.set(cname, cAgg);
      }
      const d = daily.get(day) || { revenue: 0, orders: 0 };
      d.revenue += orderRev; d.orders += 1; daily.set(day, d);
      revenue += orderRev; orders++;
    }
    if (batch.length < PAGE) break;
    if (skip + PAGE >= MAX_SCAN) capped = true;
  }

  const net = Math.round(revenue / (1 + VAT_RATE));
  const vat = revenue - net;

  return {
    from: from ? from.toISOString().slice(0, 10) : null,
    to: to ? to.toISOString().slice(0, 10) : null,
    totals: { revenue, orders, aov: orders ? Math.round(revenue / orders) : 0, net, vat },
    daily: [...daily.entries()].map(([date, v]) => ({ date, ...v })).sort((a, b) => a.date.localeCompare(b.date)),
    byCategory: [...byCat.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue),
    byProduct: [...byProd.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 50),
    scanned,
    capped,
  };
}
