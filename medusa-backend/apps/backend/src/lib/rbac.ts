// Role-based access control for the admin (spec A0 / A-27).
//
// The @medusajs/rbac module exists but its enforcement is undocumented/immature
// (spec risk AR-01), so we use a robust, stable model: the assigned role lives on
// user.metadata.role, permissions are a code-defined map (source of truth), and a
// middleware enforces them on our custom /admin/* routes.
//
// NOTE: Medusa's core admin routes (products/orders CRUD) can't be fully role-
// gated in v2 without deeper platform work; this governs our custom admin surface
// and the visibility of custom UI pages.

export type Role =
  | "super_admin"
  | "order_processor"
  | "catalog_manager"
  | "marketer"
  | "support"
  | "report_viewer";

export type Permission =
  | "catalog.read" | "catalog.write"
  | "orders.read" | "orders.write"
  | "returns.read" | "returns.write"
  | "inventory.write"
  | "customers.read"
  | "promotions.write"
  | "content.write"
  | "analytics.read" | "reports.read"
  | "team.manage";

export const ROLES: { value: Role; label: string; permissions: Permission[] | ["*"] }[] = [
  { value: "super_admin", label: "Super Admin", permissions: ["*"] },
  { value: "order_processor", label: "Захиалга боловсруулагч", permissions: ["orders.read", "orders.write", "returns.read", "returns.write", "catalog.read"] },
  { value: "catalog_manager", label: "Каталог менежер", permissions: ["catalog.read", "catalog.write", "inventory.write", "orders.read", "analytics.read"] },
  { value: "marketer", label: "Маркетер", permissions: ["promotions.write", "content.write", "analytics.read", "reports.read", "catalog.read"] },
  { value: "support", label: "Дэмжлэг", permissions: ["orders.read", "customers.read", "returns.read", "returns.write"] },
  { value: "report_viewer", label: "Тайлан харагч", permissions: ["analytics.read", "reports.read"] },
];

const PERMS = new Map(ROLES.map(r => [r.value, r.permissions]));

export function isRole(v: unknown): v is Role {
  return typeof v === "string" && PERMS.has(v as Role);
}

// Whether a role may perform a permission. Unknown/unset role → treated as
// super_admin so the existing sole admin is never locked out (roles are opt-in).
export function can(role: string | undefined | null, perm: Permission): boolean {
  const p = isRole(role) ? PERMS.get(role)! : ["*" as const];
  return p[0] === "*" || (p as Permission[]).includes(perm);
}
