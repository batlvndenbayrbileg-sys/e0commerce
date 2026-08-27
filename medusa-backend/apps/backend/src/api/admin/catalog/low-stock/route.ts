import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { lowStockVariants } from "../../../../lib/catalog";

// GET /admin/catalog/low-stock?threshold=5 — inventory-managed variants at or
// below the threshold, lowest first.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const threshold = Math.max(0, Number((req.query as any)?.threshold ?? 5) || 5);
  const rows = await lowStockVariants(req.scope, threshold);
  res.json({ threshold, count: rows.length, variants: rows });
}
