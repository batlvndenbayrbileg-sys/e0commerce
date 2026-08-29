import { useEffect, useState } from "react";
import { can, Permission, Role } from "../../lib/rbac";

// Client-side view of the current admin user's role, used to gate our custom
// admin UI pages. This is UX only — the real enforcement lives in the server
// middleware (src/api/middlewares.ts); the backend returns 403 regardless.

export type Me = { email: string; role?: Role };

async function fetchMe(): Promise<Me> {
  const res = await fetch("/admin/users/me", {
    credentials: "include",
    headers: { "content-type": "application/json" },
  });
  if (!res.ok) throw new Error(`me failed (${res.status})`);
  const { user } = await res.json();
  return { email: user?.email, role: user?.metadata?.role as Role | undefined };
}

// Returns { loading, me, can(perm) }. While loading, can() is optimistic (true)
// so we don't flash an access-denied panel before the role is known.
export function usePermissions() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    fetchMe()
      .then((m) => { if (alive) setMe(m); })
      .catch(() => { if (alive) setMe({ email: "" }); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);
  return {
    loading,
    me,
    can: (perm: Permission) => (loading ? true : can(me?.role, perm)),
  };
}
