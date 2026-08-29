import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { createEbarimtReceipt } from "../lib/ebarimt";

// On every placed order, issue an e-Barimt VAT receipt (FR-12). Runs in MOCK
// mode until EBARIMT_URL + credentials are configured (Q-03). The receipt
// reference is stored on order.metadata.ebarimt.
export default async function orderEbarimtHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderModule = container.resolve(Modules.ORDER);
  const order: any = await orderModule.retrieveOrder(data.id, {
    select: ["id", "display_id", "metadata"] as any,
    relations: ["items"] as any,
  });

  const lines = (order.items || []).map((i: any) => ({
    name: i.product_title || i.title || "Бараа",
    quantity: i.quantity,
    unitPrice: Math.round(Number(i.unit_price || 0)),
  }));
  if (!lines.length) return;

  const receipt = await createEbarimtReceipt({
    orderDisplayId: order.display_id ? `NT-${order.display_id}` : order.id,
    lines,
  });

  await orderModule.updateOrders(order.id, {
    metadata: {
      ...(order.metadata || {}),
      ebarimt: { status: receipt.status, id: receipt.id ?? null, vatAmount: receipt.vatAmount, totalAmount: receipt.totalAmount },
    },
  });
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
