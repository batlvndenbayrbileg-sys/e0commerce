import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { readHomepage, writeHomepage, sanitize } from "../../../../lib/cms";

// GET  /admin/cms/homepage — current editable homepage content.
// POST /admin/cms/homepage — save it. Both guarded by content.write.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({ content: await readHomepage(req.scope) });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const content = sanitize((req.body as any)?.content ?? req.body);
  await writeHomepage(req.scope, content);
  res.json({ content });
}
