import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { readMoves } from "../../../../lib/stock-history";

// GET /admin/catalog/stock-history — recent inventory movements (spec A-15).
// Actor ids resolved to emails. Guarded by catalog.read (via /admin/catalog/*).
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const entries = await readMoves(req.scope);
  const ids = [...new Set(entries.map((e) => e.actor_id).filter(Boolean) as string[])];
  const emailById = new Map<string, string>();
  if (ids.length) {
    const userModule = req.scope.resolve(Modules.USER);
    const users: any[] = await userModule.listUsers({ id: ids }, { select: ["id", "email"] as any });
    for (const u of users) emailById.set(u.id, u.email);
  }
  res.json({
    moves: entries.map((e) => ({ ...e, actor: e.actor_id ? emailById.get(e.actor_id) || e.actor_id : "—" })),
  });
}
