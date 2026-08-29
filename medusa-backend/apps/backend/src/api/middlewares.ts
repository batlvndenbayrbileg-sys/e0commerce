import { defineMiddlewares, MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { can, Permission } from "../lib/rbac";

// RBAC guard (spec A0): enforce a permission on our custom /admin routes based on
// the acting user's role (user.metadata.role). Role-less users are treated as
// super_admin (see lib/rbac) so the existing admin is never locked out.
//
// NOTE on matchers: Medusa's middleware loader runs `String(matcher)` and hands the
// result to Express as a path, so matchers MUST be Express path strings (globs /
// ":param"), never RegExp — a RegExp stringifies to a path that matches nothing.
// The config field is `methods` (plural).
function requirePermission(perm: Permission) {
  return async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
    const userId = (req as any).auth_context?.actor_id;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    try {
      const userModule = req.scope.resolve(Modules.USER);
      const user: any = await userModule.retrieveUser(userId, { select: ["id", "metadata"] as any });
      const role = user?.metadata?.role;
      if (!can(role, perm)) {
        res.status(403).json({ message: `Эрх хүрэлцэхгүй (${perm})` });
        return;
      }
      next();
    } catch (e) {
      next(e as Error);
    }
  };
}

export default defineMiddlewares({
  routes: [
    { matcher: "/admin/catalog/*", methods: ["GET"], middlewares: [requirePermission("catalog.read")] },
    { matcher: "/admin/catalog/*", methods: ["POST"], middlewares: [requirePermission("catalog.write")] },
    { matcher: "/admin/analytics/*", methods: ["GET"], middlewares: [requirePermission("analytics.read")] },
    { matcher: "/admin/fulfillment/*", methods: ["GET"], middlewares: [requirePermission("orders.read")] },
    { matcher: "/admin/fulfillment/*", methods: ["POST"], middlewares: [requirePermission("orders.write")] },
    { matcher: "/admin/crm/*", methods: ["GET"], middlewares: [requirePermission("customers.read")] },
    { matcher: "/admin/crm/*", methods: ["POST"], middlewares: [requirePermission("customers.write")] },
    { matcher: "/admin/cms/*", methods: ["GET", "POST"], middlewares: [requirePermission("content.write")] },
    { matcher: "/admin/returns/:id/approve", methods: ["POST"], middlewares: [requirePermission("returns.write")] },
    { matcher: "/admin/users/:id/role", methods: ["POST"], middlewares: [requirePermission("team.manage")] },
  ],
});
