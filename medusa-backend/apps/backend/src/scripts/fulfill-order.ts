import { ExecArgs } from "@medusajs/framework/types";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";
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

  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const order = await orderModule.retrieveOrder(orderId, { relations: ["items"] });
  const items = (order.items || []).map((i: any) => ({ id: i.id, quantity: i.quantity }));
  if (!items.length) throw new Error(`Order ${orderId} has no items.`);

  // Fulfillments are linked to the order — resolve them via the query graph.
  const fulfillmentsOf = async () => {
    const { data } = await query.graph({
      entity: "order",
      fields: ["fulfillments.id", "fulfillments.shipped_at", "fulfillments.delivered_at"],
      filters: { id: orderId },
    });
    return ((data?.[0] as any)?.fulfillments || []) as any[];
  };

  let fulfillments = await fulfillmentsOf();
  if (!fulfillments.length) {
    await createOrderFulfillmentWorkflow(container).run({ input: { order_id: orderId, items } });
    logger.info(`Fulfilled order ${orderId}`);
    fulfillments = await fulfillmentsOf();
  } else {
    logger.info(`Order ${orderId} already has ${fulfillments.length} fulfillment(s)`);
  }

  const deliver = process.env.DELIVER === "1";
  for (const ful of fulfillments) {
    if (!ful.shipped_at) {
      await createOrderShipmentWorkflow(container).run({ input: { order_id: orderId, fulfillment_id: ful.id, items } });
      logger.info(`Shipped fulfillment ${ful.id} → shipment.created emitted`);
    }
    if (deliver && !ful.delivered_at) {
      await markOrderFulfillmentAsDeliveredWorkflow(container).run({ input: { orderId, fulfillmentId: ful.id } });
      logger.info(`Delivered fulfillment ${ful.id}`);
    }
  }
  logger.info(`Done. Order ${orderId} fulfilled${deliver ? " + delivered" : " + shipped"}.`);
}
