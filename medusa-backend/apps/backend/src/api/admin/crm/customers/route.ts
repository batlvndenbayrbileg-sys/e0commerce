import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { aggregateByCustomer, segmentOf, Segment } from "../../../../lib/crm";

// GET /admin/crm/customers?segment=&q=&limit=&offset=
// Customer list enriched with LTV, order count, last order and derived segment.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const customerModule = req.scope.resolve(Modules.CUSTOMER);
  const q = ((req.query.q as string) || "").trim().toLowerCase();
  const segment = (req.query.segment as string) || "";
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const offset = Number(req.query.offset) || 0;
  const now = Date.now();

  const agg = await aggregateByCustomer(req.scope);

  // Pull a bounded set of customers, enrich, then filter/sort/paginate in code
  // (segment + LTV are computed, so they can't be pushed into the DB query).
  const customers: any[] = await customerModule.listCustomers(
    {},
    { take: 2000, order: { created_at: "DESC" } as any,
      select: ["id", "email", "first_name", "last_name", "created_at", "has_account", "metadata"] as any },
  );

  let rows = customers.map((c) => {
    const a = agg.get(c.id);
    const seg = segmentOf(a, c.created_at, now);
    return {
      id: c.id,
      email: c.email,
      name: [c.first_name, c.last_name].filter(Boolean).join(" ") || "—",
      has_account: !!c.has_account,
      created_at: c.created_at,
      ltv: a?.ltv || 0,
      orders: a?.orders || 0,
      last_order: a?.lastOrder ? new Date(a.lastOrder).toISOString() : null,
      segment: seg as Segment,
      note: (c.metadata as any)?.note || "",
    };
  });

  if (q) rows = rows.filter((r) => r.email?.toLowerCase().includes(q) || r.name.toLowerCase().includes(q));
  if (segment) rows = rows.filter((r) => r.segment === segment);
  rows.sort((a, b) => b.ltv - a.ltv);

  const count = rows.length;
  const page = rows.slice(offset, offset + limit);

  // Segment tallies over the full (filtered-by-q) set for the summary chips.
  const tally: Record<string, number> = { vip: 0, new: 0, active: 0, inactive: 0, none: 0 };
  for (const r of rows) tally[r.segment] = (tally[r.segment] || 0) + 1;

  res.json({ customers: page, count, limit, offset, tally });
}
