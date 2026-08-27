import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { createPromotionsWorkflow } from "@medusajs/medusa/core-flows";

// NARAN promo codes. Percentage/order + free-shipping promos need no rules, so
// they apply cleanly to any cart. Add min-spend rules later if needed.
const PROMOS = [
  {
    code: "NARAN10",
    type: "standard" as const,
    status: "active" as const,
    application_method: { type: "percentage" as const, target_type: "order" as const, allocation: "across" as const, value: 10 },
  },
  {
    code: "NARAN20",
    type: "standard" as const,
    status: "active" as const,
    application_method: { type: "percentage" as const, target_type: "order" as const, allocation: "across" as const, value: 20 },
  },
  {
    code: "FREESHIP",
    type: "standard" as const,
    status: "active" as const,
    application_method: { type: "percentage" as const, target_type: "shipping_methods" as const, allocation: "across" as const, value: 100 },
  },
];

export default async function seedPromotions({ container }: ExecArgs) {
  const logger = container.resolve("logger");
  const promotionModule = container.resolve(Modules.PROMOTION);

  const existing = await promotionModule.listPromotions({ code: PROMOS.map(p => p.code) });
  const have = new Set(existing.map(p => p.code));
  const toCreate = PROMOS.filter(p => !have.has(p.code));

  if (!toCreate.length) {
    logger.info(`Promotions already present: ${PROMOS.map(p => p.code).join(", ")}`);
    return;
  }

  await createPromotionsWorkflow(container).run({ input: { promotionsData: toCreate } });
  logger.info(`Created promotions: ${toCreate.map(p => p.code).join(", ")}`);
}
