import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { shipOrder } from "../../../../../lib/fulfillment";

// POST /admin/fulfillment/:id/ship  { tracking_number?, tracking_url? }
// Ship the order's fulfillments (emits shipment.created → "shipped" email).
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const body = (req.body as any) || {};
  try {
    const r = await shipOrder(req.scope, id, {
      tracking_number: body.tracking_number,
      tracking_url: body.tracking_url,
    });
    if (r.shipped === 0) {
      res.status(400).json({ message: r.reason === "not_fulfilled" ? "Эхлээд биелүүлнэ үү" : "Илгээх зүйл алга" });
      return;
    }
    res.json({ shipped: r.shipped });
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Илгээх үед алдаа гарлаа" });
  }
}
