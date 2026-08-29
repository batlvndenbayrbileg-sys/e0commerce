import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { fulfillOrder } from "../../../../lib/fulfillment";

// POST /admin/fulfillment/batch  { order_ids: string[] }
// Batch-fulfill orders (create a fulfillment for every line item). Reports per
// order so a partial failure does not abort the batch (spec AN-06).
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const orderIds = (req.body as any)?.order_ids;
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    res.status(400).json({ message: "order_ids шаардлагатай" });
    return;
  }
  const results: { id: string; ok: boolean; reason?: string }[] = [];
  for (const id of orderIds) {
    try {
      const r = await fulfillOrder(req.scope, id);
      results.push({ id, ok: r.fulfilled, reason: r.reason });
    } catch (e: any) {
      results.push({ id, ok: false, reason: e?.message || "error" });
    }
  }
  const fulfilled = results.filter((r) => r.ok).length;
  res.json({ fulfilled, failed: results.length - fulfilled, results });
}
