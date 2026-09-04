import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

// GET /admin/marketing/abandoned-carts?hours=1
// Carts with items and an email that never became an order (completed_at null)
// and have been idle for at least `hours` (so a live checkout isn't listed).
// Revenue-recovery view (spec A-21). Guarded by orders.read.
const MAX_SCAN = 3000;
const PAGE = 200;

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const idleHours = Math.max(0, Number(req.query.hours) || 1);
  const cutoff = Date.now() - idleHours * 3600_000;

  const out: any[] = [];
  let scanned = 0;
  let capped = false;

  for (let skip = 0; skip < MAX_SCAN; skip += PAGE) {
    const { data } = await query.graph({
      entity: "cart",
      fields: [
        "id", "email", "created_at", "updated_at", "completed_at", "currency_code",
        "items.id", "items.title", "items.product_title", "items.quantity", "items.unit_price",
      ],
      pagination: { take: PAGE, skip, order: { updated_at: "DESC" } },
    });
    const batch = (data || []) as any[];
    for (const c of batch) {
      scanned++;
      if (c.completed_at) continue;                 // became an order
      if (!c.email) continue;                       // no way to recover
      if (!(c.items || []).length) continue;        // empty cart
      if (new Date(c.updated_at).getTime() > cutoff) continue; // still active
      const value = (c.items || []).reduce((s: number, i: any) => s + Math.round(Number(i.unit_price || 0) * Number(i.quantity || 0)), 0);
      out.push({
        id: c.id,
        email: c.email,
        updated_at: c.updated_at,
        value,
        items: (c.items || []).map((i: any) => ({
          title: i.product_title || i.title || "Бараа",
          quantity: i.quantity,
        })),
      });
    }
    if (batch.length < PAGE) break;
    if (skip + PAGE >= MAX_SCAN) capped = true;
  }

  const totalValue = out.reduce((s, c) => s + c.value, 0);
  res.json({ carts: out, count: out.length, totalValue, scanned, capped });
}
