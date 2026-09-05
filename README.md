# Nitec — Premium e‑commerce

Full-stack monorepo: **Next.js 14** frontend + **Express + Node.js** backend.

## Stack

| Layer       | Tech                                                            |
|-------------|-----------------------------------------------------------------|
| Frontend    | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Zustand |
| Backend     | Node.js, Express, TypeScript, JWT (jsonwebtoken), bcryptjs, Zod  |
| Tooling     | npm workspaces, tsx, concurrently                                |

## Structure

```
.
├── package.json          ← workspace root (web + api)
├── web/                  ← Next.js app
│   ├── app/              ← App Router pages
│   │   ├── page.tsx              (Homepage — bento hero)
│   │   ├── shop/                 (Listing + filters)
│   │   ├── product/[id]/         (Detail + tabs + AddToCart)
│   │   ├── cart/                 (Persistent cart via Zustand)
│   │   ├── checkout/             (Multi-step + order POST)
│   │   ├── checkout/success/     (Confirmation)
│   │   ├── account/              (Auth-gated dashboard)
│   │   └── auth/                 (Login / register tabs)
│   ├── components/       (Nav, Footer, ProductCard, Icons, Toast …)
│   └── lib/              (api client, zustand stores, types)
└── api/                  ← Express REST API
    └── src/
        ├── index.ts              (server entry)
        ├── routes/
        │   ├── products.ts
        │   ├── auth.ts           (JWT + bcrypt)
        │   └── orders.ts         (Zod validated)
        └── data/products.ts      (in-memory catalog)
```

## Quick start

```bash
# 1. Install
npm install

# 2. Env (optional — sensible defaults already)
cp api/.env.example api/.env
cp web/.env.example web/.env.local

# 3. Run both (API on :4000, Web on :3000)
npm run dev
```

Open <http://localhost:3000>.

Create an account on `/auth` (register), or use a Medusa customer you seeded locally. No shared demo credentials are committed.

## API endpoints

| Method | Path                    | Description                |
|--------|-------------------------|----------------------------|
| GET    | `/health`               | Health probe               |
| GET    | `/api/products`         | List (`?category=&sort=&q=`) |
| GET    | `/api/products/featured`| 6-product featured set     |
| GET    | `/api/products/:idOrSlug` | Single + 3 related        |
| POST   | `/api/auth/signup`      | Returns `{ token, user }`  |
| POST   | `/api/auth/login`       | Returns `{ token, user }`  |
| GET    | `/api/auth/me`          | `Authorization: Bearer …`  |
| POST   | `/api/orders`           | Create order (Zod validated) |
| GET    | `/api/orders/:id`       | Single order               |
| GET    | `/api/orders?email=`    | List orders for email      |

Browser-side fetches go through Next.js `rewrites()` (no CORS issues), server-side fetches hit `API_URL` directly.

## Production build

```bash
npm run build     # builds both api/dist and web/.next
npm start         # serves both, API :4000 + Web :3000
```

## Where to swap real services

| Concern    | Demo                      | Production drop-in            |
|------------|---------------------------|-------------------------------|
| Database   | In-memory `Map`           | Prisma + Postgres (`api/src/db.ts`) |
| Auth       | JWT in `localStorage`     | HttpOnly cookies + refresh   |
| Payments   | Form-only checkout        | Stripe Elements / Checkout    |
| Images     | Inline SVG illustrations  | Cloudinary + `next/image`     |
| Search     | `?q=` substring match     | Meilisearch / Algolia         |

---

## Legacy (no‑framework) version

A vanilla HTML/CSS/JS version of the same store is still in the repo root (`index.html`, `shop.html`, …) — useful as a static reference, but the Next.js app is the canonical one.
