# VEXO — Session Handoff (2026-06-25, шинэчилсэн)

Дараагийн session-д энэ файлыг хамгийн түрүүнд уншуул.

---

## 🟢 Одоогийн төлөв (бүгд live)
- **Storefront:** Next.js 14 (App Router) → Vercel — https://e0commerce-web.vercel.app
- **Backend:** Medusa v2 → Railway (Postgres 16 + Redis 7)
- **Repo:** https://github.com/batlvndenbayrbileg-sys/e0commerce — branch `main`
- **Сүүлийн commit:** `8d387c0` — Design elevation (Phase 0–5): perf, motion, card v2
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
| **Hero + gallery** | Carousel parallax + "Shop now" i18n; бодит олон зурагтай PDP gallery (`images[]`, thumbnail сонголт) | `cc30341` |
| **Lighthouse a11y → 100** | Headless Lighthouse-аар Home/Shop/PDP бүгд **100**: badge/CTA/tab/promo-д ink текст (accent+цагаан 2.86:1 унадаг байсан), `subtle`→#5C6166, select/link/lang aria, carousel цэгийн 24px target, үнэ accent-deep | `1c803cf`→`a7fb8a7` |

> ⚠️ **Брэндийн өөрчлөлт:** accent (улбар #FF6A1A) дээрх **бүх текст одоо бараан (ink)** — btn-primary, badge, идэвхтэй tab, promo banner, hero "Shop now". Учир нь цагаан-улбар = 2.86:1 (AA унана), бараан-улбар = ~6.9:1. Хэрэв цагаан CTA текст заавал хэрэгтэй бол accent-ийг гүн болгох (#B5470A орчим) хэрэгтэй болно.

### 🎨 Дизайн өргөтгөл (Phase 0–5, senior designer pass)
| Юу | Commit |
|---|---|
| **Clean studio палитр** (neutral near-white, улбар ганц accent) | `aaeca70` |
| **next/font** (self-host, FOUT арилгах) + `Photo` responsive Unsplash srcset + hero priority | `706d966` |
| **Trust value-props зурвас** (`ValueProps`) + **brand marquee** | `20cb8a1` |
| **Lenis гөлгөр скролл** (`SmoothScroll`, overlay+reduced-motion aware) | `897362c` |
| **Product card v2** — нэр/ангилал/үнэ зургийн доор (clean editorial) | `8d387c0` |
| **Perf засвар:** page-transition нь LCP-г нуудаг байсныг зассан (6.0→3.8s) | `166b95b` |

**Хэмжсэн:** Lighthouse mobile — Performance **87**, LCP **3.8s**, CLS **0**, A11Y **100** (Home/Shop/PDP).

> ⚠️ **Build gotcha 3:** breakpoint grid (`grid lg:grid-cols-2`) нь мобайлд **`grid-cols-1`** суурьгүй бол `auto` track контентоор ургаж хэвтээ overflow үүсгэдэг. Шинэ grid бүрд `grid grid-cols-1 lg:grid-cols-*` бич.
> ⚠️ **Build gotcha 4:** `app/template.tsx` page-transition нь `initial={{opacity:0}}`-г SSR-д гаргавал LCP-г нуудаг — эхний paint-д харагдуулж, зөвхөн навигацид fade хий (одоогийн код ингэсэн).

**Үлдсэн polish:** nav scroll-condense (shop/account-ийн sticky toolbar-тай зөрчилддөг тул болгоомжтой), PDP-г илүү editorial, LCP<2.5s болгох (hero-д `next/image`/preload).

### Шинэ дэд бүтэц (дараагийн хүн мэдэх ёстой)
- **i18n:** `web/lib/i18n.ts` (толь, EN+MN), `web/lib/lang.ts` (server `getServerT`), `web/components/LangProvider.tsx` (client `useT`).
- **State:** `web/lib/store.ts` — `useCart`, `useWish`, `useAuth`, `useToast`, `useOrders`, **`useUI`** (cart drawer), **`useFly`** + `flyToCart()` (нисэх анимаци), **`useQuickView`** (modal).
- **Шинэ компонент:** `CartDrawer`, `QuickViewModal`, `FlyLayer`, `Skeleton`, `CountUp`, `app/template.tsx` (page transition), `app/product/[id]/_Gallery.tsx` (zoom), `app/shop/_ShopControls.tsx` (sort/filter).
- **Шүүлтүүрийн логик:** `web/lib/medusa.ts` → `products.list` нь `category, q, sort, gender, filter, color, tech, minPrice, maxPrice` дэмждэг (client-side, 12 бараа).

> ⚠️ **Build дүрмүүд (мартвал build унана):**
> 1. `lib/lang.ts` (`getServerT`) нь `next/headers` ашигладаг → **зөвхөн server component**. Client component (cart, account, drawer г.м.) дотор `useT()`-г `LangProvider`-аас ав.
> 2. **Page transition нь зөвхөн opacity** (`app/template.tsx`). Transform/filter нэмбэл containing-block үүсгээд PDP-ийн `fixed` sticky CTA эвдэрнэ. PDP-ийн fixed элементийн өвөг (ancestor) дээр transform-той Reveal битгий тавь.

---

## ⬜ Үлдсэн зүйл (заавал биш)
1. **Performance / SEO Lighthouse** — a11y = 100 болсон; perf/SEO/best-practices категориудыг мөн шалгаж сайжруулж болно.
2. **Контент: олон зураг** — Medusa admin-д бараа бүрт олон зураг оруулбал PDP gallery автоматаар бодит thumbnail-уудыг харуулна (код бэлэн, `images[]`). Одоо ихэнх бараа 1 зурагтай тул thumbnail strip нуугдана.
3. **Cart/Checkout/Account/Auth** хуудсуудыг тус бүр Lighthouse-аар шалгах (ижил засагдсан компонент ашигладаг тул 100 байх магадлал өндөр, гэхдээ нэг бүрчлэн баталгаажуулаагүй).

✅ **Бүгд дуусгасан:** size guide, mobile zoom, focus-trap, бодит өнгөний шүүлтүүр, hero parallax, multi-image gallery, **Lighthouse a11y = 100 (Home/Shop/PDP)**.

## 🧪 Lighthouse дахин ажиллуулах (энэ машинд Chrome суусан)
```bash
npx -y lighthouse "https://e0commerce-web.vercel.app/shop" --only-categories=accessibility \
  --output=json --output-path=stdout --chrome-flags="--headless=new --no-sandbox" --quiet
```

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
