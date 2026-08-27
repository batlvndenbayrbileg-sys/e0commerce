import type { Category, Shape } from "./types";

/**
 * Presentation metadata keyed by Medusa product handle.
 * Medusa is the source of truth for catalog, price, image and availability;
 * these fields enrich the storefront UX (category, accent, rating, badge, specs).
 */
export type Enrich = {
  category: Category;
  shape: Shape;
  gender: "Men" | "Women" | "Unisex";
  season: "Winter" | "Summer" | "All-Season";
  accent: string;
  fabric: string; // beauty: product type (Eau de Parfum, Serum, Lipstick…)
  bullets: string[];
  specs: Record<string, string>;
  rating: number;
  reviews: number;
  badge?: "Sale" | "New" | null;
  wasMultiplier?: number; // original price = price * multiplier
};

// Category accent tones (warm, beauty-appropriate)
const A = {
  Fragrance: "#B5643C",
  Skincare: "#4F9A86",
  Makeup: "#C03A57",
  Body: "#B08159",
  Gift: "#9A6BB0",
} as const;

export const ENRICH: Record<string, Enrich> = {
  // ── Үнэртэй ус (Fragrance) ──
  "edp-bloom": { category: "Fragrance", shape: "perfume", gender: "Women", season: "All-Season", accent: A.Fragrance, fabric: "Eau de Parfum", rating: 5.0, reviews: 32, badge: "New",
    bullets: ["Цэцгэн-мускийн зөөлөн аялгуу", "8+ цаг тогтвортой", "Сарнай, жасмин, мускийн нэгдэл"],
    specs: { "Төрөл": "Eau de Parfum", "Хэмжээ": "50ml / 100ml", "Аялгуу": "Цэцгэн, мускус", "Тогтворжилт": "8+ цаг" } },
  "edp-signature": { category: "Fragrance", shape: "perfume", gender: "Unisex", season: "All-Season", accent: A.Fragrance, fabric: "Eau de Parfum", rating: 5.0, reviews: 45, badge: "Sale", wasMultiplier: 1.29,
    bullets: ["Модлог, дулаан амбер аяс", "Унисекс — эрэгтэй/эмэгтэй", "Онцлох брэндийн үнэр"],
    specs: { "Төрөл": "Eau de Parfum", "Хэмжээ": "50ml / 100ml", "Аялгуу": "Модлог, амбер", "Тогтворжилт": "10+ цаг" } },
  "rose-elixir": { category: "Fragrance", shape: "perfume", gender: "Women", season: "All-Season", accent: A.Fragrance, fabric: "Parfum", rating: 4.9, reviews: 21, badge: null,
    bullets: ["Дамаск сарнайн ханд", "Тансаг эмэгтэй парфюм", "Урт хугацаанд тогтвортой"],
    specs: { "Төрөл": "Parfum", "Хэмжээ": "50ml", "Аялгуу": "Сарнай, пион", "Тогтворжилт": "12+ цаг" } },
  "citrus-cologne": { category: "Fragrance", shape: "perfume", gender: "Unisex", season: "Summer", accent: A.Fragrance, fabric: "Eau de Cologne", rating: 4.7, reviews: 54, badge: null,
    bullets: ["Нимбэг, бергамотын сэргэг үнэр", "Өдөр тутмын хөнгөн хэрэглээ", "Зусланд тохиромжтой"],
    specs: { "Төрөл": "Eau de Cologne", "Хэмжээ": "100ml", "Аялгуу": "Цитрус, ногоон", "Тогтворжилт": "4–6 цаг" } },

  // ── Арьс арчилгаа (Skincare) ──
  "glow-serum": { category: "Skincare", shape: "serum", gender: "Unisex", season: "All-Season", accent: A.Skincare, fabric: "Serum", rating: 5.0, reviews: 24, badge: "New",
    bullets: ["Гиалурон хүчил + ниацинамид", "Гэрэлтүүлэг өгч, чийгшүүлнэ", "Бүх төрлийн арьсанд"],
    specs: { "Төрөл": "Гэрэлтүүлэгч ханд", "Хэмжээ": "30ml", "Найрлага": "Hyaluronic, Niacinamide", "Хэрэглээ": "Өглөө/орой" } },
  "vitc-serum": { category: "Skincare", shape: "serum", gender: "Unisex", season: "All-Season", accent: A.Skincare, fabric: "Serum", rating: 4.8, reviews: 38, badge: null,
    bullets: ["15% Витамин C", "Толбо арилгаж, тэгшитгэнэ", "Өглөө хэрэглэхэд тохиромжтой"],
    specs: { "Төрөл": "Гэрэлтүүлэгч ханд", "Хэмжээ": "30ml", "Найрлага": "Vitamin C 15%", "Хэрэглээ": "Өглөө" } },
  "hydra-cream": { category: "Skincare", shape: "cream", gender: "Unisex", season: "Winter", accent: A.Skincare, fabric: "Cream", rating: 4.9, reviews: 29, badge: null,
    bullets: ["Керамид, ши тос", "Гүн чийгшүүлэгч", "Хуурай, мэдрэмтгий арьсанд"],
    specs: { "Төрөл": "Чийгшүүлэгч тос", "Хэмжээ": "50ml", "Найрлага": "Ceramide, Shea", "Хэрэглээ": "Өглөө/орой" } },
  "cleansing-foam": { category: "Skincare", shape: "cleanser", gender: "Unisex", season: "All-Season", accent: A.Skincare, fabric: "Cleanser", rating: 4.6, reviews: 61, badge: null,
    bullets: ["Зөөлөн угаагч хөөс", "Арьсыг чангалахгүй", "Өдөр бүрийн цэвэрлэгээнд"],
    specs: { "Төрөл": "Угаагч хөөс", "Хэмжээ": "150ml", "Найрлага": "Amino-acid", "Хэрэглээ": "Өглөө/орой" } },

  // ── Гоо сайхан (Makeup) ──
  "lip-velvet-nude": { category: "Makeup", shape: "lipstick", gender: "Women", season: "All-Season", accent: A.Makeup, fabric: "Lipstick", rating: 5.0, reviews: 27, badge: "New",
    bullets: ["Хилэн мэт матт өнгөлгөө", "Чийгшүүлэгч найрлага", "Бүдэг ягаан (nude) өнгө"],
    specs: { "Төрөл": "Уруулын будаг", "Өнгө": "Nude", "Өнгөлгөө": "Матт", "Хэрэглээ": "Уруулд" } },
  "lip-matte-ruby": { category: "Makeup", shape: "lipstick", gender: "Women", season: "All-Season", accent: A.Makeup, fabric: "Lipstick", rating: 4.9, reviews: 33, badge: null,
    bullets: ["Тод улаан матт", "Урт хугацаанд тогтвортой", "Хатаахгүй найрлага"],
    specs: { "Төрөл": "Уруулын будаг", "Өнгө": "Ruby", "Өнгөлгөө": "Матт", "Хэрэглээ": "Уруулд" } },
  "silk-foundation": { category: "Makeup", shape: "foundation", gender: "Women", season: "All-Season", accent: A.Makeup, fabric: "Foundation", rating: 4.7, reviews: 48, badge: null,
    bullets: ["Байгалийн өнгө", "Дунд зэргийн бүрхүүл", "Арьсыг гөлгөр харагдуулна"],
    specs: { "Төрөл": "Шингэн суурь", "Өнгө": "Natural / Beige / Sand", "Бүрхүүл": "Дунд", "Хэрэглээ": "Нүүрэнд" } },
  "volume-mascara": { category: "Makeup", shape: "mascara", gender: "Women", season: "All-Season", accent: A.Makeup, fabric: "Mascara", rating: 4.8, reviews: 40, badge: null,
    bullets: ["Эзэлхүүн, урт өгнө", "Хунхрахгүй", "Ус тэсвэртэй"],
    specs: { "Төрөл": "Сормуусны будаг", "Өнгө": "Black", "Онцлог": "Ус тэсвэртэй", "Хэрэглээ": "Сормуусанд" } },

  // ── Бие арчилгаа (Body) ──
  "body-lotion-silk": { category: "Body", shape: "lotion", gender: "Unisex", season: "All-Season", accent: A.Body, fabric: "Body lotion", rating: 4.9, reviews: 18, badge: "Sale", wasMultiplier: 1.18,
    bullets: ["Торго мэт зөөлөн мэдрэмж", "Хурдан шингэдэг", "Урт хугацаанд чийгшүүлнэ"],
    specs: { "Төрөл": "Биеийн тос", "Хэмжээ": "250ml", "Найрлага": "Shea, Glycerin", "Хэрэглээ": "Биед" } },
  "shower-gel-vanilla": { category: "Body", shape: "showergel", gender: "Unisex", season: "All-Season", accent: A.Body, fabric: "Shower gel", rating: 4.7, reviews: 22, badge: null,
    bullets: ["Ваниль үнэртэй", "Зөөлөн шүршүүрийн гель", "Арьсыг цэвэрлэж тэжээнэ"],
    specs: { "Төрөл": "Шүршүүрийн гель", "Хэмжээ": "300ml", "Үнэр": "Ваниль", "Хэрэглээ": "Биед" } },

  // ── Бэлгийн багц (Gift) ──
  "premium-gift-set": { category: "Gift", shape: "giftset", gender: "Unisex", season: "All-Season", accent: A.Gift, fabric: "Gift set", rating: 4.9, reviews: 16, badge: "Sale", wasMultiplier: 1.30,
    bullets: ["Парфюм, ханд, биеийн тос", "Тансаг бэлгийн боодол", "Бэлэн дурсгал"],
    specs: { "Төрөл": "Бэлгийн багц", "Багтаамж": "3 бүтээгдэхүүн", "Боодол": "Бэлэн", "Тохиромж": "Бэлэг" } },
  "skincare-starter-kit": { category: "Gift", shape: "giftset", gender: "Unisex", season: "All-Season", accent: A.Gift, fabric: "Gift set", rating: 4.8, reviews: 19, badge: null,
    bullets: ["Угаагч + ханд + тос", "Арьс арчилгааны эхлэл", "Аяллын хэмжээтэй"],
    specs: { "Төрөл": "Арьс арчилгааны багц", "Багтаамж": "3 бүтээгдэхүүн", "Онцлог": "Эхлэгчид", "Тохиромж": "Бэлэг" } },
};

export const DEFAULT_ENRICH: Enrich = {
  category: "Skincare", shape: "cream", gender: "Unisex", season: "All-Season", accent: "#B5643C",
  fabric: "Гоо сайхны бүтээгдэхүүн", rating: 4.7, reviews: 20, badge: null,
  bullets: ["Чанартай найрлага", "Өдөр тутмын арчилгаанд"], specs: { "Хэрэглээ": "Заавраар" },
};
