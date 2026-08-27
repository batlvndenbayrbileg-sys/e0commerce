import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { createProductCategoriesWorkflow } from "@medusajs/medusa/core-flows";

// Canonical beauty taxonomy — lives in Medusa so it scales to a 10k+ catalog.
// handle = storefront category key (lowercased); name = Mongolian display.
export const CATEGORIES = [
  { handle: "fragrance", name: "Үнэртэй ус" },
  { handle: "skincare", name: "Арьс арчилгаа" },
  { handle: "makeup", name: "Гоо сайхан" },
  { handle: "body", name: "Бие арчилгаа" },
  { handle: "gift", name: "Бэлгийн багц" },
];

// Mongolian name → handle, so seeders/importers can map their category column.
export const MN_TO_HANDLE: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.name, c.handle])
);

export default async function seedCategories({ container }: ExecArgs) {
  const logger = container.resolve("logger");
  const productModule = container.resolve(Modules.PRODUCT);

  const existing = await productModule.listProductCategories({ handle: CATEGORIES.map(c => c.handle) });
  const have = new Set(existing.map(c => c.handle));
  const toCreate = CATEGORIES.filter(c => !have.has(c.handle));

  if (toCreate.length) {
    await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: toCreate.map(c => ({
          name: c.name, handle: c.handle, is_active: true, is_internal: false,
        })),
      },
    });
    logger.info(`Created ${toCreate.length} product categories.`);
  } else {
    logger.info("Product categories already present.");
  }
  const all = await productModule.listProductCategories({ handle: CATEGORIES.map(c => c.handle) });
  logger.info(`Categories ready: ${all.map(c => `${c.name} (${c.handle})`).join(", ")}`);
}
