# VEXO — UI/UX Improvement Plan (Mongolian + Motion + Interactivity)

Goal: Mongolian-localized, animated, highly interactive storefront — without breaking the
live Medusa/Wire/MNT stack. Built on the existing Next.js 14 + Tailwind + Framer Motion base.

---

## ✅ STATUS (2026-06-25) — Phase 1–4 гол хэсэг ДУУССАН, live

- **Phase 1 (i18n):** ✅ бүх хуудас MN/EN. `c351892`
- **Phase 2 (UX):** ✅ cart drawer, ✅ ажилладаг хайлт, ✅ ажилладаг шүүлтүүр (бодит өнгө), ✅ PDP zoom
  (desktop hover + mobile tap), ✅ mobile sticky CTA, ✅ quick view, ✅ skeletons, ✅ size guide modal. `6c87df4`,`1e08a09`,`3b060e2`,`ef7f796`
- **Phase 3 (Animation):** ✅ page transition (opacity), ✅ add-to-cart fly, ✅ cart badge spring,
  ✅ count-up, ✅ reveal өргөтгөл, ✅ hero carousel parallax. `90866ff`,`cc30341`
- **Phase 4 (A11y):** ✅ focus-visible, ✅ skip link + `<main>`, ✅ keyboard (⌘K/`/`, Esc),
  ✅ aria labels, ✅ reduced-motion, ✅ контраст (AA), ✅ overlay focus-trap,
  ✅ **Lighthouse a11y = 100 (Home/Shop/PDP)**. `e04f52b`→`a7fb8a7`

Дэлгэрэнгүй commit/үлдсэн ажил: `docs/SESSION_HANDOFF.md`.

---

## Phase 1 — Mongolian localization (i18n) 🇲🇳

**The #1 ask. Make every UI string switchable EN ⇄ MN.**

| Task | Files | Notes |
|---|---|---|
| Cyrillic-capable display font | `app/layout.tsx`, `globals.css`, `tailwind.config.ts` | ⚠️ `Archivo Black` has **no Cyrillic** — MN headings would break. Switch display to **Rubik** / **Oswald** / **Geologica** (heavy + Cyrillic). Keep Archivo for Latin if desired. |
| Dictionary + `t()` helper | `lib/i18n.ts`, `lib/useLang.ts` (zustand, persisted) | Lightweight: `t("nav.shop")` → MN/EN. No route change needed. (Upgrade to `next-intl` later for `/mn` `/en` SEO.) |
| Translate UI chrome | Nav, Footer, ProductCard, cart, checkout, account, auth, success | All hardcoded strings → `t(...)`. ~120 strings. |
| Language switcher | `Nav.tsx` (EN/МН toggle pill) | Persists in localStorage. |
| Product content (MN) | Medusa product `metadata.name_mn`, `description_mn` | Storefront shows MN name/desc when lang=MN, else English. Edit in admin. |
| Currency/number/date | `lib/format.ts` | MN locale formatting (`₮`, `2026 оны...`). |

**Effort:** 1–1.5 days · **Impact:** 🔥🔥🔥 (core requirement)

---

## Phase 2 — Core UX upgrades

| Task | What | Impact |
|---|---|---|
| **Cart drawer** | Slide-in cart panel (instead of full `/cart` page) — add to bag → drawer opens with item | 🔥🔥🔥 |
| **Working search** | ⌘K / search overlay → live product filter (MeiliSearch or client-side over 12) | 🔥🔥 |
| **Working filters** | Shop filters (price/colour/size) actually filter (currently decorative) | 🔥🔥 |
| **PDP gallery + zoom** | Thumbnail switch + hover/pinch zoom on product image | 🔥🔥 |
| **Sticky mobile CTA** | "Add to bag" bar pinned to bottom on mobile PDP | 🔥🔥 |
| **Quick view** | Tap product card → quick-view modal (no full navigation) | 🔥 |
| **Skeletons** | Loading shimmer for product grid / PDP while fetching | 🔥 |
| **Size guide modal** | Real size chart (cm/inch) on PDP | 🔥 |

**Effort:** 2–3 days · **Impact:** 🔥🔥🔥

---

## Phase 3 — Animations & micro-interactions (Framer Motion)

| Task | Effect |
|---|---|
| **Page transitions** | Fade/slide between routes (`template.tsx`) |
| **Add-to-cart fly** | Product image flies into the cart icon + badge bounce |
| **Staggered reveals** | Sections/cards rise on scroll (extend existing `Reveal`) |
| **Number count-up** | Stats (5M+, prices, cart total) animate up |
| **Hero carousel polish** | Parallax, smoother auto-advance, drag inertia |
| **Hover depth** | Product cards tilt/scale, image zoom, shimmer (have basic) |
| **Toast polish** | Spring toasts with icons (have basic) |
| **Skeleton shimmer** | Animated gradient placeholders |
| **Cart badge** | Pulse on change |

**Effort:** 1.5–2 days · **Impact:** 🔥🔥 (premium feel)
**Guardrail:** respect `prefers-reduced-motion`; keep animations 150–400ms; never block interaction.

---

## Phase 4 — Polish & accessibility

| Task | What |
|---|---|
| Empty/error states | Cart empty, no search results, failed fetch — friendly MN copy |
| Focus & keyboard | Visible focus rings, tab order, ⌘K, Esc closes drawers |
| `aria` labels | Icons, buttons, forms (MN/EN) |
| Reduced motion | Honor OS setting |
| Lighthouse a11y ≥ 95 | Contrast, alt text, semantics |

**Effort:** 1 day · **Impact:** 🔥 (quality + reach)

---

## Recommended order
1. **Phase 1 (Mongolian)** — the explicit ask; do font + i18n first.
2. **Cart drawer + add-to-cart fly** (Phase 2+3 combo) — biggest "wow" + conversion.
3. **Working search + filters** — real interactivity.
4. **Page transitions + reveals + count-ups** — premium polish.
5. **PDP gallery/zoom + sticky CTA + size guide.**
6. **Phase 4 a11y pass.**

## Key decisions to confirm
- **Font**: Rubik (rounded, friendly) vs Oswald (condensed, athletic) for Cyrillic display? — affects whole look.
- **Default language**: MN-first or EN-first with toggle?
- **Product content**: translate the 12 products to MN in admin, or keep names English?
- **i18n depth**: lightweight dictionary now, or full `next-intl` with `/mn` `/en` routes (better SEO)?

---

*Each phase ships independently and deploys via the existing GitHub → Vercel/Railway pipeline.*
