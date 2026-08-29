import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  updateProductsWorkflow,
  updateProductVariantsWorkflow,
  batchLinkProductsToCategoryWorkflow,
} from "@medusajs/medusa/core-flows";

// POST /admin/catalog/bulk-edit
//   { product_ids: string[], set: { status?, price?, category_add?, category_remove? } }
// Apply price / status / category changes to many products at once (spec A-11).
// Each operation is independent and reported separately so a partial failure
// doesn't hide the successful ones.
const CURRENCY = "mnt";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body as any) || {};
  const ids: string[] = Array.isArray(body.product_ids) ? body.product_ids : [];
  const set = body.set || {};
  if (!ids.length) {
    res.status(400).json({ message: "product_ids шаардлагатай" });
    return;
  }

  const applied: Record<string, any> = {};
  const errors: Record<string, string> = {};

  // Status (published | draft)
  if (set.status === "published" || set.status === "draft") {
    try {
      await updateProductsWorkflow(req.scope).run({
        input: { selector: { id: ids }, update: { status: set.status } },
      });
      applied.status = set.status;
    } catch (e: any) {
      errors.status = e?.message || "status update failed";
    }
  }

  // Price (set MNT price on every variant of the selected products)
  if (set.price !== undefined && set.price !== null && set.price !== "") {
    const amount = Math.round(Number(set.price));
    if (!Number.isFinite(amount) || amount < 0) {
      errors.price = "Буруу үнэ";
    } else {
      try {
        await updateProductVariantsWorkflow(req.scope).run({
          input: {
            selector: { product_id: ids },
            update: { prices: [{ amount, currency_code: CURRENCY }] } as any,
          },
        });
        applied.price = amount;
      } catch (e: any) {
        errors.price = e?.message || "price update failed";
      }
    }
  }

  // Category add
  if (set.category_add) {
    try {
      await batchLinkProductsToCategoryWorkflow(req.scope).run({
        input: { id: set.category_add, add: ids } as any,
      });
      applied.category_add = set.category_add;
    } catch (e: any) {
      errors.category_add = e?.message || "category add failed";
    }
  }

  // Category remove
  if (set.category_remove) {
    try {
      await batchLinkProductsToCategoryWorkflow(req.scope).run({
        input: { id: set.category_remove, remove: ids } as any,
      });
      applied.category_remove = set.category_remove;
    } catch (e: any) {
      errors.category_remove = e?.message || "category remove failed";
    }
  }

  res.json({ count: ids.length, applied, errors: Object.keys(errors).length ? errors : undefined });
}
