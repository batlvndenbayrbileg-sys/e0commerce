import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

/**
 * Non-destructive: point the EXISTING store/region at Mongolia + MNT without
 * wiping any data (keeps admin users, products, orders). Idempotent.
 *
 *   npx medusa exec src/scripts/setup-mnt.ts
 */
export default async function setupMnt({ container }: ExecArgs) {
  const logger = container.resolve("logger");
  const storeModule = container.resolve(Modules.STORE);
  const regionModule = container.resolve(Modules.REGION);

  // 1) Store → name "NARAN", MNT the single default currency.
  const stores = await storeModule.listStores({});
  if (!stores.length) logger.warn("No store found.");
  for (const store of stores) {
    try {
      await storeModule.updateStores(store.id, {
        name: "NARAN",
        supported_currencies: [{ currency_code: "mnt", is_default: true }],
      });
      logger.info(`Store ${store.id}: name → NARAN, currency → MNT (default).`);
    } catch (e: any) {
      logger.error(`Store update failed: ${e.message}`);
    }
  }

  // 2) Region → a Mongolia / MNT region (convert an existing one, else create).
  const regions = await regionModule.listRegions({});
  const mnt = regions.find((r: any) => r.currency_code === "mnt");
  if (mnt) {
    logger.info(`MNT region already exists: ${mnt.id} (${mnt.name}).`);
  } else if (regions.length) {
    try {
      await regionModule.updateRegions(regions[0].id, {
        name: "Монгол",
        currency_code: "mnt",
        countries: ["mn"],
      } as any);
      logger.info(`Region ${regions[0].id}: → Монгол / MNT / mn.`);
    } catch (e: any) {
      logger.warn(`Couldn't convert existing region (${e.message}); creating a new MNT region.`);
      await regionModule.createRegions([
        { name: "Монгол", currency_code: "mnt", countries: ["mn"] } as any,
      ]);
      logger.info("Created new Монгол / MNT region.");
    }
  } else {
    await regionModule.createRegions([
      { name: "Монгол", currency_code: "mnt", countries: ["mn"] } as any,
    ]);
    logger.info("Created Монгол / MNT region.");
  }

  // 3) Tax region for Mongolia (needed for checkout tax calc).
  try {
    const taxModule = container.resolve(Modules.TAX);
    const existing = await taxModule.listTaxRegions({ country_code: "mn" } as any);
    if (!existing.length) {
      await taxModule.createTaxRegions([{ country_code: "mn", provider_id: "tp_system" } as any]);
      logger.info("Created MN tax region.");
    } else {
      logger.info("MN tax region already present.");
    }
  } catch (e: any) {
    logger.warn(`Tax region step skipped: ${e.message}`);
  }

  logger.info("✅ Done. Refresh the admin — store shows NARAN and prices in ₮ (MNT).");
}
