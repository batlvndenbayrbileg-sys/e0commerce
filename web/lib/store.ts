"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, User } from "./types";

type AddOpts = { size?: string; variantId?: string };
type CartState = {
  items: CartItem[];
  add: (p: Product, qty?: number, opts?: AddOpts) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (p, qty = 1, opts = {}) => set(s => {
        const size = opts.size ?? p.variants?.[0]?.size;
        const variantId = opts.variantId ?? p.variants?.find(v => v.size === size)?.id ?? p.variants?.[0]?.id;
        const key = variantId || p.id;
        const existing = s.items.find(i => (i.variantId || i.id) === key);
        if (existing) {
          return { items: s.items.map(i => (i.variantId || i.id) === key ? { ...i, qty: i.qty + qty } : i) };
        }
        return { items: [...s.items, { id: p.id, name: p.name, price: p.price, qty, accent: p.accent, category: p.category, shape: p.shape, image: p.image, size, variantId }] };
      }),
      remove: key => set(s => ({ items: s.items.filter(i => (i.variantId || i.id) !== key) })),
      setQty: (key, qty) => set(s => ({
        items: s.items.map(i => (i.variantId || i.id) === key ? { ...i, qty: Math.max(1, qty) } : i),
      })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((a, b) => a + b.qty, 0),
      subtotal: () => get().items.reduce((a, b) => a + b.price * b.qty, 0),
    }),
    { name: "nitec-cart" }
  )
);

type WishState = { ids: string[]; toggle: (id: string) => void; has: (id: string) => boolean };
export const useWish = create<WishState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: id => set(s => ({ ids: s.ids.includes(id) ? s.ids.filter(x => x !== id) : [...s.ids, id] })),
      has: id => get().ids.includes(id),
    }),
    { name: "nitec-wish" }
  )
);

type AuthState = { user: User | null; token: string | null; setSession: (u: User, t: string) => void; signOut: () => void };
export const useAuth = create<AuthState>()(
  persist(
    set => ({
      user: null,
      token: null,
      setSession: (user, token) => set({ user, token }),
      signOut: () => set({ user: null, token: null }),
    }),
    { name: "nitec-auth" }
  )
);

type ToastState = { msg: string | null; show: (m: string) => void; hide: () => void };
export const useToast = create<ToastState>(set => ({
  msg: null,
  show: m => { set({ msg: m }); setTimeout(() => set({ msg: null }), 2200); },
  hide: () => set({ msg: null }),
}));

export type OrderRecord = {
  id: string;
  email: string;
  total: number;
  items: { name: string; qty: number; price: number }[];
  status: "processing" | "shipped" | "delivered";
  createdAt: string;
  estimatedDelivery: string;
};
type OrdersState = { orders: OrderRecord[]; addOrder: (o: OrderRecord) => void };
export const useOrders = create<OrdersState>()(
  persist(
    set => ({
      orders: [],
      addOrder: o => set(s => ({ orders: [...s.orders, o] })),
    }),
    { name: "nitec-orders" }
  )
);
