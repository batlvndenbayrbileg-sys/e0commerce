import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { aggregateByCustomer, segmentOf, SEGMENT_LABEL } from "../../../../lib/crm";
import { csvCell } from "../../../../lib/csv";

// GET /admin/crm/export — CSV of all customers with LTV, orders, last order and
// segment (spec A-18). Guarded by customers.read.

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const customerModule = req.scope.resolve(Modules.CUSTOMER);
  const now = Date.now();
  const agg = await aggregateByCustomer(req.scope);

  const customers: any[] = await customerModule.listCustomers(
    {},
    { take: 5000, order: { created_at: "DESC" } as any,
      select: ["id", "email", "first_name", "last_name", "created_at", "has_account", "metadata"] as any },
  );

  const rows = customers.map((c) => {
    const a = agg.get(c.id);
    return {
      email: c.email,
      name: [c.first_name, c.last_name].filter(Boolean).join(" "),
      account: c.has_account ? "yes" : "guest",
      ltv: a?.ltv || 0,
      orders: a?.orders || 0,
      last_order: a?.lastOrder ? new Date(a.lastOrder).toISOString().slice(0, 10) : "",
      segment: SEGMENT_LABEL[segmentOf(a, c.created_at, now)],
      registered: new Date(c.created_at).toISOString().slice(0, 10),
      note: (c.metadata as any)?.note || "",
    };
  });
  rows.sort((x, y) => y.ltv - x.ltv);

  const header = ["email", "name", "account", "ltv_mnt", "orders", "last_order", "segment", "registered", "note"];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push([r.email, r.name, r.account, r.ltv, r.orders, r.last_order, r.segment, r.registered, r.note].map(csvCell).join(","));
  }
  const csv = "﻿" + lines.join("\n"); // BOM so Excel reads UTF-8 (Cyrillic)

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="naran-customers.csv"');
  res.send(csv);
}
