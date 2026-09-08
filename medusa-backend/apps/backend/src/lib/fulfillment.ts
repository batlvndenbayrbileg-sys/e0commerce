import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createOrderFulfillmentWorkflow,
  createOrderShipmentWorkflow,
  markOrderFulfillmentAsDeliveredWorkflow,
  createReservationsWorkflow,
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

// Reserve stock for an order's inventory-managed line items (linked by
// line_item_id) so createOrderFulfillmentWorkflow can consume the reservation.
// Direct orders (e.g. offline sales) have no reservations otherwise. Unmanaged
// variants need none and are skipped. Returns how many reservations were made.
export async function reserveOrderItems(scope: OrderScope, orderId: string): Promise<{ reserved: number }> {
  const orderModule = scope.resolve(Modules.ORDER);
  const stockLocationModule = scope.resolve(Modules.STOCK_LOCATION);
  const query = scope.resolve(ContainerRegistrationKeys.QUERY);
  const [location] = await stockLocationModule.listStockLocations({});
  if (!location) return { reserved: 0 };

  const order = await orderModule.retrieveOrder(orderId, { relations: ["items"] });
  const lineItems = (order.items || []).filter((i: any) => i.variant_id);
  if (!lineItems.length) return { reserved: 0 };

  const wanted = new Set(lineItems.map((i: any) => i.variant_id));
  const invByVariant = new Map<string, string>();
  for (let skip = 0; ; skip += 500) {
    const { data } = await query.graph({
      entity: "variant",
      fields: ["id", "manage_inventory", "inventory_items.inventory_item_id"],
      pagination: { skip, take: 500 },
    });
    for (const v of data as any[]) {
      if (!wanted.has(v.id) || !v.manage_inventory) continue;
      const iid = (v.inventory_items || [])[0]?.inventory_item_id;
      if (iid) invByVariant.set(v.id, iid);
    }
    if (data.length < 500) break;
  }

  const reservations = lineItems
    .filter((i: any) => invByVariant.has(i.variant_id))
    .map((i: any) => ({
      line_item_id: i.id,
      inventory_item_id: invByVariant.get(i.variant_id)!,
      location_id: location.id,
      quantity: i.quantity,
    }));
  if (!reservations.length) return { reserved: 0 };
  await createReservationsWorkflow(scope as any).run({ input: { reservations } });
  return { reserved: reservations.length };
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
