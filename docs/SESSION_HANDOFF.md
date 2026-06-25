# VEXO — Session Handoff (2026-06-25, шинэчилсэн)

Дараагийн session-д энэ файлыг хамгийн түрүүнд уншуул.

---

## 🟢 Одоогийн төлөв (бүгд live)
- **Storefront:** Next.js 14 (App Router) → Vercel — https://e0commerce-web.vercel.app
- **Backend:** Medusa v2 → Railway (Postgres 16 + Redis 7)
- **Repo:** https://github.com/batlvndenbayrbileg-sys/e0commerce — branch `main`
- **Сүүлийн commit:** `ef7f796` — Polish (size guide, real colour filter, mobile zoom, focus-trap)
- **Төлбөр:** Wire Payment (QPay + Монгол банкны апп), одоогоор MOCK горим
- **Имэйл:** Resend (mock/deployed), **Үнэ:** MNT (₮), USD→MNT = 3450
- **Inventory:** Medusa-д track хийгддэг, "Дууссан" badge ажилладаг
- Бодит туршилтын захиалга амжилттай орсон (NT-2, ₮144,900)

---

## ✅ ДУУССАН ажил (commit-ийн дарааллаар)

| Шат | Юу хийсэн | Commit |
|---|---|---|
| **i18n Phase 1** | Бүх хуудас MN/EN: Product+AddToCart+Tabs, Cart, Checkout, Success/Processing, Auth, Account, Shop, MobileTabBar | `c351892` |
| **Sprint 0** | "Хуурамч" UI бодитоор: Nav хайлт → `/shop?q=`, sort auto-submit, үнэ/өнгө/технологи шүүлтүүр, gender+filter(new\|sale) param, aria-label i18n, `prefers-reduced-motion` guardrail | `6c87df4` |
| **Sprint 1** | Cart drawer (slide-in), add-to-cart нисэх анимаци + badge spring, PDP sticky mobile CTA, skeleton shimmer | `1e08a09` |
| **Sprint 2** | Page transition (fade), number count-up, PDP hover-zoom, Reveal өргөтгөл | `90866ff` |
| **A11y pass** | focus-visible ring, skip link + `<main>`, ⌘K/`/` хайлт, drawer focus mgmt, qty aria-label, контраст (`subtle` #8A8F93→#72767A) | `e04f52b` |
| **Quick view** | Картаас hover → modal (Sprint 2 дуусгасан) | `3b060e2` |
| **Polish** | Size guide modal, өнгөний шүүлтүүр бодит accent-ээс, mobile PDP tap-zoom, бүх overlay-д focus-trap (`useFocusTrap`) | `ef7f796` |

### Шинэ дэд бүтэц (дараагийн хүн мэдэх ёстой)
- **i18n:** `web/lib/i18n.ts` (толь, EN+MN), `web/lib/lang.ts` (server `getServerT`), `web/components/LangProvider.tsx` (client `useT`).
- **State:** `web/lib/store.ts` — `useCart`, `useWish`, `useAuth`, `useToast`, `useOrders`, **`useUI`** (cart drawer), **`useFly`** + `flyToCart()` (нисэх анимаци), **`useQuickView`** (modal).
- **Шинэ компонент:** `CartDrawer`, `QuickViewModal`, `FlyLayer`, `Skeleton`, `CountUp`, `app/template.tsx` (page transition), `app/product/[id]/_Gallery.tsx` (zoom), `app/shop/_ShopControls.tsx` (sort/filter).
- **Шүүлтүүрийн логик:** `web/lib/medusa.ts` → `products.list` нь `category, q, sort, gender, filter, color, tech, minPrice, maxPrice` дэмждэг (client-side, 12 бараа).

> ⚠️ **Build дүрмүүд (мартвал build унана):**
> 1. `lib/lang.ts` (`getServerT`) нь `next/headers` ашигладаг → **зөвхөн server component**. Client component (cart, account, drawer г.м.) дотор `useT()`-г `LangProvider`-аас ав.
> 2. **Page transition нь зөвхөн opacity** (`app/template.tsx`). Transform/filter нэмбэл containing-block үүсгээд PDP-ийн `fixed` sticky CTA эвдэрнэ. PDP-ийн fixed элементийн өвөг (ancestor) дээр transform-той Reveal битгий тавь.

---

## ⬜ Үлдсэн polish (заавал биш, эрэмбээр)
1. **Hero carousel polish** — parallax, drag inertia (`web/components/HeroCarousel.tsx`).
2. **Lighthouse аудит** — браузер/CI дээр ажиллуулж a11y/perf оноо баталгаажуулах (код талаас гол алдаанууд зассан).
3. **Олон зураг** — бараа бүр 1 зурагтай (Medusa thumbnail). PDP gallery-ийн 4 thumbnail одоо ижил зураг; бодит олон зураг нэмбэл жинхэнэ gallery болно.

✅ **Дуусгасан** (өмнө энд байсан): size guide modal, mobile PDP zoom, overlay focus-trap, өнгөний шүүлтүүр бодит accent-ээс.

## ⬜ Production (нууц түлхүүр шаардлагатай — НАДТАЙ БИТГИЙ ХУВААЛЦ)
- **Wire** MOCK → бодит горим (бодит QPay keys, Railway/Vercel env дотор).
- **Resend** бодит API key.

Дэлгэрэнгүй UI төлөвлөгөө: `docs/UI_IMPROVEMENT_PLAN.md`

---

## 🔧 Хэрэгтэй командууд
```bash
# Web локал dev
cd web && npm run dev          # :3000

# Web build шалгах (push хийхээс өмнө ЗААВАЛ)
cd web && npm run build

# Medusa backend (Docker)
cd medusa-backend && docker compose up -d   # Postgres :5433, Redis, Medusa :9000

# Push (Vercel auto-deploy triggers)
git add -A && git commit -m "..." && git push origin main
```

## 🧪 Headless шалгалт (browser-гүй, SSR HTML дээр)
Shop нь бүхэлдээ SSR тул шүүлтүүр/sort/хайлтыг curl-ээр шалгаж болно:
```bash
# Бүтээгдэхүүний картын тоо тоолох
curl -s "https://e0commerce-web.vercel.app/shop?gender=Men" | grep -oE 'href="/product/[^"]+"' | sort -u | wc -l
```
Drawer/fly/zoom/quick-view зэрэг **client interaction** нь нүдээр (эсвэл Chrome MCP) шалгана.

## ⚠️ Анхаарах
- Нууц түлхүүр (admin password, Wire keys, Resend key) **надтай битгий хуваалц** — env/Railway/Vercel дотор шууд тавь.
- Build амжилттай (EXIT=0) болсон тохиолдолд л push хий — эвдэрсэн build шууд live-д нөлөөлнө.
- Postgres native host дээр 5432 дээр зөрчилддөг тул Docker нь **5433** ашигладаг.
