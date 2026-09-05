# NARAN — Production-Readiness Audit

**Огноо:** 2026-09-05 · **Хамрах хүрээ:** web/ (storefront), medusa-backend/ (admin+API), api/ (Wire/QPay payments), infra/ (deploy)

## Ерөнхий дүгнэлт

**Одоогийн байдлаар production-д бодит төлбөртэйгээр гаргах бэлэн БИШ.**

Архитектур сайн бодогдсон (server/worker салгасан, CORS зөв, төлбөрийн дүн server-талд authoritative, consent-gated analytics, RBAC жинхэнэ). Асуудлууд нь **дизайнд биш — wiring, safety-default, go-live hardening**-д байна. Ихэнхийг ~1-2 өдөрт засах боломжтой.

Хамгийн эрсдэлтэй 3 зүйл: (1) production дээр mock төлбөр хамгаалалтгүй → мөнгө авалгүй захиалга үүснэ; (2) Wire мөнгө авчихаад Medusa захиалга үүсэхгүй бол буцаах/тулгах механизмгүй; (3) e-Barimt НӨАТ баримт mock хэвээр (Монголд хууль ёсоор заавал).

---

## ✔️ Засагдсан (1-р ээлж, commit хийгдсэн)

- **B1** — production дээр `WIRE_SECRET_KEY` байхгүй бол `api` boot хийхээс татгалзана (`api/src/index.ts`).
- **B5** — checkout хаягийн хуурамч `defaultValue`-ууд хасагдсан (placeholder үлдсэн).
- **B6** — login/бүртгэл demo нууц үг цэвэрлэгдсэн (хоосон), demo hint устсан.
- **B7** — `STOREFRONT_URL` / `RESEND_API_KEY` / `EMAIL_FROM` compose 2 файл + `.env.prod.example`-д нэмэгдсэн.
- **H6** — `api` hardcoded `MEDUSA_PK` fallback устсан; prod-д env шаардана.
- **H10** — auth-гүй legacy `/api/orders` (IDOR/PII) бүрэн устсан.
- **M14** — Express CORS prod-д fail-closed (WEB_ORIGIN шаардана).
- **M15** — Express demo хэрэглэгч + weak JWT secret prod-д fail-closed болсон.

**2-р ээлж (төлбөрийн бат байдал):**
- **B2** — Wire мөнгө авчихаад cart complete хийж чадаагүй тохиолдол: retry (transient өөрөө сэргэнэ) → тэсэхгүй бол `needs_review` төлөв + Sentry alert + structured log (мөнгө-захиалгагүй хэзээ ч чимээгүй алдагдахгүй). Storefront "Төлбөр хүлээн авлаа, баталгаажуулж байна" мессеж харуулна (`api/src/routes/payments.ts`, `web/.../checkout/processing`).
- **H4** — webhook + poll зэрэг settle дуудахыг нэг in-flight promise-оор coalesce; имэйл нэг л удаа (`emailed` guard); Medusa completion idempotent (нэг cart → нэг захиалга).
- **M2** — авсан дүн ≠ захиалгын нийт бол Sentry warning + log.
- **B3 (хэсэгчлэн)** — oversell-ийн *үр дагавар* аюулгүй боллоо (мөнгө алдагдахгүй, reconcile хийгдэнэ). Жинхэнэ pre-payment нөөц reservation нь тусдаа backend feature — **хийгдээгүй хэвээр** (доор B3 үзнэ үү).

Live шалгасан: happy-path checkout → захиалга NT-15 ₮89,000 амжилттай (regression цэвэр). `needs_review` замыг логикоор шалгасан (live trigger хийхэд staged out-of-stock шаардана).

**3-р ээлж (HIGH UX / найдвартай байдал):**
- **H1** — буруу барааны URL одоо 404 (`notFound()` + брэндтэй `not-found.tsx`); JSON-LD `</script>` escape. Live: `/mn/product/does-not-exist` → "Хуудас олдсонгүй".
- **H2** — хоосон каталог crash засагдсан (`hot` undefined-ыг хамгаалж, `hotImg` fallback).
- **H3** — сагс худал "Үнэгүй" гэхээ болив: ₮150,000-аас доош "Төлбөрийн хэсэгт тооцно" + босгын урамшуулал; дээш "Үнэгүй нээгдлээ". Live шалгасан.
- **H7** — бүх app сервист healthcheck (medusa/api/web wget) + `mem_limit` (compose 2 файл). `docker compose config` VALID.
- **H8** — migration нь `medusa-migrate` one-shot болов; server/worker хүлээгээд эхэлнэ (replica-д аюулгүй). DEPLOY.md шинэчлэгдсэн.
- **H9** — rate limiting: Medusa auth (login 10/15м, register 10/1ц, reset 5/15м) + api (auth 20/15м, pay-intent 12/1м), dependency-гүй in-memory limiter. Live: reset 6 дахь → 429, intent 13 дахь → 429.

