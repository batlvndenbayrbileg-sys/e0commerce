import type { Product, Order, User } from "./types";
import { medusa } from "./medusa";

const BASE = typeof window === "undefined"
  ? (process.env.API_URL || "http://localhost:4000")
  : ""; // browser uses Next rewrites at /api/*

// Product reads come from Medusa v2 (P1); orders/auth stay on Express until P3.
const USE_MEDUSA = process.env.NEXT_PUBLIC_USE_MEDUSA !== "0";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  products: {
    list: async (params: Record<string, string | undefined> = {}) => {
      if (USE_MEDUSA) return medusa.products.list(params);
      const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
      ).toString();
      const r = await fetch(`${BASE}/api/products${qs ? `?${qs}` : ""}`, { cache: "no-store" });
      return json<{ data: Product[]; total: number }>(r);
    },
    featured: async () => {
      if (USE_MEDUSA) return medusa.products.featured();
      const r = await fetch(`${BASE}/api/products/featured`, { cache: "no-store" });
      return json<{ data: Product[] }>(r);
    },
    get: async (idOrSlug: string) => {
      if (USE_MEDUSA) return medusa.products.get(idOrSlug);
      const r = await fetch(`${BASE}/api/products/${idOrSlug}`, { cache: "no-store" });
      return json<{ data: Product; related: Product[] }>(r);
    },
  },
  auth: {
    login: async (email: string, password: string) => {
      if (USE_MEDUSA) return medusa.auth.login(email, password);
      const r = await fetch(`${BASE}/api/auth/login`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return json<{ token: string; user: User }>(r);
    },
    signup: async (data: { firstName: string; lastName: string; email: string; password: string }) => {
      if (USE_MEDUSA) return medusa.auth.signup(data);
      const r = await fetch(`${BASE}/api/auth/signup`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      return json<{ token: string; user: User }>(r);
    },
    me: async (token: string) => {
      if (USE_MEDUSA) return medusa.auth.me(token);
      const r = await fetch(`${BASE}/api/auth/me`, { headers: { authorization: `Bearer ${token}` }});
      return json<{ user: User }>(r);
    },
  },
  orders: {
    create: async (data: { email: string; items: { id: string; qty: number }[]; shippingMethod?: "standard" | "express" }) => {
      const r = await fetch(`${BASE}/api/orders`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      return json<{ data: Order }>(r);
    },
    list: async (email?: string) => {
      const r = await fetch(`${BASE}/api/orders${email ? `?email=${email}` : ""}`, { cache: "no-store" });
      return json<{ data: Order[] }>(r);
    },
  },
};

export const money = (n: number) => `₮${Math.round(n).toLocaleString("en-US")}`;
