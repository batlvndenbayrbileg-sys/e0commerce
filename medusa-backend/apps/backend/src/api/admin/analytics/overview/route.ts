import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

// GET /admin/analytics/overview — sales KPIs, top products, recent orders.
// Revenue = product sales (Σ unit_price × quantity). We compute from line items
// rather than order.total because loading order totals via the module/graph
// requires shipping-method versions; the item subtotal is reliable and is the
// meaningful "product revenue" for a dashboard. Scans up to MAX_SCAN orders.
const MAX_SCAN = 5000;
const PAGE = 500;

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const orderModule = req.scope.resolve(Modules.ORDER);
  const customerModule = req.scope.resolve(Modules.CUSTOMER);

  const [, orderCount] = await orderModule.listAndCountOrders({}, { take: 1, select: ["id"] as any });

  let customerCount = 0;
  try {
    const [, c] = await customerModule.listAndCountCustomers({}, { take: 1, select: ["id"] as any });
    customerCount = c;
  } catch { /* optional */ }

  let revenue = 0;
  let scanned = 0;
  const productAgg = new Map<string, { qty: number; revenue: number }>();
  const recent: { id: string; email: string; total: number; date: string }[] = [];

  for (let skip = 0; skip < MAX_SCAN; skip += PAGE) {
    const orders: any[] = await orderModule.listOrders(
      {},
      { take: PAGE, skip, order: { created_at: "DESC" } as any, relations: ["items"] as any,
        select: ["id", "display_id", "email", "created_at"] as any },
    );
    for (const o of orders) {
      let orderRev = 0;
      for (const it of o.items || []) {
        const sub = Math.round(Number(it.unit_price || 0) * Number(it.quantity || 0));
        orderRev += sub;
        const key = it.product_title || it.title || "Бараа";
        const a = productAgg.get(key) || { qty: 0, revenue: 0 };
        a.qty += Number(it.quantity || 0);
        a.revenue += sub;
        productAgg.set(key, a);
      }
      revenue += orderRev;
      scanned++;
      if (recent.length < 8) {
        recent.push({ id: o.display_id ? `NT-${o.display_id}` : o.id, email: o.email, total: orderRev, date: o.created_at });
      }
    }
    if (orders.length < PAGE) break;
  }

  const topProducts = [...productAgg.entries()]
    .map(([name, v]) => ({ name, qty: v.qty, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  res.json({
    orders: orderCount,
    customers: customerCount,
    revenue: Math.round(revenue),
    avgOrder: scanned ? Math.round(revenue / scanned) : 0,
    scanned,
    capped: orderCount > scanned,
    topProducts,
    recent,
  });
}
