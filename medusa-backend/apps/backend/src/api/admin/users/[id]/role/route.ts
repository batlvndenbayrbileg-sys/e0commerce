import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { isRole } from "../../../../../lib/rbac";
import { audit } from "../../../../../lib/audit";

// POST /admin/users/:id/role  { role }
// Assign an RBAC role to an admin user (stored on user.metadata.role).
// Guarded by the "team.manage" permission (see src/api/middlewares.ts).
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const role = (req.body as any)?.role;
  if (!isRole(role)) {
    res.status(400).json({ message: "Invalid role" });
    return;
  }
  const userModule = req.scope.resolve(Modules.USER);
  const existing: any = await userModule.retrieveUser(id, { select: ["id", "metadata"] as any });
  const updated = await userModule.updateUsers({
    id,
    metadata: { ...(existing?.metadata || {}), role },
  } as any);
  await audit(req.scope, {
    actor_id: (req as any).auth_context?.actor_id || null,
    action: "role.assign",
    target: id,
    meta: { role },
  }, Date.now());
  res.json({ id, role, user: updated });
}
