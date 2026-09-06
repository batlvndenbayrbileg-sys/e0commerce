import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

/**
 * One-off: rename the existing store to "NARAN".
 * The seed only names NEW stores; an already-seeded DB keeps "Default Store"
 * until this runs. Idempotent — safe to run more than once.
 *
 *   npx medusa exec src/scripts/rename-store.ts
 */
export default async function renameStore({ container }: ExecArgs) {
  const logger = container.resolve("logger");
  const storeModule = container.resolve(Modules.STORE);

  const stores = await storeModule.listStores({});
  if (!stores.length) {
    logger.warn("No store found — nothing to rename.");
    return;
  }

  for (const store of stores) {
    if (store.name === "NARAN") {
      logger.info(`Store ${store.id} already named NARAN.`);
      continue;
    }
    await storeModule.updateStores(store.id, { name: "NARAN" });
    logger.info(`Renamed store ${store.id}: "${store.name}" -> "NARAN".`);
  }
}
