import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { deliverOrder } from "../../../../../lib/fulfillment";

// POST /admin/fulfillment/:id/deliver — mark the order's shipped fulfillments
// as delivered (spec A-07).
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  try {
    const r = await deliverOrder(req.scope, id);
    if (r.delivered === 0) {
      res.status(400).json({ message: "Хүргэх зүйл алга (эхлээд илгээнэ үү)" });
      return;
    }
    res.json({ delivered: r.delivered });
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Хүргэлт тэмдэглэх үед алдаа гарлаа" });
  }
}
