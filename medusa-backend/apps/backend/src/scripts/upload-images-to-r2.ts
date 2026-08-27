import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import * as fs from "fs";
import * as path from "path";

/**
 * Upload product images to the configured File provider and rewrite product
 * image URLs to the returned (R2/CDN) URLs.
 *
 *   npx medusa exec ./src/scripts/upload-images-to-r2.ts
 *
 * Works with whatever File provider is active in medusa-config:
 *   - R2/S3  → set S3_ENDPOINT + S3_BUCKET (+ keys) in .env  → uploads to R2
 *   - local  → no S3 env → uploads to the backend's static dir (dev proof)
 *
 * Idempotent: products already pointing at an http(s) URL are skipped; only
 * local "/products/xxx" references are migrated. Safe to re-run.
 */

// Local source of truth for the seed images (served by the storefront in dev).
const IMG_DIR = path.resolve(process.cwd(), "../../..", "web", "public", "products");

const MIME: Record<string, string> = {
  ".avif": "image/avif", ".webp": "image/webp", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
};

export default async function uploadImages({ container }: ExecArgs) {
  const logger = container.resolve("logger");
  const fileModule = container.resolve(Modules.FILE);
  const productModule = container.resolve(Modules.PRODUCT);

  if (!fs.existsSync(IMG_DIR)) {
    throw new Error(`Image dir not found: ${IMG_DIR}`);
  }

  // Upload each local image once; cache basename → new URL.
  const uploaded = new Map<string, string>(); // "/products/p1.avif" -> new url
  const files = fs.readdirSync(IMG_DIR).filter(f => MIME[path.extname(f).toLowerCase()]);
  logger.info(`Uploading ${files.length} images from ${IMG_DIR} …`);

  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    // File module expects base64-encoded content (see CreateFileDTO).
    const content = fs.readFileSync(path.join(IMG_DIR, f)).toString("base64");
    const [res] = await fileModule.createFiles([
      { filename: f, mimeType: MIME[ext], content },
    ]);
    uploaded.set(`/products/${f}`, res.url);
  }
  logger.info(`Uploaded ${uploaded.size} files.`);

  // Rewrite product thumbnail + images that still point at local /products/*.
  const rewriteUrl = (u?: string) => (u && uploaded.get(u)) || u;
  let updated = 0;
  for (let skip = 0; ; skip += 200) {
    const page = await productModule.listProducts(
      {},
      { take: 200, skip, select: ["id", "thumbnail"] as any, relations: ["images"] as any },
    );
    if (!page.length) break;
    for (const p of page as any[]) {
      const newThumb = rewriteUrl(p.thumbnail);
      const newImages = (p.images || []).map((im: any) => ({ ...im, url: rewriteUrl(im.url) }));
      const thumbChanged = newThumb !== p.thumbnail;
      const imgsChanged = newImages.some((im: any, i: number) => im.url !== p.images?.[i]?.url);
      if (!thumbChanged && !imgsChanged) continue;
      await productModule.updateProducts(p.id, {
        thumbnail: newThumb,
        images: newImages.map((im: any) => ({ url: im.url })),
      } as any);
      updated++;
    }
    if (page.length < 200) break;
  }
  logger.info(`Rewrote image URLs on ${updated} products. Done.`);
}
