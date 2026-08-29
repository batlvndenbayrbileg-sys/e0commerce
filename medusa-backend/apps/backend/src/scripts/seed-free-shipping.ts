import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { createPromotionsWorkflow } from "@medusajs/medusa/core-flows";

// Automatic free-shipping over a threshold (FR-16). No code needed — applies
// itself when the cart item total is at or above THRESHOLD (MNT).
const THRESHOLD = 150000;
const CODE = "AUTO-FREESHIP-150K";

export default async function seedFreeShipping({ container }: ExecArgs) {
  const logger = container.resolve("logger");
  const promotionModule = container.resolve(Modules.PROMOTION);

  const existing = await promotionModule.listPromotions({ code: [CODE] });
  if (existing.length) { logger.info("Free-shipping-threshold promo already present."); return; }

  await createPromotionsWorkflow(container).run({
    input: {
      promotionsData: [{
        code: CODE,
        type: "standard" as const,
        status: "active" as const,
        is_automatic: true,
        application_method: {
          type: "percentage" as const,
          target_type: "shipping_methods" as const,
          allocation: "across" as const,
          value: 100,
        },
        rules: [
          { attribute: "item_total", operator: "gte" as const, values: [String(THRESHOLD)] },
        ],
      }],
    },
  });
  logger.info(`Created automatic free-shipping promo (item_total ≥ ${THRESHOLD}).`);
}
