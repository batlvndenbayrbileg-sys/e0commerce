import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

// GET /store/return-options
// Lists return shipping options (is_return=true) so the storefront can request
// a return without first building a cart. Public (publishable-key) read.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const fulfillment = req.scope.resolve(Modules.FULFILLMENT);
  const options = await fulfillment.listShippingOptions(
    {},
    { select: ["id", "name"], relations: ["rules"] } as any,
  );
  const returnOptions = (options as any[])
    .filter(o => (o.rules || []).some((r: any) => r.attribute === "is_return" && String(r.value) === "true"))
    .map(o => ({ id: o.id, name: o.name }));
  res.json({ return_options: returnOptions });
}
