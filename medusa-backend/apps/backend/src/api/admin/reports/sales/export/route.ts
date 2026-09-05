import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { salesReport } from "../../../../../lib/reports";
import { csvCell as cell } from "../../../../../lib/csv";

// GET /admin/reports/sales/export?from=&to=&type=daily|category|product|vat
// CSV export of a sales-report section (spec A-26). Guarded by reports.read.

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const from = (req.query.from as string) || undefined;
  const to = (req.query.to as string) || undefined;
  const type = (req.query.type as string) || "daily";
  const r = await salesReport(req.scope, from, to);

  let header: string[] = [];
  let rows: any[][] = [];
  if (type === "category") {
    header = ["category", "revenue_mnt", "qty"];
    rows = r.byCategory.map((x) => [x.name, x.revenue, x.qty]);
  } else if (type === "product") {
    header = ["product", "revenue_mnt", "qty"];
    rows = r.byProduct.map((x) => [x.name, x.revenue, x.qty]);
  } else if (type === "vat") {
    header = ["metric", "amount_mnt"];
    rows = [
      ["gross_incl_vat", r.totals.revenue],
      ["net", r.totals.net],
      ["vat_10pct", r.totals.vat],
      ["orders", r.totals.orders],
    ];
  } else {
    header = ["date", "revenue_mnt", "orders"];
    rows = r.daily.map((x) => [x.date, x.revenue, x.orders]);
  }

  const csv = "﻿" + [header.join(","), ...rows.map((row) => row.map(cell).join(","))].join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="naran-sales-${type}.csv"`);
  res.send(csv);
}
