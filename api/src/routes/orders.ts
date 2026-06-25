import { Router } from "express";
import { z } from "zod";
import { products } from "../data/products.js";

const router = Router();

type Order = {
  id: string;
  email: string;
  items: { id: string; qty: number; price: number; name: string }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: "processing" | "shipped" | "delivered";
  createdAt: string;
  estimatedDelivery: string;
};
const orders = new Map<string, Order>();

const orderSchema = z.object({
  email: z.string().email(),
  items: z.array(z.object({ id: z.string(), qty: z.number().int().positive() })).min(1),
  shippingMethod: z.enum(["standard", "express"]).default("standard"),
});

router.post("/", (req, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, items, shippingMethod } = parsed.data;

  const lineItems = items.map(i => {
    const p = products.find(pr => pr.id === i.id);
    if (!p) throw new Error(`Unknown product ${i.id}`);
    return { id: p.id, name: p.name, qty: i.qty, price: p.price };
  });

  const subtotal = lineItems.reduce((a, b) => a + b.price * b.qty, 0);
  const shipping = shippingMethod === "express" ? 18 : subtotal > 200 ? 0 : 12;
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + shipping + tax).toFixed(2);

  const id = "NT-" + Math.floor(100000 + Math.random() * 900000);
  const eta = new Date(Date.now() + (shippingMethod === "express" ? 2 : 4) * 86400000);
  const order: Order = {
    id, email, items: lineItems, subtotal, shipping, tax, total,
    status: "processing",
    createdAt: new Date().toISOString(),
    estimatedDelivery: eta.toISOString().slice(0, 10),
  };
  orders.set(id, order);
  res.json({ data: order });
});

router.get("/:id", (req, res) => {
  const order = orders.get(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json({ data: order });
});

router.get("/", (req, res) => {
  const email = req.query.email as string | undefined;
  const list = email
    ? [...orders.values()].filter(o => o.email === email)
    : [...orders.values()];
  res.json({ data: list });
});

export default router;
