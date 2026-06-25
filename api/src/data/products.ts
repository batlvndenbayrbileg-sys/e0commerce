export type Category = "Outerwear" | "Tops" | "Bottoms" | "Base Layers" | "Accessories";
export type Shape =
  | "jacket" | "hoodie" | "tank" | "tee" | "longsleeve"
  | "joggers" | "shorts" | "leggings" | "cap" | "bag";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  shape: Shape;
  gender: "Men" | "Women" | "Unisex";
  season: "Winter" | "Summer" | "All-Season";
  price: number;
  was?: number;
  rating: number;
  reviews: number;
  badge?: "Sale" | "New" | null;
  colors: string[];
  sizes: string[];
  fabric: string;
  shortDesc: string;
  description: string;
  bullets: string[];
  specs: Record<string, string>;
  stock: number;
  accent: string;
};

export const products: Product[] = [
  {
    id: "p1", slug: "tech-fleece-hoodie", name: "Tech Fleece Hoodie", category: "Outerwear", shape: "hoodie",
    gender: "Men", season: "Winter", price: 128, was: 160, rating: 4.9, reviews: 1840, badge: "Sale",
    colors: ["#1A1A1A", "#3A3B3F", "#5A5246"], sizes: ["S", "M", "L", "XL", "XXL"],
    fabric: "Double-knit tech fleece",
    shortDesc: "Insulated, brushed-back tech fleece with a sculpted hood.",
    description: "Built for cold-weather training — a double-knit tech fleece that traps heat without the bulk. Brushed interior, sculpted hood, zip chest stash pocket, and thumbholes to seal in warmth on the move.",
    bullets: ["Double-knit brushed tech fleece", "Sculpted 3-panel hood", "Zip chest stash pocket", "Thumbhole cuffs", "4-way stretch"],
    specs: { Fabric: "78% poly, 22% elastane tech fleece", Fit: "Athletic", Weight: "Midweight", Care: "Machine wash cold" },
    stock: 220, accent: "#1A1A1A",
  },
  {
    id: "p2", slug: "performance-tank", name: "Performance Tank", category: "Tops", shape: "tank",
    gender: "Men", season: "Summer", price: 42, rating: 4.8, reviews: 2210, badge: null,
    colors: ["#EDEAE2", "#1A1A1A", "#3A3B3F"], sizes: ["S", "M", "L", "XL", "XXL"],
    fabric: "Moisture-wicking microfibre",
    shortDesc: "A featherweight training tank that moves sweat fast.",
    description: "The everyday training tank, cut for range of motion. A featherweight moisture-wicking microfibre that dries fast and stays light, with a dropped armhole and a clean tonal logo.",
    bullets: ["Moisture-wicking microfibre", "Dropped armhole for mobility", "Anti-odour finish", "Tonal raised logo"],
    specs: { Fabric: "92% poly, 8% elastane", Fit: "Athletic", Weight: "Lightweight", Care: "Machine wash cold" },
    stock: 480, accent: "#EDEAE2",
  },
  {
    id: "p3", slug: "training-joggers", name: "Training Joggers", category: "Bottoms", shape: "joggers",
    gender: "Men", season: "All-Season", price: 96, was: 120, rating: 4.7, reviews: 1320, badge: "Sale",
    colors: ["#1A1A1A", "#3A3B3F", "#4A4636"], sizes: ["S", "M", "L", "XL", "XXL"],
    fabric: "Stretch tech twill",
    shortDesc: "Tapered tech joggers with zip pockets and a clean break.",
    description: "Tapered training joggers in a stretch tech twill that holds shape session after session. Zip side pockets, an articulated knee, and a tailored taper that works in the gym or on the street.",
    bullets: ["4-way stretch tech twill", "Zip secure pockets", "Articulated knee", "Tapered ankle"],
    specs: { Fabric: "88% nylon, 12% elastane", Fit: "Tapered", Rise: "Mid", Care: "Machine wash cold" },
    stock: 260, accent: "#1A1A1A",
  },
  {
    id: "p4", slug: "compression-longsleeve", name: "Compression Long Sleeve", category: "Base Layers", shape: "longsleeve",
    gender: "Men", season: "Winter", price: 64, rating: 4.8, reviews: 760, badge: null,
    colors: ["#1A1A1A", "#2A3142", "#3A3B3F"], sizes: ["S", "M", "L", "XL", "XXL"],
    fabric: "Seamless compression knit",
    shortDesc: "A second-skin base layer with targeted compression.",
    description: "A seamless compression base layer engineered to support working muscles and regulate temperature. Body-mapped knit zones flex where you move and hold where you need it.",
    bullets: ["Seamless body-mapped knit", "Targeted compression zones", "Thermo-regulating", "Flatlock-free seams"],
    specs: { Fabric: "85% nylon, 15% elastane", Fit: "Compression", Weight: "Lightweight", Care: "Machine wash cold" },
    stock: 190, accent: "#1A1A1A",
  },
  {
    id: "p5", slug: "windbreaker-jacket", name: "Windbreaker Jacket", category: "Outerwear", shape: "jacket",
    gender: "Men", season: "All-Season", price: 148, rating: 4.9, reviews: 540, badge: "New",
    colors: ["#1A1A1A", "#3A3B3F", "#5A5246"], sizes: ["S", "M", "L", "XL", "XXL"],
    fabric: "Ripstop with DWR",
    shortDesc: "A packable ripstop shell that shrugs off wind and rain.",
    description: "A packable performance shell in a lightweight ripstop with a water-repellent finish. Laser-cut vents, a storm hood, and a back zip pocket that doubles as a packable stuff sack.",
    bullets: ["Water-repellent ripstop (DWR)", "Laser-cut back vents", "Adjustable storm hood", "Packs into back pocket"],
    specs: { Fabric: "100% recycled ripstop nylon, DWR", Fit: "Relaxed", Weight: "Ultralight", Care: "Machine wash cold" },
    stock: 130, accent: "#1A1A1A",
  },
  {
    id: "p6", slug: "lined-training-shorts", name: "Lined Training Shorts", category: "Bottoms", shape: "shorts",
    gender: "Men", season: "Summer", price: 56, rating: 4.7, reviews: 1490, badge: null,
    colors: ["#1A1A1A", "#3A3B3F", "#EDEAE2"], sizes: ["S", "M", "L", "XL", "XXL"],
    fabric: "4-way stretch woven",
    shortDesc: "7-inch shorts with a built-in liner for high output.",
    description: "A 7-inch training short with a supportive built-in liner. A quick-dry 4-way stretch woven shell, zip pockets, and a laser-perforated back panel to dump heat.",
    bullets: ["Built-in support liner", "7\" inseam", "Zip secure pockets", "Laser-vented back"],
    specs: { Fabric: "90% poly, 10% elastane", Fit: "Athletic", Inseam: "7 inch", Care: "Machine wash cold" },
    stock: 340, accent: "#1A1A1A",
  },
  {
    id: "p7", slug: "seamless-leggings", name: "Seamless Leggings", category: "Bottoms", shape: "leggings",
    gender: "Women", season: "All-Season", price: 88, was: 110, rating: 4.9, reviews: 2640, badge: "Sale",
    colors: ["#1A1A1A", "#5A5246", "#7A6E62"], sizes: ["XS", "S", "M", "L", "XL"],
    fabric: "Sculpting seamless knit",
    shortDesc: "High-rise sculpting leggings with a squat-proof knit.",
    description: "High-rise seamless leggings engineered to sculpt and stay put. A squat-proof double knit, a contoured waistband that won't dig, and body-mapped panels that move with you.",
    bullets: ["Squat-proof double knit", "High contoured waistband", "Body-mapped sculpt panels", "Hidden waistband pocket"],
    specs: { Fabric: "76% nylon, 24% elastane", Fit: "Sculpting", Rise: "High", Care: "Machine wash cold" },
    stock: 410, accent: "#1A1A1A",
  },
  {
    id: "p8", slug: "womens-cropped-tee", name: "Women's Cropped Tee", category: "Tops", shape: "tee",
    gender: "Women", season: "Summer", price: 44, rating: 4.7, reviews: 980, badge: null,
    colors: ["#EDEAE2", "#1A1A1A", "#C9B7A4"], sizes: ["XS", "S", "M", "L", "XL"],
    fabric: "Pima-blend jersey",
    shortDesc: "A soft cropped training tee with a relaxed drape.",
    description: "A relaxed cropped tee in a breathable Pima-blend jersey. Soft enough for rest days, technical enough for the warm-up. Dropped shoulder, raw-edge hem, tonal logo.",
    bullets: ["Breathable Pima-blend jersey", "Cropped relaxed fit", "Dropped shoulder", "Raw-edge hem"],
    specs: { Fabric: "60% Pima cotton, 40% modal", Fit: "Relaxed crop", Weight: "Lightweight", Care: "Machine wash cold" },
    stock: 300, accent: "#EDEAE2",
  },
  {
    id: "p9", slug: "tactical-sling-bag", name: "Tactical Sling Bag", category: "Accessories", shape: "bag",
    gender: "Unisex", season: "All-Season", price: 72, rating: 4.8, reviews: 610, badge: "New",
    colors: ["#1A1A1A", "#3A3B3F", "#5A5246"], sizes: ["One size"],
    fabric: "Water-resistant Cordura",
    shortDesc: "A crossbody sling in rugged water-resistant Cordura.",
    description: "A streamlined crossbody sling built from rugged water-resistant Cordura. Magnetic quick-clip strap, a fleece-lined tech pocket, and enough room for the daily carry to and from the gym.",
    bullets: ["Water-resistant Cordura", "Magnetic quick-clip strap", "Fleece-lined tech pocket", "5L capacity"],
    specs: { Material: "600D water-resistant Cordura", Capacity: "5 L", Strap: "Adjustable magnetic clip", Care: "Wipe clean" },
    stock: 180, accent: "#1A1A1A",
  },
  {
    id: "p10", slug: "performance-cap", name: "Performance Cap", category: "Accessories", shape: "cap",
    gender: "Unisex", season: "Summer", price: 34, rating: 4.6, reviews: 720, badge: null,
    colors: ["#1A1A1A", "#EDEAE2", "#5A5246"], sizes: ["One size"],
    fabric: "Quick-dry ripstop",
    shortDesc: "A lightweight quick-dry cap with a curved brim.",
    description: "A lightweight running cap in quick-dry ripstop with laser-perforated panels and a sweat-wicking band. Curved brim, rear adjuster, reflective rear logo for low light.",
    bullets: ["Quick-dry ripstop", "Laser-perforated panels", "Sweat-wicking band", "Reflective rear logo"],
    specs: { Fabric: "100% quick-dry ripstop", Fit: "Adjustable", Brim: "Curved", Care: "Spot clean" },
    stock: 520, accent: "#1A1A1A",
  },
  {
    id: "p11", slug: "thermal-hooded-base", name: "Thermal Hooded Base", category: "Base Layers", shape: "longsleeve",
    gender: "Men", season: "Winter", price: 78, rating: 4.8, reviews: 430, badge: null,
    colors: ["#1A1A1A", "#2A3142"], sizes: ["S", "M", "L", "XL", "XXL"],
    fabric: "Brushed thermal knit",
    shortDesc: "A hooded thermal base layer for the coldest sessions.",
    description: "A brushed thermal base layer with an integrated balaclava hood for winter running. Grid-fleece interior traps warmth, while body-mapped venting stops overheating mid-effort.",
    bullets: ["Brushed grid-fleece interior", "Integrated balaclava hood", "Body-mapped venting", "Thumbhole cuffs"],
    specs: { Fabric: "90% poly, 10% elastane grid fleece", Fit: "Athletic", Weight: "Midweight", Care: "Machine wash cold" },
    stock: 160, accent: "#1A1A1A",
  },
  {
    id: "p12", slug: "cargo-tech-pants", name: "Cargo Tech Pants", category: "Bottoms", shape: "joggers",
    gender: "Men", season: "All-Season", price: 116, rating: 4.7, reviews: 380, badge: "New",
    colors: ["#3A3B3F", "#1A1A1A", "#5A5246"], sizes: ["S", "M", "L", "XL", "XXL"],
    fabric: "Ripstop stretch cargo",
    shortDesc: "Utility cargo pants in a stretch ripstop, gym to street.",
    description: "Utility-built cargo pants in a stretch ripstop that take a beating and keep moving. Bellowed cargo pockets, adjustable hem cinches, and a gusset for full range.",
    bullets: ["Stretch ripstop", "Bellowed cargo pockets", "Adjustable hem cinch", "Gusseted crotch"],
    specs: { Fabric: "94% nylon, 6% elastane ripstop", Fit: "Relaxed tapered", Rise: "Mid", Care: "Machine wash cold" },
    stock: 140, accent: "#3A3B3F",
  },
];
