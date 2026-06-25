import type { Product, User } from "./types";
import { ENRICH, DEFAULT_ENRICH } from "./enrich";

const URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000";
const PK = process.env.NEXT_PUBLIC_MEDUSA_PK || "pk_6352a937fd8593d7cff1b41f32d7dd564df486a1b789b75533bed1abd3cf5271";
const REGION = process.env.NEXT_PUBLIC_MEDUSA_REGION || "reg_01KVYG28Y7T54Y110SXWV6CTAX";

const FIELDS = "id,title,handle,description,thumbnail,*images,*options,*options.values,*variants,*variants.calculated_price";
const H = { "content-type": "application/json", "x-publishable-api-key": PK };

async function mfetch(path: string) {
  const res = await fetch(`${URL}/store/${path}`, { headers: H, cache: "no-store" });
  if (!res.ok) throw new Error(`Medusa ${res.status}`);
  return res.json();
}
const mpost = async (path: string, body: any) => {
  const res = await fetch(`${URL}/store/${path}`, { method: "POST", headers: H, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Medusa ${res.status}`);
  return data;
};

const mapCustomer = (c: any): User => ({
  id: c.id,
  email: c.email,
  firstName: c.first_name || c.email?.split("@")[0] || "",
  lastName: c.last_name || "",
});

async function authPost(path: string, body: any) {
  const res = await fetch(`${URL}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Auth ${res.status}`);
  return data;
}
async function fetchMe(token: string): Promise<User> {
  const res = await fetch(`${URL}/store/customers/me`, { headers: { ...H, authorization: `Bearer ${token}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.customer) throw new Error("Could not load account");
  return mapCustomer(data.customer);
}

function map(m: any): Product {
  const handle = m.handle as string;
  const e = ENRICH[handle] || DEFAULT_ENRICH;
  const prices = (m.variants || [])
    .map((v: any) => v?.calculated_price?.calculated_amount)
    .filter((n: any) => typeof n === "number");
  const price = prices.length ? Math.round(Math.min(...prices)) : 0;
  const sizeOpt = (m.options || []).find((o: any) => o.title?.toLowerCase() === "size");
  const sizes = sizeOpt?.values?.map((v: any) => v.value) ?? ["One size"];
  const description = m.description || "";

  return {
    id: handle,
    slug: handle,
    name: m.title,
    category: e.category,
    shape: e.shape,
    gender: e.gender,
    season: e.season,
    price,
    was: e.wasMultiplier ? Math.round(price * e.wasMultiplier) : undefined,
    rating: e.rating,
    reviews: e.reviews,
    badge: e.badge ?? null,
    colors: [e.accent],
    sizes,
    fabric: e.fabric,
    shortDesc: description.slice(0, 90),
    description,
    bullets: e.bullets,
    specs: e.specs,
    stock: 99,
    accent: e.accent,
    image: m.thumbnail || m.images?.[0]?.url,
    variants: (m.variants || []).map((v: any) => ({ id: v.id, size: v.title })),
  };
}

async function fetchAll(): Promise<Product[]> {
  const q = new URLSearchParams({ limit: "100", region_id: REGION, fields: FIELDS });
  const { products } = await mfetch(`products?${q.toString()}`);
  return (products || []).map(map);
}

export const medusa = {
  products: {
    list: async (params: Record<string, string | undefined> = {}) => {
      let list = await fetchAll();
      const { category, q, sort } = params;
      if (category && category !== "all") list = list.filter(p => p.category === category);
      if (q) { const n = q.toLowerCase(); list = list.filter(p => p.name.toLowerCase().includes(n) || p.shortDesc.toLowerCase().includes(n)); }
      switch (sort) {
        case "price-asc": list.sort((a, b) => a.price - b.price); break;
        case "price-desc": list.sort((a, b) => b.price - a.price); break;
        case "rating": list.sort((a, b) => b.rating - a.rating); break;
        case "new": list = list.filter(p => p.badge === "New").concat(list.filter(p => p.badge !== "New")); break;
      }
      return { data: list, total: list.length };
    },
    featured: async () => {
      const { data } = await medusa.products.list({});
      return { data: data.slice(0, 8) };
    },
    get: async (idOrSlug: string) => {
      const q = new URLSearchParams({ handle: idOrSlug, region_id: REGION, fields: FIELDS });
      const { products } = await mfetch(`products?${q.toString()}`);
      const product = products?.[0] ? map(products[0]) : null;
      if (!product) throw new Error("Product not found");
      const all = await fetchAll();
      const related = all.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);
      return { data: product, related };
    },
  },

  auth: {
    login: async (email: string, password: string) => {
      const { token } = await authPost("/auth/customer/emailpass", { email, password });
      if (!token) throw new Error("Invalid credentials");
      return { token, user: await fetchMe(token) };
    },
    signup: async (data: { firstName: string; lastName: string; email: string; password: string }) => {
      const reg = await authPost("/auth/customer/emailpass/register", { email: data.email, password: data.password });
      const regToken = reg.token;
      if (!regToken) throw new Error("Could not register");
      await fetch(`${URL}/store/customers`, {
        method: "POST",
        headers: { ...H, authorization: `Bearer ${regToken}` },
        body: JSON.stringify({ email: data.email, first_name: data.firstName, last_name: data.lastName }),
      });
      const { token } = await authPost("/auth/customer/emailpass", { email: data.email, password: data.password });
      return { token, user: await fetchMe(token) };
    },
    me: async (token: string) => ({ user: await fetchMe(token) }),
  },

  // Build a Medusa cart up to (but not including) completion. The order is
  // completed server-side by the Wire webhook/poll once payment succeeds.
  prepareCart: async (input: {
    email: string;
    items: { variantId: string; quantity: number }[];
    shippingMethod?: "standard" | "express";
    address: { first_name: string; last_name: string; address_1: string; city: string; postal_code: string; country_code: string; phone?: string };
  }) => {
    const { cart } = await mpost("carts", {
      region_id: REGION,
      email: input.email,
      items: input.items.map(i => ({ variant_id: i.variantId, quantity: i.quantity })),
    });
    await mpost(`carts/${cart.id}`, {
      email: input.email,
      shipping_address: input.address,
      billing_address: input.address,
    });
    const { shipping_options } = await mfetch(`shipping-options?cart_id=${cart.id}`);
    const wantExpress = input.shippingMethod === "express";
    const opt = shipping_options.find((o: any) => (wantExpress ? /express/i : /standard/i).test(o.name)) || shipping_options[0];
    if (!opt) throw new Error("No shipping option available");
    await mpost(`carts/${cart.id}/shipping-methods`, { option_id: opt.id });
    const { payment_collection } = await mpost("payment-collections", { cart_id: cart.id });
    await mpost(`payment-collections/${payment_collection.id}/payment-sessions`, { provider_id: "pp_system_default" });
    const updated = await mfetch(`carts/${cart.id}`);
    return { cartId: cart.id, total: Math.round(updated.cart?.total ?? cart.total ?? 0) };
  },

  // Full Medusa cart → order flow (system payment provider, no Stripe yet — P3)
  checkout: async (input: {
    email: string;
    items: { variantId: string; quantity: number }[];
    shippingMethod?: "standard" | "express";
    address: { first_name: string; last_name: string; address_1: string; city: string; postal_code: string; country_code: string; phone?: string };
  }) => {
    const { cart } = await mpost("carts", {
      region_id: REGION,
      email: input.email,
      items: input.items.map(i => ({ variant_id: i.variantId, quantity: i.quantity })),
    });
    await mpost(`carts/${cart.id}`, {
      email: input.email,
      shipping_address: input.address,
      billing_address: input.address,
    });

    const { shipping_options } = await mfetch(`shipping-options?cart_id=${cart.id}`);
    const wantExpress = input.shippingMethod === "express";
    const opt = shipping_options.find((o: any) => (wantExpress ? /express/i : /standard/i).test(o.name)) || shipping_options[0];
    if (!opt) throw new Error("No shipping option available");
    await mpost(`carts/${cart.id}/shipping-methods`, { option_id: opt.id });

    const { payment_collection } = await mpost("payment-collections", { cart_id: cart.id });
    await mpost(`payment-collections/${payment_collection.id}/payment-sessions`, { provider_id: "pp_system_default" });

    const result = await mpost(`carts/${cart.id}/complete`, {});
    if (result.type !== "order") throw new Error(result?.error?.message || "Order could not be completed");
    const o = result.order;
    return {
      id: o.display_id ? `NT-${o.display_id}` : o.id,
      orderId: o.id,
      total: Math.round(o.total),
      email: o.email,
      estimatedDelivery: new Date(Date.now() + (wantExpress ? 2 : 4) * 86400000).toISOString().slice(0, 10),
    };
  },
};
