import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { parseCsv, importProductsFromRows } from "../../../../lib/catalog";

// POST /admin/catalog/import  { csv: string }
// Bulk-import products from CSV pasted/uploaded in the admin. Idempotent
// (existing handles skipped). Columns: handle,title,price,category,sizes,image,description
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const csv = (req.body as any)?.csv;
  if (!csv || typeof csv !== "string") {
    res.status(400).json({ message: "Body must include a 'csv' string." });
    return;
  }
  let rows;
  try {
    rows = parseCsv(csv);
  } catch (e: any) {
    res.status(400).json({ message: `CSV parse failed: ${e.message}` });
    return;
  }
  if (!rows.length) {
    res.status(400).json({ message: "No data rows found in CSV." });
    return;
  }
  try {
    const result = await importProductsFromRows(req.scope, rows);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ message: e.message || "Import failed" });
  }
}
