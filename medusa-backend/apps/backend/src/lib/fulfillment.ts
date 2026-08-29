import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createOrderFulfillmentWorkflow,
  createOrderShipmentWorkflow,
  markOrderFulfillmentAsDeliveredWorkflow,
} from "@medusajs/medusa/core-flows";

// Shared helpers for the admin fulfillment queue (spec A1 / A-05..A-07).
// Fulfillment lifecycle: not_fulfilled → (fulfill) → fulfilled → (ship) →
// shipped → (deliver) → delivered.

export type OrderScope = { resolve: (k: any) => any };

// Fulfillments linked to an order (id + lifecycle timestamps), via query graph.
export async function fulfillmentsOfOrder(scope: OrderScope, orderId: string) {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY);
  const { data } = await query.graph({
    entity: "order",
    fields: [
      "fulfillments.id",
      "fulfillments.shipped_at",
      "fulfillments.delivered_at",
      "fulfillments.canceled_at",
    ],
    filters: { id: orderId },
  });
  return ((data?.[0] as any)?.fulfillments || []) as any[];
}

// Line items (id + quantity) for a fulfillment/shipment workflow.
export async function orderItems(scope: OrderScope, orderId: string) {
  const orderModule = scope.resolve(Modules.ORDER);
  const order = await orderModule.retrieveOrder(orderId, { relations: ["items"] });
  return (order.items || []).map((i: any) => ({ id: i.id, quantity: i.quantity }));
}

// Create a fulfillment for every line item of the order (idempotent-ish: skips
// if the order already has a non-canceled fulfillment).
export async function fulfillOrder(scope: OrderScope, orderId: string) {
  const existing = (await fulfillmentsOfOrder(scope, orderId)).filter((f) => !f.canceled_at);
  if (existing.length) return { fulfilled: false, reason: "already_fulfilled" };
  const items = await orderItems(scope, orderId);
  if (!items.length) return { fulfilled: false, reason: "no_items" };
  await createOrderFulfillmentWorkflow(scope as any).run({ input: { order_id: orderId, items } });
  return { fulfilled: true };
}

// Ship every not-yet-shipped fulfillment of the order, attaching tracking (if any).
export async function shipOrder(
  scope: OrderScope,
  orderId: string,
  tracking?: { tracking_number?: string; tracking_url?: string },
) {
  const fulfillments = (await fulfillmentsOfOrder(scope, orderId)).filter((f) => !f.canceled_at);
  if (!fulfillments.length) return { shipped: 0, reason: "not_fulfilled" };
  const items = await orderItems(scope, orderId);
  const labels =
    tracking?.tracking_number || tracking?.tracking_url
      ? [{ tracking_number: tracking?.tracking_number || "", tracking_url: tracking?.tracking_url || "", label_url: "" }]
      : undefined;
  let shipped = 0;
  for (const ful of fulfillments) {
    if (ful.shipped_at) continue;
    await createOrderShipmentWorkflow(scope as any).run({
      input: { order_id: orderId, fulfillment_id: ful.id, items, labels },
    });
    shipped++;
  }
  return { shipped };
}

// Mark every shipped-not-delivered fulfillment of the order as delivered.
export async function deliverOrder(scope: OrderScope, orderId: string) {
  const fulfillments = (await fulfillmentsOfOrder(scope, orderId)).filter((f) => !f.canceled_at);
  let delivered = 0;
  for (const ful of fulfillments) {
    if (ful.delivered_at) continue;
    await markOrderFulfillmentAsDeliveredWorkflow(scope as any).run({
      input: { orderId, fulfillmentId: ful.id },
    });
    delivered++;
  }
  return { delivered };
}
