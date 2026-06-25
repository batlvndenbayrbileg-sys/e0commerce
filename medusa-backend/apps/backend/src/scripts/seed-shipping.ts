import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { createServiceZonesWorkflow, createShippingOptionsWorkflow } from "@medusajs/medusa/core-flows";

export default async function seedShipping({ container }: ExecArgs) {
  const logger = container.resolve("logger");
  const fulfillment = container.resolve(Modules.FULFILLMENT);

  const [profile] = await fulfillment.listShippingProfiles({});
  const sets = await fulfillment.listFulfillmentSets({}, { relations: ["service_zones"] });
  const fset = sets[0];
  if (!fset || !profile) throw new Error("Missing fulfillment set or shipping profile");

  const existingZones = await fulfillment.listServiceZones({ name: "United States" });
  let zoneId = existingZones[0]?.id;

  if (!zoneId) {
    const { result } = await createServiceZonesWorkflow(container).run({
      input: { data: [{ fulfillment_set_id: fset.id, name: "United States", geo_zones: [{ type: "country", country_code: "us" }] }] },
    });
    zoneId = result[0].id;
    logger.info("Created United States service zone");
  } else {
    logger.info("US service zone already exists");
  }

  const existingOpts = await fulfillment.listShippingOptions({ name: "Standard (US)" });
  if (existingOpts.length) { logger.info("US shipping option already exists"); return; }

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard (US)",
        service_zone_id: zoneId,
        shipping_profile_id: profile.id,
        provider_id: "manual_manual",
        type: { label: "Standard", description: "3-5 business days", code: "standard" },
        price_type: "flat",
        prices: [{ currency_code: "usd", amount: 0 }],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
      {
        name: "Express (US)",
        service_zone_id: zoneId,
        shipping_profile_id: profile.id,
        provider_id: "manual_manual",
        type: { label: "Express", description: "1-2 business days", code: "express" },
        price_type: "flat",
        prices: [{ currency_code: "usd", amount: 18 }],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  });
  logger.info("Created US shipping options (Standard, Express)");
}
