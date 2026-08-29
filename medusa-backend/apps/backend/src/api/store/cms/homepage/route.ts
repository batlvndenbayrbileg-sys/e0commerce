import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { readHomepage } from "../../../../lib/cms";

// GET /store/cms/homepage — public homepage content for the storefront.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({ content: await readHomepage(req.scope) });
}
