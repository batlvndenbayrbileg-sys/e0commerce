import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createOrderWorkflow,
  createOrderPaymentCollectionWorkflow,
  markPaymentCollectionAsPaid,
} from "@medusajs/medusa/core-flows";
import { decrementStockForVariants } from "../lib/catalog";
import { fulfillOrder, shipOrder, deliverOrder } from "../lib/fulfillment";

/**
 * Smoke test for the offline-sale flow (records a REAL test order in the DB).
 * Verifies: order creation, mark-as-paid, fulfill→ship→deliver, and stock
 * decrement — the same calls the /admin/offline-sale route makes, but without
 * HTTP/auth so it can run via `npx medusa exec src/scripts/test-offline-sale.ts`.
 */
export default async function testOfflineSale({ container }: ExecArgs) {
  const log = container.resolve("logger");
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const regionModule = container.resolve(Modules.REGION);
  const scModule = container.resolve(Modules.SALES_CHANNEL);
  const orderModule = container.resolve(Modules.ORDER);

  const ok = (b: boolean) => (b ? "PASS ✅" : "FAIL ❌");

  const region = (await regionModule.listRegions({})).find((r: any) => r.currency_code === "mnt");
  if (!region) { log.error("No MNT region — run setup-mnt first."); return; }
  const salesChannelId = (await scModule.listSalesChannels({}))[0]?.id;

  // Pick a published variant with an MNT price; prefer one that manages inventory.
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id", "title", "status",
      "variants.id", "variants.title", "variants.manage_inventory",
      "variants.prices.amount", "variants.prices.currency_code",
      "variants.inventory_items.inventory.location_levels.stocked_quantity",
    ],
    filters: { status: "published" } as any,
    pagination: { take: 200, skip: 0 },
  });
  let chosen: any = null;
  for (const p of products as any[]) {
    for (const v of p.variants || []) {
      const price = (v.prices || []).find((pr: any) => pr.currency_code === "mnt")?.amount;
      if (price == null) continue;
      const cand = { product: p.title, variant_id: v.id, title: `${p.title}`, unit_price: Number(price), manage: !!v.manage_inventory };
      if (cand.manage) { chosen = cand; break; }
      if (!chosen) chosen = cand;
    }
    if (chosen?.manage) break;
  }
  if (!chosen) { log.error("No published variant with an MNT price found."); return; }
  log.info(`Test variant: ${chosen.product} (${chosen.variant_id}) @ ₮${chosen.unit_price}, manage_inventory=${chosen.manage}`);

  const stockBefore = await readStock(query, chosen.variant_id);
  const item = { variant_id: chosen.variant_id, quantity: 1, title: chosen.title, unit_price: chosen.unit_price };

  // 1) Create order
  const { result } = await createOrderWorkflow(container).run({
    input: {
      region_id: region.id, currency_code: "mnt", email: "offline-test@naran.mn",
      sales_channel_id: salesChannelId, items: [item],
      metadata: { offline: true, payment_method: "cash", test: true },
    } as any,
  });
  const orderId = (result as any)?.id;
  log.info(`1) createOrder: ${ok(!!orderId)} (id=${orderId}, total=${(result as any)?.total})`);
  if (!orderId) return;

  // 2) Mark paid
  let paid = false;
  try {
    const { result: pcs } = await createOrderPaymentCollectionWorkflow(container).run({
      input: { order_id: orderId, amount: Number((result as any)?.total) || chosen.unit_price },
    });
    const pcId = Array.isArray(pcs) ? (pcs[0] as any)?.id : (pcs as any)?.id;
    if (pcId) { await markPaymentCollectionAsPaid(container).run({ input: { payment_collection_id: pcId, order_id: orderId } }); paid = true; }
  } catch (e: any) { log.error(`  payment error: ${e?.message}`); }
  log.info(`2) markPaid: ${ok(paid)}`);

  // 3) Fulfill → ship → deliver
  let fulfilled = false;
  try {
    const f = await fulfillOrder(container as any, orderId);
    if (f.fulfilled) { await shipOrder(container as any, orderId); await deliverOrder(container as any, orderId); fulfilled = true; }
    else log.info(`  fulfillOrder skipped: ${f.reason}`);
  } catch (e: any) { log.error(`  fulfillment error: ${e?.message}`); }
  log.info(`3) fulfill→ship→deliver: ${ok(fulfilled)}`);

  // 4) Decrement stock
  let adjusted = 0;
  try { adjusted = (await decrementStockForVariants(container, [{ variant_id: chosen.variant_id, quantity: 1 }])).adjusted; }
  catch (e: any) { log.error(`  stock error: ${e?.message}`); }
  const stockAfter = await readStock(query, chosen.variant_id);
  const stockOk = !chosen.manage || stockBefore == null || stockAfter == null || stockAfter === stockBefore - 1;
  log.info(`4) decrementStock: ${ok(chosen.manage ? adjusted === 1 && stockOk : true)} (before=${stockBefore}, after=${stockAfter}, adjusted=${adjusted})`);

  // 5) Re-read order status
  try {
    const o: any = await orderModule.retrieveOrder(orderId, { select: ["id", "payment_status", "fulfillment_status", "status"] as any });
    log.info(`5) order status → payment=${o.payment_status}, fulfillment=${o.fulfillment_status}, status=${o.status}`);
  } catch (e: any) { log.error(`  status read error: ${e?.message}`); }

  log.info("Done. (A test order was created — safe to cancel/delete in the admin.)");
}

async function readStock(query: any, variantId: string): Promise<number | null> {
  try {
    const { data } = await query.graph({
      entity: "variant",
      fields: ["id", "manage_inventory", "inventory_items.inventory.location_levels.stocked_quantity"],
      filters: { id: variantId } as any,
    });
    const v = (data || [])[0];
    if (!v?.manage_inventory) return null;
    const levels = (v.inventory_items || []).flatMap((ii: any) => ii.inventory?.location_levels || []);
    return levels.reduce((a: number, l: any) => a + Number(l.stocked_quantity ?? 0), 0);
  } catch { return null; }
}