**Хойшлуулсан:**
- **H5** (lockfile + `npm ci`) — web/api нь npm workspace гишүүд тул standalone lockfile үүсгэх + `npm ci` руу шилжих нь бодит Docker build-ээр шалгах шаардлагатай. Шалгалгүй shipping хийвэл prod build бүрийг эвдэх эрсдэлтэй тул хойшлуулав.

Үлдсэн: B3 бүрэн reservation, B4 e-Barimt, H5, MEDIUM/LOW.

---

## 🔴 GO-LIVE BLOCKERS — эдгээргүйгээр бодит төлбөр авч болохгүй

### B1. Production дээр mock төлбөр хамгаалалтгүй
`api/src/lib/wire.ts:10-11` — `WIRE_LIVE = !!KEY`. `WIRE_SECRET_KEY` хоосон бол intent-ууд 5 сек дараа автоматаар "succeeded" болж, cart бодит захиалга болно. `DEPLOY.md:78` + `.env.prod.example:39` нь "QPay key байхгүй бол mock үлдээ" гэж заадаг. `NODE_ENV=production`-д татгалзах хамгаалалт алга.
**Үр дагавар:** live дэлгүүр захиалга авна, мөнгө ₮0 цуглуулна, алдаа гарахгүй.
**Засвар:** production дээр `WIRE_SECRET_KEY` байхгүй бол `api` boot хийхээс татгалзах (эсвэл захиалга дуусгахыг hard-fail).

### B2. Мөнгө авагдчихаад захиалга үүсэхгүй → буцаах зам байхгүй
`api/src/routes/payments.ts:74-79` — `settle()` нь Wire "succeeded" гэсний **дараа** `completeMedusaCart()` дуудна. Хэрэв Medusa completion алдаа гаргавал (нөөц дууссан, үнэ/промо өөрчлөгдсөн, backend унасан) exception дамжина: webhook зам лог бичээд `received:true` (`payments.ts:163`), poll зам 502 (`payments.ts:131-134`). **Аль ч тохиолдолд үйлчлүүлэгч төлсөн, захиалга байхгүй, буцаалт хэзээ ч хийгдэхгүй.** Void/refund, dead-letter, reconciliation байхгүй.
**Засвар:** completion алдаа → Wire void/refund автоматаар, эсвэл durable retry queue + alert.

### B3. Төлбөрийн үед нөөц reserve хийдэггүй → oversell → B2 үүсгэнэ
`web/lib/medusa.ts:370-404` (`prepareCart`) cart + payment session үүсгэнэ, гэхдээ **reservation барихгүй**. Хоёр хүн сүүлийн ширхгийг зэрэг `prepareCart` → хоёулаа Wire-д төлнө → эхнийх дуусна, хоёр дахь нь `completeMedusaCart` "insufficient inventory" гаргана → 2 дахь хүн төлсөн атлаа захиалгагүй (B2). Concurrency-д oversell нээлттэй.
**Засвар:** `prepareCart`-д нөөц reserve хийх, эсвэл intent үүсгэхээс өмнө stock шалгах.

### B4. e-Barimt НӨАТ баримт MOCK хэвээр (хууль зүйн)
`medusa-backend/apps/backend/src/lib/ebarimt.ts:9,35-39` — `EBARIMT_URL` тохируулаагүй тул `MOCK-<id>` буцаана. Монголд бүх борлуулалтад ҮТЕГ e-Barimt баримт хууль ёсоор заавал. Бодит баримтгүйгээр захиалга илгээх нь татварын зөрчил. Мөн НӨАТ-ыг `unit_price × quantity`-гээр тооцдог (`order-ebarimt.ts:18-22`) — **хямдрал, хүргэлтийг тооцохгүй** тул mock задаргаа ч буруу.
**Засвар:** бодит e-Barimt холбох (эсвэл хууль ёсоор гаргаж болохгүй); НӨАТ-ыг бодит төлсөн дүнгээс тооцох.

