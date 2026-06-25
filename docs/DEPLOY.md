# VEXO — Production Deployment Runbook

Three services + two managed datastores:

| Service | Platform | Notes |
|---|---|---|
| Storefront (Next.js) | **Vercel** | Native Next support |
| Medusa backend | **Railway** | + Postgres plugin + Redis plugin |
| Wire payment gateway (Express) | **Railway** | Small Node service |

> You need accounts on **Vercel** and **Railway** (both have free tiers). Domain optional.

Production builds are already verified locally (`web` and `api` both build clean).

---

## 1. Railway — Medusa backend + datastores

1. **New Project** → "Deploy from GitHub repo" → pick this repo.
2. Add plugins: **+ New → Database → PostgreSQL**, then **+ New → Database → Redis**.
3. **Add a service** for Medusa:
   - Root directory: `medusa-backend/apps/backend`
   - It will use the included `Dockerfile`.
   - **Variables**:
     ```
     DATABASE_URL   = ${{Postgres.DATABASE_URL}}
     REDIS_URL      = ${{Redis.REDIS_URL}}
     JWT_SECRET     = <long random string>
     COOKIE_SECRET  = <long random string>
     STORE_CORS     = https://<your-vercel-domain>
     ADMIN_CORS     = https://<this-medusa-domain>
     AUTH_CORS      = https://<your-vercel-domain>,https://<this-medusa-domain>
     MEDUSA_ADMIN_ONBOARDING_TYPE = default
     ```
4. Deploy. First boot runs `medusa db:migrate` (in the Dockerfile CMD).
5. **Seed data** (one-off — Railway → service → "Run command", or `railway run`):
   ```
   npx medusa exec ./src/scripts/seed-region.ts
   npx medusa exec ./src/scripts/seed-shipping.ts
   npx medusa exec ./src/scripts/seed-vexo.ts
   ```
6. **Create admin user**:
   ```
   npx medusa user -e admin@vexo.gear -p <strong-password>
   ```
7. In Medusa Admin (`https://<medusa-domain>/app`) → **Settings → Publishable API Keys** → copy the key (`pk_…`).
   Also grab the **USD region id** (Settings → Regions) for the storefront env.

---

## 2. Railway — Wire payment gateway (Express)

1. **Add a service** in the same project:
   - Root directory: `api`
   - Uses the included `Dockerfile`.
   - **Variables**:
     ```
     MEDUSA_URL          = http://<medusa-internal-host>:9000   (Railway internal URL)
     MEDUSA_PK           = pk_…                                  (from step 1.7)
     WEB_ORIGIN          = https://<your-vercel-domain>
     WIRE_SECRET_KEY     = sk_live_…        (empty = MOCK mode)
     WIRE_WEBHOOK_SECRET = whsec_…
     NEXT_PUBLIC_SITE_URL= https://<your-vercel-domain>
     ```
2. Deploy → note the public URL (e.g. `https://vexo-api.up.railway.app`).

---

## 3. Vercel — storefront

1. **New Project** → import this repo.
2. **Root Directory: `web`** (important — monorepo).
3. **Environment Variables**:
   ```
   NEXT_PUBLIC_USE_MEDUSA   = 1
   NEXT_PUBLIC_MEDUSA_URL   = https://<medusa-domain>
   NEXT_PUBLIC_MEDUSA_PK    = pk_…
   NEXT_PUBLIC_MEDUSA_REGION= reg_…           (USD region id)
   API_URL                  = https://<vexo-api railway url>   (for /api/* rewrite → Wire)
   ```
4. Deploy. Vercel builds `next build` automatically.

---

## 4. Wire dashboard (go live with real QPay)

1. https://wire.mn → register, verify org.
2. **API Keys** → copy `sk_live_…` → set `WIRE_SECRET_KEY` on the Express service.
3. **Webhooks** → add `https://<vexo-api-domain>/api/webhooks/wire`, events
   `payment_intent.succeeded` (+ `payment_intent.canceled`). Copy signing secret → `WIRE_WEBHOOK_SECRET`.
4. Enable **QPay** operator. Price products in **MNT** (integers).

> Leave `WIRE_SECRET_KEY` empty to keep MOCK mode (auto-succeeds) for a soft launch / demo.

---

## 5. Domain (optional)

- Vercel → Project → Domains → add `vexo.mn` (or your domain), follow DNS records.
- Update `STORE_CORS` / `AUTH_CORS` (Medusa) and `WEB_ORIGIN` / `NEXT_PUBLIC_SITE_URL` (Express) to the final domain.

---

## 6. Post-deploy smoke test

- [ ] `https://<medusa-domain>/health` → 200
- [ ] `https://<vexo-api-domain>/health` → 200
- [ ] Storefront home shows products (from Medusa)
- [ ] Register + login (Medusa customer)
- [ ] Add to cart → checkout → Wire/QPay → order appears in Medusa Admin
- [ ] Lighthouse: Performance ≥ 90 mobile, SEO 100

---

## Architecture in production

```
Browser ──► Vercel (Next.js storefront)
               ├─ products/cart/auth ──► Medusa (Railway) ──► Postgres + Redis (Railway)
               └─ /api/payments/*   ──► Express Wire gateway (Railway) ──► Wire (QPay)
                                                          └─ completes Medusa cart on payment
```
