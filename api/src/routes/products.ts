import { Router } from "express";
import { products } from "../data/products.js";

const router = Router();

router.get("/", (req, res) => {
  const { category, q, sort, minPrice, maxPrice } = req.query as Record<string, string>;
  let list = [...products];

  if (category && category !== "all") {
    list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (q) {
    const needle = q.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(needle) || p.shortDesc.toLowerCase().includes(needle));
  }
  if (minPrice) list = list.filter(p => p.price >= +minPrice);
  if (maxPrice) list = list.filter(p => p.price <= +maxPrice);

  switch (sort) {
    case "price-asc":  list.sort((a, b) => a.price - b.price); break;
    case "price-desc": list.sort((a, b) => b.price - a.price); break;
    case "rating":     list.sort((a, b) => b.rating - a.rating); break;
    case "new":        list = list.filter(p => p.badge === "New").concat(list.filter(p => p.badge !== "New")); break;
  }

  res.json({ data: list, total: list.length });
});

router.get("/featured", (_req, res) => {
  res.json({ data: products.slice(0, 6) });
});

router.get("/:idOrSlug", (req, res) => {
  const key = req.params.idOrSlug;
  const product = products.find(p => p.id === key || p.slug === key);
  if (!product) return res.status(404).json({ error: "Product not found" });
  const related = products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 3);
  res.json({ data: product, related });
});

export default router;
