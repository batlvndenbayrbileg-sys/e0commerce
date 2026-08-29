import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

// GET /admin/catalog/products?q=&category_id=&limit=&offset=
// Compact product list for the bulk-edit picker (spec A-11). Returns MNT price,
// status, thumbnail and category names for each product.
const CURRENCY = "mnt";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const q = (req.query.q as string) || "";
  const categoryId = (req.query.category_id as string) || "";
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const offset = Number(req.query.offset) || 0;

  const filters: any = {};
  if (q) filters.title = { $ilike: `%${q}%` };
  if (categoryId) filters.categories = { id: categoryId };

  const { data, metadata } = await query.graph({
    entity: "product",
    fields: [
      "id", "title", "status", "thumbnail",
      "variants.prices.amount", "variants.prices.currency_code",
      "categories.id", "categories.name",
    ],
    filters,
    pagination: { take: limit, skip: offset, order: { title: "ASC" } },
  });

  const products = (data || []).map((p: any) => {
    // Representative price = first variant's MNT price.
    let price: number | null = null;
    for (const v of p.variants || []) {
      const mnt = (v.prices || []).find((pr: any) => pr.currency_code === CURRENCY);
      if (mnt) { price = Number(mnt.amount); break; }
    }
    return {
      id: p.id,
      title: p.title,
      status: p.status,
      thumbnail: p.thumbnail || "",
      price,
      categories: (p.categories || []).map((c: any) => ({ id: c.id, name: c.name })),
    };
  });

  res.json({ products, count: metadata?.count ?? products.length, limit, offset });
}