### B5. Checkout хуурамч урьдчилан бөглөсөн хаяг руу илгээнэ
`web/app/[lang]/checkout/page.tsx:160-168` — хаягийн бүх талбар hardcoded `defaultValue`: `first_name="Bat"`, `last_name="Erdene"`, `address_1="Sukhbaatar District, 1-r khoroo"`, `city="Ulaanbaatar"`, `postal_code="14200"`, `phone="+976 9911 2233"`. Дараад бичээгүй үйлчлүүлэгч **бодит төлбөртэй захиалгыг хуурамч хаяг руу** илгээнэ.
**Засвар:** default-уудыг хасаж, хоосон + placeholder болгох.

### B6. Login/бүртгэл demo нууц үгээр урьдчилан бөглөгдсөн
`web/app/[lang]/auth/page.tsx:48` — `useState({ name: "Nicholas Ergemla", email: "alex@vexo.gear", password: "password123" })`. Production login хуурамч хэрэглэгч+нууц үгээр бөглөгдөж ирнэ.
**Засвар:** хоосон string болгох.

### B7. Medusa compose-д имэйл/reset env холбогдоогүй
Код унших: `subscribers/auth-password-reset.ts:17` (`STOREFRONT_URL`), `lib/email.ts:3-4` (`RESEND_API_KEY`, `EMAIL_FROM`). Гэвч `infra/docker-compose.prod.yml:65-90` (+ managed-db) эдгээрийг өгдөггүй. Үр дагавар: нууц үг сэргээх холбоос `http://localhost:3000` руу заана (ажиллахгүй); бүх Medusa имэйл mock болно (`RESEND_API_KEY` container-т хүрэхгүй). `STOREFRONT_URL` нь `.env.prod.example`-д ч байхгүй.
**Засвар:** гурвыг `&medusa-env` block + `.env.prod.example`-д нэмэх. *(Энэ бол саяхан хийсэн нууц үг сэргээх feature-ийг production дээр эвдэнэ.)*

---

## 🟠 HIGH — UX/найдвартай байдал/зөв ажиллагаа эвдэнэ

