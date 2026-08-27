# NARAN — Production deploy (нэг VPS + Dokploy)

Энэ заавар нь бүх стекийг (**Postgres, Redis, MeiliSearch, Medusa, Express API,
Next.js storefront**) нэг VPS дээр **Dokploy**-оор байршуулах алхмуудыг тайлбарлана.
Ойролцоо зардал: **VPS ~₮30,000–50,000/сар** (Hetzner CX22 / Contabo VPS S).

> ⚠️ **Нууц түлхүүр**: QPay, R2, DB нууц үг зэргийг **зөвхөн VPS дээр** (Dokploy env
> эсвэл `infra/.env`) оруулна. Git-д хэзээ ч commit хийхгүй (`infra/.env` gitignore-д).

---

## 0. Урьдчилсан нөхцөл

| Зүйл | Тайлбар |
|---|---|
| VPS | Ubuntu 22.04+, 2 vCPU / 4GB RAM доод тал (10k бараа + Meili-д тохиромжтой) |
| Домэйн | `naran.mn` (+ `api.naran.mn`, `admin.naran.mn` дэд домэйн) |
| Cloudflare | DNS (заавал биш ч санал болгоно) + R2 (зургийн хадгалалт, сонголтоор) |

---

## 1. VPS + Dokploy суулгах

VPS дээр (root):
```bash
curl -sSL https://dokploy.com/install.sh | sh
```
Дуусмагц `http://<VPS-IP>:3000` дээр Dokploy admin нээгдэнэ. Эхний хэрэглэгчээ үүсгэ.

---

## 2. DNS тохируулах

Домэйн бүрийг VPS-ийн IP рүү заа (A record):

| Хост | Төрөл | Утга |
|---|---|---|
| `naran.mn` | A | `<VPS-IP>` |
| `www` | A | `<VPS-IP>` |
| `api` | A | `<VPS-IP>` |
| `admin` | A | `<VPS-IP>` |

