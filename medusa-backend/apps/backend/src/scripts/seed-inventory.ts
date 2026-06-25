import { ExecArgs } from "@medusajs/framework/types";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  updateProductVariantsWorkflow,
  createInventoryItemsWorkflow,
  createInventoryLevelsWorkflow,
} from "@medusajs/medusa/core-flows";

const STOCK = 25; // starting stock per variant

export default async function seedInventory({ container }: ExecArgs) {
  const logger = container.resolve("logger");
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION);
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL);

  const [location] = await stockLocationModule.listStockLocations({});
  if (!location) throw new Error("No stock location found");

  // Link Default Sales Channel ↔ stock location (required for inventory_quantity in store API)
  const [sc] = await salesChannelModule.listSalesChannels({ name: "Default Sales Channel" });
  if (sc) {
    try {
      await link.create({
        [Modules.SALES_CHANNEL]: { sales_channel_id: sc.id },
        [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      });
      logger.info("Linked sales channel ↔ stock location");
    } catch {
      logger.info("Sales channel ↔ stock location already linked");
    }
  }

  // All variants + any existing inventory link
  const { data: variants } = await query.graph({
    entity: "variant",
    fields: ["id", "sku", "inventory_items.inventory_item_id"],
  });
  logger.info(`Found ${variants.length} variants`);

  // 1) Enable manage_inventory on every variant
  await updateProductVariantsWorkflow(container).run({
    input: { product_variants: variants.map((v: any) => ({ id: v.id, manage_inventory: true })) },
  });
  logger.info("manage_inventory enabled");

  // 2) Create inventory items for variants without one, and link variant ↔ item
  const needItem = variants.filter((v: any) => !v.inventory_items?.length);
  if (needItem.length) {
    const { result } = await createInventoryItemsWorkflow(container).run({
      input: { items: needItem.map((v: any) => ({ sku: v.sku, title: v.sku })) },
    });
    const links = needItem.map((v: any, i: number) => ({
      [Modules.PRODUCT]: { variant_id: v.id },
      [Modules.INVENTORY]: { inventory_item_id: result[i].id },
    }));
    await link.create(links);
    logger.info(`Created + linked ${result.length} inventory items`);
  } else {
    logger.info("All variants already have inventory items");
  }

  // 3) Collect all inventory item ids, set stock levels at the location
  const { data: variants2 } = await query.graph({
    entity: "variant",
    fields: ["id", "inventory_items.inventory_item_id"],
  });
  const itemIds = new Set<string>();
  for (const v of variants2 as any[]) {
    for (const ii of v.inventory_items || []) {
      if (ii.inventory_item_id) itemIds.add(ii.inventory_item_id);
    }
  }

  // Skip items that already have a level at this location
  const { data: existingLevels } = await query.graph({
    entity: "inventory_level",
    fields: ["inventory_item_id"],
    filters: { location_id: location.id },
  });
  const have = new Set((existingLevels as any[]).map(l => l.inventory_item_id));

  const levels = [...itemIds].filter(id => !have.has(id)).map(id => ({
    inventory_item_id: id, location_id: location.id, stocked_quantity: STOCK,
  }));
  if (levels.length) {
    await createInventoryLevelsWorkflow(container).run({ input: { inventory_levels: levels } });
  }
  logger.info(`Set stock ${STOCK} on ${levels.length} inventory items. Inventory ready.`);
}
