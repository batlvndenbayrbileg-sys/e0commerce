# VEXO — Production Build Plan (Next.js → Medusa)

End-to-end engineering plan to evolve the current Next.js + Express prototype into a production-grade, Medusa-backed headless commerce platform.

---

## Phased execution roadmap (status)

| Phase | Scope | Stack | Status |
|---|---|---|---|
| **P0 — MVP storefront** | Mobile-first UI, carousel hero, catalog, cart, checkout, auth, profile, validation, responsive | Next.js 14 + Express + Zustand + JWT | ✅ **Done** |
| **P1 — Backend foundation** | Docker Postgres + Redis, Medusa v2 scaffolded + migrated, admin user, USD region, VEXO catalog seeded, store API, storefront product reads via Medusa | Medusa v2 · Postgres · Redis | ✅ **Done (current build)** |
| **P2 — Catalog & content** | Real product taxonomy, Cloudflare R2 images, `next/image` AVIF/WebP, MeiliSearch instant search | Medusa · R2 · MeiliSearch | ⬜ |
| **P3 — Commerce engine** | ✅ Medusa cart→order flow, US region + shipping, real orders, order history, Medusa customer auth, **Wire Payment (QPay + Mongolian bank apps) — PaymentIntent → hosted checkout → webhook/poll → completes Medusa order**. ⬜ Remaining: inventory/backorder | Wire · Medusa workflows | ✅ **Done** |
| **P4 — Ops & launch** | Resend emails, abandoned-cart cron, SEO + structured data, i18n, GDPR, k6 load test, soft launch | Resend · Sentry · Axiom | ⬜ |

**CI/CD (cross-phase):** GitHub Actions — PR: lint + typecheck + unit + Lighthouse CI · merge→preview (Vercel + Railway) · tag→staging · manual gate→prod · auto-rollback at >1% 5xx for 2 min. Migrations (`medusa db:migrate`) gated behind release approval with verified backup/rollback.

### P0 — what shipped in the current build
- Mobile-first responsive storefront, swipe carousel hero (auto-advance, dots, no arrows)
- Vibrant streetwear design system (orange accent, warm ambient, Archivo Black display)
- Catalog via Express API (filter/sort/search), 12 products with real photography + graceful fallback
- Cart + wishlist (Zustand + localStorage), checkout → order POST (Zod-validated), order success
- JWT auth (bcrypt) with client-side validation + inline errors
- Tabbed account: Overview / Orders / Wishlist / Addresses / Settings (live data)
- Footer hidden on mobile; mobile tab bar with active state

### P1 — what shipped
- `infra/docker-compose.yml` — Postgres 16 (host port **5433**, avoids native 5432) + Redis 7, both healthchecked
- `medusa-backend/` — Medusa v2 (Turborepo), migrated against Postgres, admin created locally with `npx medusa user -e <email> -p <password>` (dev only — never reuse a dev password in production), admin at http://localhost:9000/app
- USD region + store currency, **12 VEXO products seeded** (`src/scripts/seed-vexo.ts`), demo products removed
- Storefront product reads (home / shop / product) now come from **Medusa store API** via `web/lib/medusa.ts` (publishable key + region), merged with `web/lib/enrich.ts` for presentation metadata (fabric, specs, rating, visual shape)
- Toggle: `NEXT_PUBLIC_USE_MEDUSA` (1 = Medusa, 0 = legacy Express). Cart + auth + order creation remain on Express until **P3**.

**Run order (dev):** `docker compose -f infra/docker-compose.yml up -d` → (in `medusa-backend/apps/backend`) `npm run dev` (:9000) → (repo root) `npm run dev` (web :3000 + api :4000).