(Cloudflare ашиглаж байвал эхлээд proxy-г **DNS only** болго; TLS-г Dokploy Let's Encrypt-ээр авна.)

---

## 3. Dokploy дээр Compose апп үүсгэх

1. Dokploy → **Create Application → Docker Compose**.
2. **Source**: энэ Git repo, branch `main`.
3. **Compose path**: `infra/docker-compose.prod.yml`.
4. **Environment**: `infra/.env.prod.example`-г хуулж бүх утгыг бөглө
   (доорх [4-р хэсэг](#4-env-утгууд)). Dokploy-ийн Environment талбарт буулга.
5. **Domains** (Dokploy UI → Domains, сервис бүрд):
   | Сервис | Домэйн | Порт | TLS |
   |---|---|---|---|
   | `web` | `naran.mn`, `www.naran.mn` | 3000 | Let's Encrypt |
   | `medusa` | `api.naran.mn` | 9000 | Let's Encrypt |
   | `api` | (заавал биш; web дотроосоо `/api/*` proxy-лдог) | 4000 | — |

   Medusa admin панель нь `https://api.naran.mn/app` дээр гарна.

---

## 4. ENV утгууд

`infra/.env.prod.example` доторх бүх түлхүүрийг бөглө. Нууцуудыг үүсгэх:
```bash
openssl rand -base64 32   # JWT_SECRET
openssl rand -base64 32   # COOKIE_SECRET
openssl rand -base64 32   # MEILISEARCH_API_KEY
```
Анхаарах:
- **`NEXT_PUBLIC_MEDUSA_URL`** = `https://api.naran.mn` (хөтөч хандах **нийтийн** URL).
- **`NEXT_PUBLIC_MEDUSA_PK` / `NEXT_PUBLIC_MEDUSA_REGION`** — DB seed хийсний **дараа**
  авна ([6-р хэсэг](#6-эхний-seed)), дараа нь web-ийг дахин build хийнэ.
- **CORS** утгуудад бодит домэйнуудаа оруул.
- QPay production түлхүүр байхгүй бол `WIRE_MODE=mock` үлдээ.

---

## 5. Эхний deploy

Dokploy → **Deploy**. Build дуусаад:
- `postgres`, `redis`, `meilisearch` — эрүүл болно.
- `medusa` — эхэлж, **migration автоматаар** ажиллана (Dockerfile-д `db:migrate`).
- `web`, `api` — асна.

---

## 6. Эхний seed

Medusa контейнерийн терминал руу ор (Dokploy → medusa → **Terminal**, эсвэл
`docker exec -it <medusa-container> sh`). Seed script-уудыг төслийн үндсэн
директороос ажиллуул (`cd /app` — эндээс `medusa exec` эх кодыг шууд ажиллуулна):

```bash
# 1) Суурь бүсчлэл + Монгол (MNT) бүс, хүргэлт
npx medusa exec ./src/scripts/seed-region.ts
npx medusa exec ./src/scripts/seed-mnt.ts
# 2) Гоо сайхны ангилал → БАРАА (эрэмбэ чухал: ангилал эхэлнэ)
npx medusa exec ./src/scripts/seed-categories.ts
npx medusa exec ./src/scripts/seed-naran.ts          # 16 demo бараа
# 3) Купон + буцаалтын хүргэлт
npx medusa exec ./src/scripts/seed-promotions.ts
npx medusa exec ./src/scripts/seed-return-shipping.ts
# 4) Admin хэрэглэгч
npx medusa user -e admin@naran.mn -p '<STRONG_PASSWORD>'
```

**Бодит 10,000 бараа** оруулах (CSV):
```bash
IMPORT_FILE=./data/catalog.csv npx medusa exec ./src/scripts/import-products.ts
```
(CSV багана: `handle,title,price,category,sizes,image,description` — `category` нь
`fragrance/skincare/...` эсвэл монгол нэр аль нь ч болно.)

### PK + Region авах
Postgres-оос шууд унш (postgres контейнер дотор):
```bash
psql -U naran -d naran -c "SELECT token FROM api_key WHERE type='publishable';"
psql -U naran -d naran -c "SELECT id FROM region WHERE currency_code='mnt';"
```
Эсвэл Medusa admin (`https://api.naran.mn/app`) → **Settings → Publishable API Keys**
болон **Regions** хэсгээс хараарай.

Гарсан `pk_...` ба `reg_...`-г `infra/.env`-ийн `NEXT_PUBLIC_MEDUSA_PK` /
`NEXT_PUBLIC_MEDUSA_REGION`-д оруулаад **web-ийг дахин deploy** (rebuild) хий
(NEXT_PUBLIC нь build-д шингэдэг).

---

## 7. MeiliSearch индекс

Автоматаар — плагины `meilisearch-products-index` job Medusa ачаалагдсаны дараа
бүтэн sync хийж, бараа өөрчлөгдөх бүрд шинэчилнэ. Гараар шалгах:
```bash
curl -s -X POST http://meilisearch:7700/indexes/products/search \
  -H "Authorization: Bearer $MEILISEARCH_API_KEY" -H 'content-type: application/json' \
  -d '{"q":"serum"}'
```

---

## 8. Зураг → Cloudflare R2 (сонголтоор)

1. Cloudflare → R2 → bucket үүсгэ (`naran-media`), API token авах.
2. `infra/.env`-д `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`,
   `S3_SECRET_ACCESS_KEY`, `S3_FILE_URL` (нийтийн CDN URL) бөглө → medusa redeploy.
3. Одоо байгаа зургийг R2 руу зөөх:
   ```bash
   npx medusa exec ./src/scripts/upload-images-to-r2.ts
   ```

---

## 9. Ажиллагаа (Ops)

- **Backup**: Postgres volume-ийг тогтмол dump хий:
  ```bash
  docker exec <postgres> pg_dump -U naran naran | gzip > naran-$(date +%F).sql.gz
  ```
  Meili (`meilidata`) болон R2/зураг мөн backup-д хамруул.
- **Шинэчлэлт**: Git-д push → Dokploy → Redeploy. Medusa migration автоматаар ажиллана.
- **Лог**: Dokploy → сервис → Logs.
- **Хэмжээ / server-worker split**: compose нь Medusa-г **хоёр контейнер**-аар
  ажиллуулна — `medusa` (HTTP, `MEDUSA_WORKER_MODE=server`) + `medusa-worker`
  (арын ажил: Meili индекс, имэйл, scheduled job — `MEDUSA_WORKER_MODE=worker`).
  Production-д (`NODE_ENV=production` + `REDIS_URL`) event bus, workflow engine,
  cache нь **Redis**-ээр ажиллаж, хоёр контейнер event/job хуваалцана. Локал
  dev-д (development) in-memory хэвээр — Redis шаардахгүй. Ачаалал ихсвэл `medusa`
  контейнерийг олшруулж (replica) Traefik-ээр балансал, эсвэл VPS-ээ өсгө.

---

## Архитектур

```
                 ┌────────── Dokploy / Traefik (TLS) ──────────┐
 naran.mn ──────▶│  web (Next.js :3000, standalone)            │
 api.naran.mn ──▶│  medusa (:9000)  ──┐                        │
                 └────────────────────┼────────────────────────┘
                        internal "naran" network
        ┌───────────────┼───────────────┬──────────────┐
   postgres:5432    redis:6379     meilisearch:7700   api:4000 (Wire/QPay)
```
Storefront нь **зөвхөн API-аар** Medusa-той харилцна (`web/lib/medusa.ts`); хайлт нь
backend-аар дамжин Meili рүү ордог тул хайлтын түлхүүр хөтөчид задрахгүй.
