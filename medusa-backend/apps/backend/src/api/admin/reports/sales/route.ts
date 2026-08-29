import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { salesReport } from "../../../../lib/reports";

// GET /admin/reports/sales?from=YYYY-MM-DD&to=YYYY-MM-DD
// Sales report: totals (incl. VAT breakdown), daily trend, by category, by
// product. Guarded by reports.read.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const from = (req.query.from as string) || undefined;
  const to = (req.query.to as string) || undefined;
  res.json(await salesReport(req.scope, from, to));
}
