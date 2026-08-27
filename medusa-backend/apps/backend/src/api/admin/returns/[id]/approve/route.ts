import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { receiveAndCompleteReturnOrderWorkflow } from "@medusajs/medusa/core-flows";

// POST /admin/returns/:id/approve
// One-click approval for a customer-requested return: receives all requested
// items and completes the return (Medusa's built-in flow is multi-step).
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data } = await query.graph({
    entity: "return",
    fields: ["id", "status", "items.item_id", "items.quantity"],
    filters: { id },
  });
  const ret = data?.[0] as any;
  if (!ret) {
    res.status(404).json({ message: `Return ${id} not found` });
    return;
  }
  // Input item id must be the order line item id (return item's item_id).
  const items = (ret.items || [])
    .map((i: any) => ({ id: i.item_id as string, quantity: i.quantity as number }))
    .filter((i: any) => i.id && i.quantity > 0);
  if (!items.length) {
    res.status(400).json({ message: "Return has no receivable items" });
    return;
  }

  await receiveAndCompleteReturnOrderWorkflow(req.scope).run({
    input: { return_id: id, items },
  });

  res.json({ id, status: "received", received_items: items.length });
}
