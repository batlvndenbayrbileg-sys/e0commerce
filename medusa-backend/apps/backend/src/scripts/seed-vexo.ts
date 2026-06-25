import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { createProductsWorkflow } from "@medusajs/medusa/core-flows";

const IMG = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

type Seed = { title: string; handle: string; price: number; sizes: string[]; img: string; desc: string };

const CATALOG: Seed[] = [
  { title: "Tech Fleece Hoodie", handle: "tech-fleece-hoodie", price: 128, sizes: ["S","M","L","XL","XXL"], img: IMG("1517836357463-d25dfeac3438"), desc: "Insulated double-knit tech fleece with a sculpted hood, brushed interior and thumbhole cuffs. Built for cold-weather training." },
  { title: "Performance Tank", handle: "performance-tank", price: 42, sizes: ["S","M","L","XL","XXL"], img: IMG("1571019613454-1cb2f99b2d8b"), desc: "Featherweight moisture-wicking training tank with a dropped armhole and anti-odour finish." },
  { title: "Training Joggers", handle: "training-joggers", price: 96, sizes: ["S","M","L","XL","XXL"], img: IMG("1534438327276-14e5300c3a48"), desc: "Tapered 4-way stretch tech joggers with zip pockets and an articulated knee." },
  { title: "Compression Long Sleeve", handle: "compression-longsleeve", price: 64, sizes: ["S","M","L","XL","XXL"], img: IMG("1549060279-7e168fcee0c2"), desc: "Seamless body-mapped compression base layer that supports working muscles and regulates temperature." },
  { title: "Windbreaker Jacket", handle: "windbreaker-jacket", price: 148, sizes: ["S","M","L","XL","XXL"], img: IMG("1483721310020-03333e577078"), desc: "Packable water-repellent ripstop shell with laser-cut vents and a storm hood." },
  { title: "Lined Training Shorts", handle: "lined-training-shorts", price: 56, sizes: ["S","M","L","XL","XXL"], img: IMG("1581009146145-b5ef050c2e1e"), desc: "7-inch training shorts with a supportive built-in liner and a laser-vented back panel." },
  { title: "Seamless Leggings", handle: "seamless-leggings", price: 88, sizes: ["XS","S","M","L","XL"], img: IMG("1518611012118-696072aa579a"), desc: "High-rise squat-proof seamless leggings with a contoured waistband and sculpt panels." },
  { title: "Women's Cropped Tee", handle: "womens-cropped-tee", price: 44, sizes: ["XS","S","M","L","XL"], img: IMG("1594381898411-846e7d193883"), desc: "Relaxed cropped tee in a breathable Pima-blend jersey with a raw-edge hem." },
  { title: "Tactical Sling Bag", handle: "tactical-sling-bag", price: 72, sizes: ["One size"], img: IMG("1605296867304-46d5465a13f1"), desc: "Crossbody sling in rugged water-resistant Cordura with a magnetic quick-clip strap." },
  { title: "Performance Cap", handle: "performance-cap", price: 34, sizes: ["One size"], img: IMG("1538805060514-97d9cc17730c"), desc: "Lightweight quick-dry running cap with laser-perforated panels and a reflective rear logo." },
  { title: "Thermal Hooded Base", handle: "thermal-hooded-base", price: 78, sizes: ["S","M","L","XL","XXL"], img: IMG("1556817411-31ae72fa3ea0"), desc: "Brushed thermal base layer with an integrated balaclava hood for the coldest sessions." },
  { title: "Cargo Tech Pants", handle: "cargo-tech-pants", price: 116, sizes: ["S","M","L","XL","XXL"], img: IMG("1610384104075-e05c8cf200c3"), desc: "Utility cargo pants in a stretch ripstop with bellowed pockets and adjustable hem cinches." },
];

const DEMO_HANDLES = ["t-shirt", "sweatshirt", "sweatpants", "shorts"];

export default async function seedVexo({ container }: ExecArgs) {
  const logger = container.resolve("logger");
  const productModule = container.resolve(Modules.PRODUCT);
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL);
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT);

  const [channel] = await salesChannelModule.listSalesChannels({ name: "Default Sales Channel" });
  const [profile] = await fulfillmentModule.listShippingProfiles({});
  if (!channel || !profile) throw new Error("Missing default sales channel or shipping profile");

  // Remove Medusa demo products
  const demo = await productModule.listProducts({ handle: DEMO_HANDLES });
  if (demo.length) {
    await productModule.deleteProducts(demo.map(p => p.id));
    logger.info(`Removed ${demo.length} demo products`);
  }

  // Skip ones we already created (idempotent)
  const existing = await productModule.listProducts({ handle: CATALOG.map(c => c.handle) });
  const existingHandles = new Set(existing.map(p => p.handle));
  const toCreate = CATALOG.filter(c => !existingHandles.has(c.handle));
  if (!toCreate.length) { logger.info("VEXO catalog already seeded"); return; }

  await createProductsWorkflow(container).run({
    input: {
      products: toCreate.map(p => ({
        title: p.title,
        handle: p.handle,
        description: p.desc,
        status: "published" as const,
        thumbnail: p.img,
        images: [{ url: p.img }],
        shipping_profile_id: profile.id,
        options: [{ title: "Size", values: p.sizes }],
        variants: p.sizes.map(s => ({
          title: s,
          sku: `${p.handle}-${s}`.toLowerCase().replace(/\s+/g, "-"),
          manage_inventory: false,
          options: { Size: s },
          prices: [{ amount: p.price, currency_code: "usd" }],
        })),
        sales_channel_ids: [channel.id],
      })),
    },
  });

  logger.info(`Seeded ${toCreate.length} VEXO products`);
}
