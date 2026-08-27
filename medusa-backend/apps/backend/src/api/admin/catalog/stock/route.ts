import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { parseCsv, setStockFromRows } from "../../../../lib/catalog";

// POST /admin/catalog/stock  { csv: string }
// Bulk-set stock. CSV columns: handle,stock (all variants) OR sku,stock (one).
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const csv = (req.body as any)?.csv;
  if (!csv || typeof csv !== "string") {
    res.status(400).json({ message: "Body must include a 'csv' string." });
    return;
  }
  const rows = parseCsv(csv).filter(r => (r.handle || r.sku) && r.stock !== undefined && r.stock !== "");
  if (!rows.length) {
    res.status(400).json({ message: "No rows with (handle|sku) + stock found." });
    return;
  }
  try {
    const result = await setStockFromRows(req.scope, rows);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ message: e.message || "Stock update failed" });
  }
}
