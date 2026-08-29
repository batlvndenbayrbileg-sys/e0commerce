import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

// POST /admin/crm/customers/:id/note  { note }
// Store a free-text support note on the customer (customer.metadata.note).
// Guarded by customers.write (see src/api/middlewares.ts).
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const note = String((req.body as any)?.note ?? "");
  const customerModule = req.scope.resolve(Modules.CUSTOMER);
  const existing: any = await customerModule.retrieveCustomer(id, { select: ["id", "metadata"] as any });
  // Customer module: updateCustomers(id, data) — two args (unlike updateUsers).
  await customerModule.updateCustomers(id, {
    metadata: { ...(existing?.metadata || {}), note },
  } as any);
  res.json({ id, note });
}
