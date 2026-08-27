import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

// GET /admin/catalog/stats — catalog totals + per-category counts (for the
// admin Catalog overview; scales fine on a large catalog via count queries).
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const productModule = req.scope.resolve(Modules.PRODUCT);

  const [, total] = await productModule.listAndCountProducts({}, { take: 1, select: ["id"] as any });
  const [, published] = await productModule.listAndCountProducts({ status: "published" } as any, { take: 1, select: ["id"] as any });

  const categories = await productModule.listProductCategories({}, { select: ["id", "name", "handle"] as any });
  const byCategory = await Promise.all(
    categories.map(async (c: any) => {
      const [, count] = await productModule.listAndCountProducts({ categories: { id: c.id } } as any, { take: 1, select: ["id"] as any });
      return { id: c.id, name: c.name, handle: c.handle, count };
    }),
  );

  res.json({
    total,
    published,
    draft: total - published,
    categories: byCategory.sort((a, b) => b.count - a.count),
  });
}
