import { Modules } from "@medusajs/framework/utils";

// CRM aggregation for the admin customer view (spec A3 / A-17, A-18).
// LTV = Σ (unit_price × quantity) across the customer's orders — computed from
// line items (same basis as the analytics dashboard). Segments are derived, not
// stored, so they stay correct without a maintenance job.

export const VIP_LTV = 500_000; // ₮ lifetime spend to count as VIP
export const NEW_DAYS = 30; // account younger than this = "new"
export const INACTIVE_DAYS = 90; // no order in this many days = "inactive"

const MAX_SCAN = 5000;
const PAGE = 500;
const DAY = 86_400_000;

export type Agg = { ltv: number; orders: number; lastOrder: number | null };
export type Segment = "vip" | "new" | "active" | "inactive" | "none";

// Aggregate every (bounded) order by customer_id.
export async function aggregateByCustomer(scope: { resolve: (k: any) => any }) {
  const orderModule = scope.resolve(Modules.ORDER);
  const map = new Map<string, Agg>();
  for (let skip = 0; skip < MAX_SCAN; skip += PAGE) {
    const orders: any[] = await orderModule.listOrders(
      {},
      { take: PAGE, skip, order: { created_at: "DESC" } as any, relations: ["items"] as any,
        select: ["id", "customer_id", "created_at"] as any },
    );
    for (const o of orders) {
      const cid = o.customer_id;
      if (!cid) continue;
      let total = 0;
      for (const it of o.items || []) total += Math.round(Number(it.unit_price || 0) * Number(it.quantity || 0));
      const a = map.get(cid) || { ltv: 0, orders: 0, lastOrder: null };
      a.ltv += total;
      a.orders += 1;
      const t = new Date(o.created_at).getTime();
      if (a.lastOrder === null || t > a.lastOrder) a.lastOrder = t;
      map.set(cid, a);
    }
    if (orders.length < PAGE) break;
  }
  return map;
}

// Derive a customer's segment from aggregate + account age. `now` is passed in
// (Date.now is fine in route handlers; kept a param for testability).
export function segmentOf(agg: Agg | undefined, createdAt: string | Date, now: number): Segment {
  const created = new Date(createdAt).getTime();
  if ((agg?.ltv || 0) >= VIP_LTV) return "vip";
  if (now - created <= NEW_DAYS * DAY) return "new";
  if (!agg || agg.orders === 0) return "none";
  if (agg.lastOrder != null && now - agg.lastOrder > INACTIVE_DAYS * DAY) return "inactive";
  return "active";
}

export const SEGMENT_LABEL: Record<Segment, string> = {
  vip: "VIP",
  new: "Шинэ",
  active: "Идэвхтэй",
  inactive: "Идэвхгүй",
  none: "Захиалгагүй",
};
