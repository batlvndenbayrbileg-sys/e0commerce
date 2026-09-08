import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createOrderWorkflow } from "@medusajs/medusa/core-flows";

const CURRENCY = "mnt";

// GET /admin/offline-sale?q=  — product + variant picker (id, title, sku, MNT
// price) for the in-person sale form. Published products only.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const q = (req.query.q as string) || "";
  const filters: any = { status: "published" };
  if (q) filters.title = { $ilike: `%${q}%` };

  const { data } = await query.graph({
    entity: "product",
    fields: [
      "id", "title", "thumbnail",
      "variants.id", "variants.title", "variants.sku",
      "variants.prices.amount", "variants.prices.currency_code",
    ],
    filters,
    pagination: { take: 50, skip: 0, order: { title: "ASC" } },
  });

  const products = (data || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    thumbnail: p.thumbnail || "",
    variants: (p.variants || []).map((v: any) => {
      const mnt = (v.prices || []).find((pr: any) => pr.currency_code === CURRENCY);
      return { id: v.id, title: v.title || p.title, sku: v.sku || "", price: mnt ? Number(mnt.amount) : 0 };
    }),
  }));

  res.json({ products });
}

// POST /admin/offline-sale — record an in-person / offline sale as a Medusa
// order so it shows up alongside online sales in Orders, Analytics and Reports.
// Body: { items:[{variant_id, quantity, title, unit_price}], email?, customerName?,
//         phone?, paymentMethod?, note? }
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as any;
  const rawItems = Array.isArray(body?.items) ? body.items : [];
  const items = rawItems
    .map((i: any) => ({
      variant_id: String(i.variant_id || ""),
      quantity: Math.max(1, Math.floor(Number(i.quantity) || 1)),
      title: String(i.title || "Бараа").slice(0, 200),
      unit_price: Math.max(0, Math.round(Number(i.unit_price) || 0)),
    }))
    .filter((i: any) => i.variant_id);

  if (!items.length) {
    res.status(400).json({ message: "Дор хаяж нэг бараа сонгоно уу." });
    return;
  }

  const regionModule = req.scope.resolve(Modules.REGION);
  const regions = await regionModule.listRegions({});
  const region = regions.find((r: any) => r.currency_code === CURRENCY) || regions[0];
  if (!region) {
    res.status(400).json({ message: "Бүс (region) тохируулаагүй байна." });
    return;
  }

  let salesChannelId: string | undefined;
  try {
    const scModule = req.scope.resolve(Modules.SALES_CHANNEL);
    const channels = await scModule.listSalesChannels({});
    salesChannelId = channels[0]?.id;
  } catch { /* optional */ }

  const email = String(body?.email || "").trim() || "offline@naran.mn";

  try {
    const { result } = await createOrderWorkflow(req.scope).run({
      input: {
        region_id: region.id,
        currency_code: region.currency_code,
        email,
        sales_channel_id: salesChannelId,
        items,
        metadata: {
          offline: true,
          payment_method: String(body?.paymentMethod || "cash").slice(0, 40),
          customer_name: String(body?.customerName || "").slice(0, 120) || null,
          phone: String(body?.phone || "").slice(0, 40) || null,
          note: String(body?.note || "").slice(0, 500) || null,
          recorded_by: (req as any).auth_context?.actor_id || null,
        },
      } as any,
    });
    const total = items.reduce((a: number, b: any) => a + b.unit_price * b.quantity, 0);
    res.json({ id: (result as any)?.id, display_id: (result as any)?.display_id ?? null, total });
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Борлуулалт бүртгэхэд алдаа гарлаа" });
  }
}
