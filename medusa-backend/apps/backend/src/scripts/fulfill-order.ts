import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import {
  createOrderFulfillmentWorkflow,
  createOrderShipmentWorkflow,
  markOrderFulfillmentAsDeliveredWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * Dev helper: fulfill → ship → deliver an order so returns can be tested/demoed.
 * (In production this happens from the admin. Returns require delivered items.)
 *
 *   ORDER_ID=order_...  npx medusa exec ./src/scripts/fulfill-order.ts
 *   (no ORDER_ID → the most recent order)
 */
export default async function fulfillOrder({ container }: ExecArgs) {
  const logger = container.resolve("logger");
  const orderModule = container.resolve(Modules.ORDER);

  let orderId = process.env.ORDER_ID;
  if (!orderId) {
    const [latest] = await orderModule.listOrders({}, { take: 1, order: { created_at: "DESC" } as any });
    orderId = latest?.id;
  }
  if (!orderId) throw new Error("No order found.");

  const order = await orderModule.retrieveOrder(orderId, { relations: ["items"] });
  const items = (order.items || []).map((i: any) => ({ id: i.id, quantity: i.quantity }));
  if (!items.length) throw new Error(`Order ${orderId} has no items.`);

  await createOrderFulfillmentWorkflow(container).run({ input: { order_id: orderId, items } });
  logger.info(`Fulfilled order ${orderId}`);

  // Re-read to get the created fulfillment id.
  const withFul = await orderModule.retrieveOrder(orderId, { relations: ["fulfillments"] });
  const ful = (withFul as any).fulfillments?.[0];
  if (ful) {
    await createOrderShipmentWorkflow(container).run({ input: { order_id: orderId, fulfillment_id: ful.id, items } });
    logger.info(`Shipped fulfillment ${ful.id}`);
    await markOrderFulfillmentAsDeliveredWorkflow(container).run({ input: { order_id: orderId, fulfillment_id: ful.id } });
    logger.info(`Delivered fulfillment ${ful.id}`);
  }
  logger.info(`Order ${orderId} is now delivered — returns can be requested.`);
}