| # | Асуудал | Байршил |
|---|---|---|
| H1 | Буруу барааны URL → 500 (404 биш), `not-found.tsx` алга | web/app/[lang]/product/[id]/page.tsx:52; medusa.ts:251 |
| H2 | Хоосон каталог → нүүр хуудас crash (`hot.image` undefined) | web/app/[lang]/page.tsx:35,62-66 |
| H3 | Сагс "Үнэгүй хүргэлт" гэж бичнэ, checkout ₮150k-аас доош бол төлбөр авна | cart/page.tsx:24,96,110; CartDrawer.tsx:107 vs checkout/page.tsx:54-56 |
| H4 | Webhook vs poll давхар completion → давхар захиалга/имэйл (idempotency баталгаагүй) | api/src/routes/payments.ts:112,124-135,161-163 |
| H5 | Lockfile байхгүй + `npm install` (ci биш) → prod build дахин давтагдахгүй | web/Dockerfile:8, api/Dockerfile:6,14, medusa Dockerfile:9,14, ci.yml:66 |
| H6 | api-д hardcoded `MEDUSA_PK` fallback | api/src/routes/payments.ts:10 |
| H7 | App сервисүүдэд healthcheck / memory limit байхгүй (4GB VPS дээр нэг сервис бусдыг залгих эрсдэл) | infra/docker-compose.prod.yml |
| H8 | Migration racy, multi-replica-safe биш (worker `sleep 25`; replica бүр `db:migrate`) | medusa Dockerfile:20, compose:109; DEPLOY.md:209 |
| H9 | Rate limiting хаана ч алга (login/signup/reset/payment intent) → brute force / spam | api/src/index.ts, /auth/customer/* |
| H10 | Auth-гүй legacy `/api/orders` — email-ээр бусдын захиалга, эсвэл бүгдийг dump (IDOR/PII) | api/src/routes/orders.ts:55-67 |

---

## 🟡 MEDIUM

| # | Асуудал | Байршил |
|---|---|---|
| M1 | Customer JWT `localStorage`-д (XSS-д алдагдах эрсдэл); Express token 7 хоног | web/lib/store.ts:56-66; auth.ts:31 |
| M2 | RBAC privilege-by-default: role-гүй шинэ админ = super_admin | medusa .../lib/rbac.ts:48-51 |
| M3 | Авсан дүн (intent үед) vs захиалгын нийт (complete үед) өөр агшинд тооцогдоно, тэнцүүг шалгадаггүй | payments.ts:103 vs settle |
| M4 | Баталгаажуулах имэйл зөвхөн Wire замд, алдаа нуугдана; `medusa.checkout()` (dead) огт илгээхгүй | payments.ts:78; web/lib/medusa.ts:445-481 |
| M5 | Backup зөвхөн Postgres; Meili/R2 script-гүй; cron гараар суулгах | infra/backup/backup.sh; DEPLOY.md:195-197 |
| M6 | Redis нь бүх backend-ийн SPOF (event bus + workflow + cache) | medusa-config.ts:79-88 |
| M7 | api in-process `Map` state, graceful shutdown алга → scale хийж болохгүй | payments.ts:21; index.ts:35 |
| M8 | Тоо ширхэгт дээд хязгаар алга (нөөцөөс их захиалж болно, зөвхөн server-т барина) | cart/page.tsx:81, CartDrawer.tsx:93, _AddToCart.tsx:58 |
| M9 | Persisted cart хэзээ ч reconcile хийгддэггүй (үнэ/нэр/зураг хуучирна) | web/lib/store.ts:17-41 |
| M10 | Shop pagination хуурамч (onClick/href алга); `limit=100` бүгдийг татна, 2 удаа fetch | shop/page.tsx:21-34,94-100; medusa.ts:169 |
| M11 | Footer placeholder холбоосууд (FAQ→нэг бараа; About/Stores/Journal→/shop) | web/components/Footer.tsx:70-71 |
| M12 | Хуурамч loyalty өгөгдөл ("760 points", "Gold member") бүх хэрэглэгчид харагдана | web/lib/i18n.ts:164-166 |
| M13 | Ажиллахгүй social login + сагсны промо input (handler алга) | auth/page.tsx:19-28; cart/page.tsx:100-101 |
| M14 | Express CORS fallback `origin: true` (WEB_ORIGIN хоосон бол бүх origin) | api/src/index.ts:14 |
| M15 | Express weak auth demo default + hardcoded demo user (dead code) | api/src/routes/auth.ts:7,13-17 |

---

## 🟢 LOW

- `loading.tsx` хаана ч алга (server navigation-д skeleton гарахгүй).
- Валют формат зөрүү: `money()` `en-US`, success page bare `toLocaleString()` | api.ts:109 vs success/page.tsx:39
- `hreflang` alternates (/mn ↔ /en) алга; sitemap `?category=` сул URL.
- JSON-LD `</script>` escape хийхгүй (admin өгөгдөл тул онолын) | product/[id]/page.tsx:75
- Client-controlled redirect base (Zod-validated, self-redirect тул бага) | payments.ts:100
- Auth-гүй intent poll (unguessable id) | payments.ts:124-135
- Docs-д dev админ creds (`PLAN.md:30`) — prod-д дахин ашиглаж болохгүй.
- web-д health route алга; логууд бүгд `console.*` (structured биш); uptime monitor алга.
- GDPR deletion зөвхөн flag тавина, боловсруулах admin queue/SLA алга.

---

## ✅ Баталгаажсан САЙН талууд

- Нууц түлхүүрийн эрүүл ахуй цэвэр — git-д бодит secret алга, `.env*` gitignore, compose `${VAR:?}` guard.
- Төлбөрийн дүн server-authoritative, client `amount` үл тоомсорлоно (F1-F4 жинхэнэ бөгөөд бүрэн).
- Webhook: IP allowlist + HMAC + 5-мин replay tolerance + `timingSafeEqual`, live дээр unsigned-ийг татгалзана.
- CSV formula injection guard бодитой, бүх export-д хэрэглэгдсэн.
- Medusa CORS env-ээр зөв (wildcard биш).
- Admin RBAC жинхэнэ enforced; reset flow enumeration-гүй.
- Sentry 3 сервист optional-wired; consent-first cookie (GDPR сайн).
- i18n бүрэн — `t()` key бүр mn+en хоёуланд тодорхойлогдсон.
- SEO scaffolding сайн (metadataBase, canonical, OG, JSON-LD, sitemap, robots).

---

## Хийх дараалал (санал)

**1-р ээлж (blocker, ихэнх нь кодоор засагдана):** B1, B5, B6, B7, H6, H10 → дараа B2/B3 (refund+reservation), B4 (e-Barimt — key/гэрээ шаардана).
**2-р ээлж:** H1, H2, H3, H4, H5, H7, H8, H9.
**3-р ээлж:** MEDIUM-ууд, дараа LOW.
