import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { readAudit } from "../../../lib/audit";

// GET /admin/audit — recent important admin actions (spec A-28). Actor ids are
// resolved to emails. Guarded by team.manage.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const entries = await readAudit(req.scope);
  const ids = [...new Set(entries.map((e) => e.actor_id).filter(Boolean) as string[])];
  const emailById = new Map<string, string>();
  if (ids.length) {
    const userModule = req.scope.resolve(Modules.USER);
    const users: any[] = await userModule.listUsers({ id: ids }, { select: ["id", "email"] as any });
    for (const u of users) emailById.set(u.id, u.email);
  }
  res.json({
    entries: entries.map((e) => ({ ...e, actor: e.actor_id ? emailById.get(e.actor_id) || e.actor_id : "—" })),
  });
}
