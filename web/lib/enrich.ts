import type { Category, Shape } from "./types";

/**
 * Presentation metadata keyed by Medusa product handle.
 * Medusa is the source of truth for catalog, price, image and availability;
 * these fields enrich the storefront UX (fabric, specs, rating, visual shape).
 */
export type Enrich = {
  category: Category;
  shape: Shape;
  gender: "Men" | "Women" | "Unisex";
  season: "Winter" | "Summer" | "All-Season";
  accent: string;
  fabric: string;
  bullets: string[];
  specs: Record<string, string>;
  rating: number;
  reviews: number;
  badge?: "Sale" | "New" | null;
  wasMultiplier?: number; // original price = price * multiplier
};

export const ENRICH: Record<string, Enrich> = {
  "tech-fleece-hoodie": { category: "Outerwear", shape: "hoodie", gender: "Men", season: "Winter", accent: "#1A1A1A", fabric: "Double-knit tech fleece", rating: 4.9, reviews: 1840, badge: "Sale", wasMultiplier: 1.25, bullets: ["Double-knit brushed tech fleece","Sculpted 3-panel hood","Zip chest stash pocket","Thumbhole cuffs"], specs: { Fabric: "78% poly, 22% elastane", Fit: "Athletic", Weight: "Midweight", Care: "Machine wash cold" } },
  "performance-tank": { category: "Tops", shape: "tank", gender: "Men", season: "Summer", accent: "#EDEAE2", fabric: "Moisture-wicking microfibre", rating: 4.8, reviews: 2210, badge: null, bullets: ["Moisture-wicking microfibre","Dropped armhole","Anti-odour finish"], specs: { Fabric: "92% poly, 8% elastane", Fit: "Athletic", Weight: "Lightweight", Care: "Machine wash cold" } },
  "training-joggers": { category: "Bottoms", shape: "joggers", gender: "Men", season: "All-Season", accent: "#1A1A1A", fabric: "Stretch tech twill", rating: 4.7, reviews: 1320, badge: "Sale", wasMultiplier: 1.25, bullets: ["4-way stretch tech twill","Zip secure pockets","Articulated knee","Tapered ankle"], specs: { Fabric: "88% nylon, 12% elastane", Fit: "Tapered", Rise: "Mid", Care: "Machine wash cold" } },
  "compression-longsleeve": { category: "Base Layers", shape: "longsleeve", gender: "Men", season: "Winter", accent: "#1A1A1A", fabric: "Seamless compression knit", rating: 4.8, reviews: 760, badge: null, bullets: ["Seamless body-mapped knit","Targeted compression zones","Thermo-regulating"], specs: { Fabric: "85% nylon, 15% elastane", Fit: "Compression", Weight: "Lightweight", Care: "Machine wash cold" } },
  "windbreaker-jacket": { category: "Outerwear", shape: "jacket", gender: "Men", season: "All-Season", accent: "#1A1A1A", fabric: "Ripstop with DWR", rating: 4.9, reviews: 540, badge: "New", bullets: ["Water-repellent ripstop","Laser-cut back vents","Adjustable storm hood","Packs into pocket"], specs: { Fabric: "100% recycled ripstop nylon", Fit: "Relaxed", Weight: "Ultralight", Care: "Machine wash cold" } },
  "lined-training-shorts": { category: "Bottoms", shape: "shorts", gender: "Men", season: "Summer", accent: "#1A1A1A", fabric: "4-way stretch woven", rating: 4.7, reviews: 1490, badge: null, bullets: ["Built-in support liner","7\" inseam","Zip secure pockets","Laser-vented back"], specs: { Fabric: "90% poly, 10% elastane", Fit: "Athletic", Inseam: "7 inch", Care: "Machine wash cold" } },
  "seamless-leggings": { category: "Bottoms", shape: "leggings", gender: "Women", season: "All-Season", accent: "#1A1A1A", fabric: "Sculpting seamless knit", rating: 4.9, reviews: 2640, badge: "Sale", wasMultiplier: 1.25, bullets: ["Squat-proof double knit","High contoured waistband","Body-mapped sculpt panels"], specs: { Fabric: "76% nylon, 24% elastane", Fit: "Sculpting", Rise: "High", Care: "Machine wash cold" } },
  "womens-cropped-tee": { category: "Tops", shape: "tee", gender: "Women", season: "Summer", accent: "#EDEAE2", fabric: "Pima-blend jersey", rating: 4.7, reviews: 980, badge: null, bullets: ["Breathable Pima-blend jersey","Cropped relaxed fit","Raw-edge hem"], specs: { Fabric: "60% Pima cotton, 40% modal", Fit: "Relaxed crop", Weight: "Lightweight", Care: "Machine wash cold" } },
  "tactical-sling-bag": { category: "Accessories", shape: "bag", gender: "Unisex", season: "All-Season", accent: "#1A1A1A", fabric: "Water-resistant Cordura", rating: 4.8, reviews: 610, badge: "New", bullets: ["Water-resistant Cordura","Magnetic quick-clip strap","Fleece-lined tech pocket","5L capacity"], specs: { Material: "600D Cordura", Capacity: "5 L", Care: "Wipe clean" } },
  "performance-cap": { category: "Accessories", shape: "cap", gender: "Unisex", season: "Summer", accent: "#1A1A1A", fabric: "Quick-dry ripstop", rating: 4.6, reviews: 720, badge: null, bullets: ["Quick-dry ripstop","Laser-perforated panels","Sweat-wicking band","Reflective rear logo"], specs: { Fabric: "100% quick-dry ripstop", Fit: "Adjustable", Care: "Spot clean" } },
  "thermal-hooded-base": { category: "Base Layers", shape: "longsleeve", gender: "Men", season: "Winter", accent: "#1A1A1A", fabric: "Brushed thermal knit", rating: 4.8, reviews: 430, badge: null, bullets: ["Brushed grid-fleece interior","Integrated balaclava hood","Body-mapped venting","Thumbhole cuffs"], specs: { Fabric: "90% poly, 10% elastane", Fit: "Athletic", Weight: "Midweight", Care: "Machine wash cold" } },
  "cargo-tech-pants": { category: "Bottoms", shape: "joggers", gender: "Men", season: "All-Season", accent: "#3A3B3F", fabric: "Ripstop stretch cargo", rating: 4.7, reviews: 380, badge: "New", bullets: ["Stretch ripstop","Bellowed cargo pockets","Adjustable hem cinch","Gusseted crotch"], specs: { Fabric: "94% nylon, 6% elastane", Fit: "Relaxed tapered", Rise: "Mid", Care: "Machine wash cold" } },
};

export const DEFAULT_ENRICH: Enrich = {
  category: "Accessories", shape: "bag", gender: "Unisex", season: "All-Season", accent: "#1A1A1A",
  fabric: "Performance fabric", rating: 4.7, reviews: 200, badge: null,
  bullets: ["Premium construction", "Built to perform"], specs: { Care: "Machine wash cold" },
};