### P3 (core) — what shipped
- US service zone + Standard/Express shipping options in USD (`src/scripts/seed-shipping.ts`)
- `web/lib/medusa.ts` `checkout()` runs the full Medusa store flow: create cart → set address → shipping method → payment collection → **system payment session** → complete → real order
- Checkout page submits through Medusa (Express order endpoint retired); cart line items carry Medusa `variantId` (size-aware)
- Order history persisted client-side (`useOrders`) and shown in the account "Orders" tab; success page shows order number + total
- **Medusa customer auth** (`web/lib/medusa.ts` `auth.login/signup/me`): register → create customer → login → `/store/customers/me`. Storefront `api.auth.*` routes to Medusa via `NEXT_PUBLIC_USE_MEDUSA`. Register a local test customer as needed (no shared demo password committed).
- **Express API (:4000) is now fully off the storefront critical path** — products, cart, orders, and auth all run through Medusa. Express remains only as a legacy fallback (`NEXT_PUBLIC_USE_MEDUSA=0`).
### P3 — Wire Payment (QPay) integration
- **No Stripe** — uses **Wire Payment** (https://wire.mn): QPay + all Mongolian bank apps.
- `api/src/lib/wire.ts` — Wire client (PaymentIntent, hosted checkout, webhook HMAC verify, idempotency). **MOCK mode** when `WIRE_SECRET_KEY` is empty (auto-succeeds after 5s for dev/demo); set `sk_live_…` for real QPay.
- `api/src/routes/payments.ts` — `POST /api/payments/intent` (create intent + checkout), `GET /api/payments/intent?id=` (poll → completes Medusa cart on success), `POST /api/webhooks/wire` (raw-body HMAC verified, IP allowlisted, idempotent).
- Flow: storefront `prepareCart` (Medusa) → `wire.createIntent` (Express) → live redirect to `pay.wire.mn` *or* mock → `/checkout/processing` polls → Express completes Medusa cart → real order → success.
- Verified end-to-end in mock: prepared cart → intent → poll → **order NT-4 created in Medusa**.
- Go live: set `WIRE_SECRET_KEY=sk_live_…`, `WIRE_WEBHOOK_SECRET`, register webhook `…/api/webhooks/wire` in the Wire dashboard, price in MNT.
- Remaining P3: inventory/backorder management.

> The sections below are the detailed P2–P4 spec for the Medusa migration.

---

## 0. Executive summary

| | |
|---|---|
| **Goal** | Replace the in-memory Express API with a production-grade Medusa v2 backend, retain the premium Next.js storefront, and ship a fully operable e-commerce platform end-to-end. |
| **Timeline** | 12 weeks (3 month sprint), 4 phases × ~3 weeks each |
| **Stack** | Medusa v2 · PostgreSQL · Redis · Next.js 14 (App Router) · Stripe · MeiliSearch · Cloudflare R2 · Resend · Vercel + Railway |
| **Headcount target** | 1 backend, 1 frontend, 1 designer (part), 1 DevOps (part) |
| **Outcome** | Live store at `nitec.audio` selling real products, with Admin, payments, fulfillment, search, email, analytics, SEO, and a CI/CD pipeline |

### Why Medusa (vs. alternatives)

| Option | Verdict |
|---|---|
| **Medusa v2** | ✅ TypeScript end-to-end, modular architecture, MIT license, owns the data, no per-order fees, full headless flexibility |
| Shopify Plus / Hydrogen | Fast but $2k+/mo, vendor lock-in, custom logic requires Functions DSL |
| Saleor (GraphQL) | Solid but Python codebase splits our stack |
| Vendure (TS, GraphQL) | Comparable to Medusa; we choose Medusa for REST-first ergonomics and broader plugin ecosystem |
| Build our own | Re-inventing core commerce primitives is a year of work — not justified |

---

## 1. Target Architecture

```
                     ┌────────────────────────────────────────┐
                     │            CDN  (Cloudflare)           │
                     │       images · static · edge cache     │
                     └────────────────┬───────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
        ┌─────▼──────┐         ┌──────▼────────┐       ┌──────▼──────┐
        │  Browser   │         │  Mobile / PWA │       │   Crawlers  │
        └─────┬──────┘         └──────┬────────┘       └─────────────┘
              │                       │
              │              ┌────────▼─────────┐
              └──────────────▶  Storefront      │   Next.js 14 (App Router)
                             │  (Vercel Edge)   │   ISR + Streaming SSR
                             └────────┬─────────┘   @medusajs/js-sdk
                                      │
                                      ▼
         ┌────────────────────────────────────────────────────────┐
         │                Medusa Server  (Railway)                │
         │  ┌───────────────────────────────────────────────────┐ │
         │  │  /store API  ·  /admin API  ·  Admin React Panel  │ │
         │  └───────────────────────────────────────────────────┘ │
         │  Modules: product · pricing · inventory · cart · order │
         │           customer · payment · fulfillment · auth      │
         │  Workflows · Subscribers · Custom links · Job scheduler│
         └────────┬───────────┬──────────────┬─────────────┬──────┘
                  │           │              │             │
         ┌────────▼──┐  ┌─────▼─────┐  ┌─────▼──────┐  ┌──▼──────────┐
         │ Postgres  │  │   Redis   │  │   Stripe   │  │  MeiliSearch│
         │  (Neon)   │  │ (Upstash) │  │  Payments  │  │   (cloud)   │
         └───────────┘  └───────────┘  └────────────┘  └─────────────┘

         ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐
         │ Cloudflare R2│  │   Resend     │  │   Sentry + Axiom   │
         │   files/cdn  │  │  email tx    │  │  errors + logs     │
         └──────────────┘  └──────────────┘  └────────────────────┘
```

### Service responsibilities

| Service | What it owns |
|---|---|
| **Storefront (Next.js)** | Public site, ISR, SEO, image optimization, cart UI, checkout UI |
| **Medusa Server** | Business logic, data, /store + /admin APIs, jobs, webhooks |
| **Admin Panel** | Built into Medusa Server, gated by JWT, for ops team |
| **Postgres** | System of record. Daily snapshot + PITR |
| **Redis** | Job queue (BullMQ), session cache, idempotency keys |
| **Stripe** | Payment authorization, capture, refunds, 3DS |
| **MeiliSearch** | Product search, typo tolerance, faceted filtering |
| **Cloudflare R2** | Product images, lifestyle photography, downloadable assets |
| **Resend** | Transactional email (order confirmation, shipping, password reset) |
| **Sentry / Axiom** | Error tracking + structured logs (both sides) |

---

## 2. Tech Stack

### Backend (`apps/medusa`)
```
@medusajs/medusa            ^2.x        Core
@medusajs/admin             ^2.x        Bundled admin UI
@medusajs/file-s3           ^2.x        Cloudflare R2 (S3-compatible)
@medusajs/payment-stripe    ^2.x        Stripe integration
medusa-plugin-meilisearch   ^2.x        Indexed product search
@medusajs/notification-…    ^2.x        Email dispatch
medusa-plugin-resend        community   Resend templates
pg, redis, ioredis          latest      Data + queue clients
zod                         ^3          Request validation
pino, pino-pretty           latest      Structured logs
```

### Frontend (`apps/storefront`)
```
next                        14.2.x      App Router
@medusajs/js-sdk            ^2.x        Type-safe client
@medusajs/types             ^2.x        Shared types
zustand                     ^5          Client state (UI only, not cart)
@tanstack/react-query       ^5          Server state caching
framer-motion               ^11         Motion
tailwindcss                 ^3.4        Styling system
sharp                       latest      Image pipeline
zod, react-hook-form        latest      Forms
```

### Tooling
```
turborepo                   ^2          Monorepo orchestration
pnpm                        ^9          Workspace package manager
typescript                  ^5.6        Strict mode everywhere
biome / eslint + prettier   pick one    Lint + format
vitest                      ^2          Unit + integration tests
playwright                  ^1.48       E2E tests
husky + lint-staged         latest      Pre-commit hooks
github-actions              -           CI/CD
docker, docker-compose      latest      Local Postgres + Redis + Meili
```

---

## 3. Repository Structure (Turborepo)

```
nitec/
├── apps/
│   ├── medusa/                     # Medusa v2 backend + admin
│   │   ├── src/
│   │   │   ├── modules/            # custom modules (e.g. brand-voice, loyalty)
│   │   │   ├── workflows/          # business logic transactions
│   │   │   ├── subscribers/        # event handlers (order.placed → email)
│   │   │   ├── api/                # custom REST routes
│   │   │   ├── jobs/               # scheduled tasks (low-stock alerts)
│   │   │   ├── links/              # module-to-module relationships
│   │   │   └── admin/              # admin panel customizations
│   │   ├── medusa-config.js
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── storefront/                 # Next.js 14 (current `web/` migrates here)
│       ├── app/
│       │   ├── (shop)/             # public routes
│       │   ├── (account)/          # logged-in routes
│       │   └── api/                # webhook receivers (Stripe, Algolia)
│       ├── components/
│       ├── lib/
│       │   ├── medusa.ts           # @medusajs/js-sdk client
│       │   ├── queries/            # react-query keys + fetchers
│       │   └── checkout/           # cart, address, payment flows
│       ├── messages/               # i18n (next-intl)
│       └── Dockerfile
│
├── packages/
│   ├── ui/                         # shared design system components
│   ├── config/                     # eslint, tsconfig, tailwind base
│   └── types/                      # shared cross-cutting TS types
│
├── infra/
│   ├── docker-compose.yml          # local dev
│   ├── github-actions/             # CI workflows
│   └── terraform/                  # infra-as-code (optional v2)
│
├── docs/
│   ├── runbook.md                  # how to deploy, rollback, debug
│   ├── data-model.md               # ERD + module relationships
│   └── decisions/                  # ADRs
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

The current `api/` + `web/` collapses into `apps/medusa/` + `apps/storefront/`. The legacy HTML stays in a `legacy/` folder for reference.

---

## 4. 12-Week Delivery Roadmap

### Phase 1 — Foundation (Weeks 1–3)

**Goal**: bootstrap Medusa, migrate skeleton, dev environment running end-to-end.

| Week | Tasks | Deliverable |
|---|---|---|
| 1 | Spin up Turborepo + pnpm workspaces · Scaffold Medusa v2 via `npx create-medusa-app` · Wire local Postgres + Redis via docker-compose | `pnpm dev` boots Medusa on `:9000`, storefront on `:3000`, all services healthy |
| 2 | Configure regions (USD, EUR, GBP, JPY), tax zones, sales channels (`web`, `pos`) · Seed currencies, shipping profiles | Admin login at `/app` shows regions and a placeholder product |
| 3 | Migrate Storefront from current `web/` into `apps/storefront`, swap API client to `@medusajs/js-sdk` · Set up `.env.local` and Vercel preview deploys | Storefront homepage SSR-renders 1 real Medusa product |

**Acceptance**: `pnpm dev` boots everything · admin panel works · storefront talks to Medusa · CI runs lint + typecheck.

---

### Phase 2 — Catalog & Content (Weeks 4–6)

**Goal**: real product catalog, real imagery, search, and curated collections.

| Week | Tasks | Deliverable |
|---|---|---|
| 4 | Define product taxonomy (Headphones, Earbuds, Speakers, MR, Accessory) · Define option templates (Color, Size, Edition) · Define collections (Best Sellers, New Arrivals, Studio Series) · Bulk-import via Medusa CSV importer | 30+ real products live with variants, options, pricing per region |
| 5 | Configure R2 file storage · Upload product imagery (hero, gallery, lifestyle) via Admin · Sharp pipeline + `next/image` AVIF/WebP optimization · Add lazy-load and LQIP | All PDPs render real photos, Lighthouse Performance ≥ 90 mobile |
| 6 | Install + configure `medusa-plugin-meilisearch` · Index products on `product.updated` · Build storefront search overlay (instant results, recent searches, trending) | `/shop?q=` and ⌘K search panel return Meili-backed results in <100 ms |

**Acceptance**: catalog covers all categories with variants and real photos · search works · all data flows from Admin → Postgres → Storefront via Medusa.

---

### Phase 3 — Commerce Engine (Weeks 7–9)

**Goal**: complete a real order with real money in production sandbox.

| Week | Tasks | Deliverable |
|---|---|---|
| 7 | Wire `@medusajs/payment-stripe` · Build checkout flow on top of Medusa cart/order workflows · 3DS support · Apple Pay + Google Pay via Stripe Payment Element | Checkout completes in Stripe test mode; order appears in Admin |
| 8 | Configure shipping options (Standard, Express, International) per region · Tax provider (Stripe Tax or TaxJar) · Inventory module wired to stock locations · Backorder behavior | Real shipping rates calculated; out-of-stock products surface correctly |
| 9 | Customer accounts: register, login, password reset, order history, addresses, wishlist (custom module) · Magic-link login via Resend | `/account` shows real orders; password reset email lands in inbox |

**Acceptance**: end-to-end purchase flow works · admin can fulfill, refund, partial-refund · customer email lifecycle fires correctly.

---

### Phase 4 — Operations & Launch (Weeks 10–12)

**Goal**: production-ready — observability, performance, SEO, legal, launch.

| Week | Tasks | Deliverable |
|---|---|---|
| 10 | Email templates (Resend MJML): order confirmed, shipped, delivered, abandoned cart · Subscriber on `order.placed` and `order.shipment_created` · Cron job for abandoned cart at +24h | All 7 transactional emails verified across providers (Gmail, Outlook, Apple Mail) |
| 11 | SEO: sitemap.xml, robots.txt, OpenGraph, structured data (Product, Breadcrumb, Organization) · `next-intl` for EN + IS · Cookie consent (Cookiebot or Osano) · GDPR data export endpoint · Cookie/Privacy/Terms pages | Lighthouse SEO 100 · structured data validates in Rich Results Test |
| 12 | Sentry + Axiom wiring · Health endpoints + uptime monitor (BetterStack) · Load test (k6, 200 RPS sustained) · Penetration smoke test · DNS cutover, SSL via Cloudflare · Soft launch to allowlist of 50 customers | Live at `nitec.audio` for invite-only; metrics + alerts firing |

**Acceptance**: real customer can browse → buy → receive → return · ops team can fulfill orders without engineering help · no critical alerts for 7 consecutive days.

---

## 5. Data Model — Custom Modules

Beyond Medusa's core modules, we add three custom modules:

### `wishlist` module
- Owns: `wishlist`, `wishlist_item`
- Links: `wishlist.customer_id ↔ customer.id`, `wishlist_item.product_variant_id ↔ product_variant.id`
- API: `POST /store/wishlist/items`, `DELETE`, `GET /store/wishlist`

### `loyalty` module
- Owns: `loyalty_account`, `loyalty_transaction`
- Tiers: Bronze (0+), Silver (500+), Gold (2000+), Studio (10000+)
- Earns 1 pt per $1 · redeem 100 pts = $5 off
- Subscriber on `order.completed` awards points

### `editorial` module
- Owns: stories, lookbooks, sound essays (CMS-lite)
- Linked to products for "as featured in" cross-references
- Surface on storefront `/stories/[slug]`

For heavier CMS needs in year 2, layer **Sanity** or **Payload** on top — keep them decoupled from commerce.

---

## 6. Frontend Migration Strategy

Current `web/` code maps to Medusa concepts:

| Current code | Becomes |
|---|---|
| `lib/api.ts` (custom fetch) | `lib/medusa.ts` exporting `@medusajs/js-sdk` client |
| `useCart` zustand store with localStorage | Medusa cart with `cart_id` cookie + react-query cache |
| `useAuth` zustand store with JWT in localStorage | `@medusajs/js-sdk` auth helpers + HttpOnly cookie |
| `api/src/data/products.ts` (in-memory) | Medusa Postgres-backed Products module |
| `app/checkout/page.tsx` (form-only) | Stripe Payment Element + Medusa cart completion |
| Static categories | Medusa Collections + Categories |

We keep the design system + ProductVisual + Tailwind tokens unchanged — only the data layer changes. Component contracts stay the same, so the visual work survives the migration.

---

## 7. DevOps & Environments

### Environments
| Env | URL | Purpose | Data |
|---|---|---|---|
| `local` | localhost | Dev | docker-compose Postgres/Redis/Meili |
| `preview` | `pr-N.nitec.dev` | PR previews | shared preview Postgres |
| `staging` | `staging.nitec.dev` | QA + UAT | nightly snapshot of prod (sanitized) |
| `production` | `nitec.audio` | Live | Real |

### CI/CD (GitHub Actions)
- On PR: lint, typecheck, unit tests, build, Lighthouse CI
- On merge to `main` → deploy storefront preview (Vercel) + medusa preview (Railway)
- On `release/*` tag → deploy to staging
- Manual approval → production
- Auto-rollback if 5xx rate >1% for 2 min

### Migrations
- `npx medusa db:migrate` runs as part of deploy pipeline, gated behind a release manager approval
- All custom modules use Medusa's migration generator
- Never run destructive migrations without a fresh backup + verified rollback plan

### Secrets
- 1Password Vault for team-shared secrets
- Doppler or Infisical for runtime secret distribution
- Rotate Stripe keys, JWT secrets quarterly

---

## 8. Observability & SLOs

| Metric | Target |
|---|---|
| Storefront LCP (mobile) | ≤ 2.0 s p75 |
| Storefront TTFB | ≤ 400 ms p75 |
| Medusa API latency | ≤ 250 ms p95 |
| Checkout completion rate | ≥ 70% (cart → paid) |
| Stripe webhook success | ≥ 99.9% |
| Uptime | 99.9% rolling 30d |
| Error budget | < 4.4h/month downtime |

**Stack**: Sentry (errors, performance), Axiom (logs), BetterStack (uptime), PostHog (product analytics), Stripe Sigma (revenue analytics).

---

## 9. Security & Compliance

- **PCI scope**: minimized — we never touch raw card data. Stripe Elements only.
- **PII**: encrypted at rest (Postgres TDE via managed Neon), TLS 1.3 in transit
- **Auth**: JWT short-lived (15 min) + HttpOnly refresh cookie, bcrypt cost 12
- **Rate limiting**: 100 req/min per IP at Cloudflare WAF; 1000 req/min per API key
- **CSP**: strict default-src 'self' with explicit allowlists for Stripe, Meili, Resend
- **CSRF**: SameSite=Lax cookies + double-submit token on mutating requests
- **GDPR**: data export + right-to-be-forgotten endpoint, DPA on file for all subprocessors
- **Backups**: Postgres daily snapshot + PITR (7-day window); monthly DR restore drill
- **Audit log**: all admin mutations logged to immutable Axiom dataset

---

## 10. Testing Strategy

| Layer | Tool | Coverage target |
|---|---|---|
| Unit | Vitest | 70% for modules + workflows |
| Integration | Vitest + Postgres test container | All custom API routes, all subscribers |
| E2E | Playwright | Happy paths + 3 critical edge cases (empty cart checkout, invalid card, sold-out product) |
| Visual | Chromatic or Percy | All design system components |
| Load | k6 | 200 RPS sustained, 500 RPS burst, p95 < 500ms |
| Security | OWASP ZAP baseline | Run nightly in CI |
| Accessibility | axe-core (Playwright integration) | Zero WCAG 2.1 AA violations on top 10 routes |

---

## 11. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Medusa v2 API changes during build | Med | Med | Pin to specific minor; subscribe to changelog; budget 1 day/sprint for upgrades |
| Stripe payment integration edge cases (3DS, SCA) | Med | High | Use Stripe Test clock; comprehensive Playwright suite covering all decline codes |
| Image storage costs balloon | Low | Med | R2 has no egress fees; Cloudflare image resize on edge |
| Search relevancy poor at launch | Med | Med | Hand-tune Meili synonyms + ranking rules; A/B test ordering |
| Inventory desync on bursty traffic | Low | High | Use Medusa reservations with Redis locks; integration test with k6 |
| Vendor outage (Stripe/Vercel/Railway) | Low | High | Graceful degradation banners; status.nitec.audio; documented runbook |
| Single ops person hit by bus | Med | Med | All decisions in ADRs; runbook in `docs/runbook.md`; rotate on-call weekly |

---

## 12. Launch Checklist

### Pre-launch (final week)
- [ ] All env vars set in production (validated by `pnpm check:env`)
- [ ] Stripe production keys rotated and stored in vault
- [ ] DNS + SSL configured (Cloudflare, A record + CNAME)
- [ ] Email DKIM/SPF/DMARC verified for `nitec.audio`
- [ ] All transactional emails proofed in Litmus
- [ ] robots.txt + sitemap.xml live and submitted to Search Console
- [ ] Google Analytics 4 + PostHog wired and consented
- [ ] Cookie consent banner active
- [ ] Privacy, Terms, Returns, Shipping pages reviewed by legal
- [ ] Backup verified: restore drill completed in staging
- [ ] Load test passed: 200 RPS sustained
- [ ] Accessibility audit passed (axe-core + manual screen reader)
- [ ] Lighthouse on top 10 routes: Performance ≥ 90, Accessibility ≥ 95, SEO 100
- [ ] On-call rotation defined for first 30 days
- [ ] Soft-launch allowlist of 50 customers tested full purchase + return flow

### Launch day
- [ ] DNS flipped at low-traffic hour (Tuesday 03:00 UTC)
- [ ] War room open in Slack + screen-share
- [ ] First production order placed by team member, monitored end-to-end
- [ ] Status page set to "Operational"
- [ ] Launch tweet + email scheduled

### T+24h
- [ ] All error rates within budget
- [ ] All p95 latencies within SLO
- [ ] First real customer orders fulfilled
- [ ] No security alerts
- [ ] Retro scheduled for T+7d

---

## 13. Post-launch Backlog (Quarters 2–4)

**Q2**
- Subscription product type (replacement ear pads, monthly mix tape)
- Gift cards (Medusa native module)
- Apple Pay/Google Pay on PDP (express checkout)
- B2B accounts module (wholesale pricing tiers)

**Q3**
- Mobile app (Expo + Medusa SDK)
- Editorial CMS with Sanity integration
- Multilingual rollout (DE, FR, JP)
- Loyalty redemption + referrals

**Q4**
- POS integration (in-store kiosks via Medusa sales channels)
- Marketplace mode (curated third-party brands)
- AI personalization (PostHog + recommendation model)

---

## 14. Open Questions for Stakeholders

1. **Currencies**: confirm launch regions — proposed USD / EUR / GBP / JPY
2. **Shipping**: in-house fulfillment, 3PL, or hybrid? — impacts Phase 3 week 8
3. **Tax**: Stripe Tax ($) vs. TaxJar vs. Avalara? — needs accounting input
4. **Email volume estimate**: drives Resend tier choice
5. **Inventory source-of-truth**: Medusa-native, or sync from existing ERP?
6. **Brand assets**: do we have studio photography for all 9 SKUs by Phase 2 week 5?
7. **Legal pages**: who drafts? Do we use a template (Termly, Iubenda) or commission a law firm?
8. **Launch markets**: which 3 countries get the soft launch?

These need answers by end of Phase 1 to avoid Phase 2 slippage.

---

## Appendix A — Decision Log (initial ADRs)

- **ADR-001**: Medusa over Saleor — TypeScript end-to-end + closer plugin ecosystem to our existing JS stack
- **ADR-002**: Postgres on Neon over RDS — better DX, branching for previews, generous free tier
- **ADR-003**: Cloudflare R2 over AWS S3 — no egress fees, integrated with our CDN
- **ADR-004**: Resend over SendGrid — better deliverability for new domains, React-Email integration
- **ADR-005**: MeiliSearch self-hosted (Phase 2) → MeiliSearch Cloud (Phase 4 if scale requires)
- **ADR-006**: pnpm + Turborepo over Nx — lighter footprint, faster cold installs

All future architectural decisions recorded in `docs/decisions/ADR-NNN.md`.

---

*Document owner: Engineering Lead · Last updated: 2026-06-24 · Status: Draft for review*
