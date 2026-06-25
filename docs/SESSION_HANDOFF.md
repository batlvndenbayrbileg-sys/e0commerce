# VEXO — Session Handoff (2026-06-25)

Дараагийн session-д энэ файлыг хамгийн түрүүнд уншуул. Доорх TODO-г дээрээс нь дараалан ав.

---

## 🟢 Одоогийн төлөв (бүгд live)
- **Storefront:** Next.js 14 (App Router) → Vercel — https://e0commerce-web.vercel.app
- **Backend:** Medusa v2 → Railway (Postgres 16 + Redis 7)
- **Repo:** https://github.com/batlvndenbayrbileg-sys/e0commerce — branch `main`
- **Сүүлийн commit:** `baa3700` — i18n Phase 1 (эхний хэсэг)
- **Төлбөр:** Wire Payment (QPay + Монгол банкны апп), одоогоор MOCK горим
- **Имэйл:** Resend (mock/deployed), **Үнэ:** MNT (₮), USD→MNT = 3450
- **Inventory:** Medusa-д track хийгддэг, "Дууссан" badge ажилладаг
- Бодит туршилтын захиалга амжилттай орсон (NT-2, ₮144,900)

---

## ✅ Phase 1 (Монгол хэл) — ДУУССАН хэсэг
Default хэл = **Монгол**, Nav-д **МН/EN toggle** (cookie-д хадгална).
- Дэд бүтэц: `web/lib/i18n.ts` (толь бичиг, ~150 түлхүүр), `web/lib/lang.ts` (server),
  `web/components/LangProvider.tsx` (client context), `web/components/LangToggle.tsx`
- **Rubik** font нэмсэн (кирилл), Латин нь Archivo Black
- Орчуулагдсан: **Home** (`app/page.tsx`), **Nav**, **Footer**, **ProductCard**, **NewsletterForm**

> ⚠️ Чухал build дүрэм: `lib/lang.ts` нь `next/headers` ашигладаг тул **зөвхөн server component** import хийнэ.
> Client page-аас (cart, account г.м.) import хийгддэг компонент (ж: Footer) `useT()`-г `LangProvider`-аас ав, `getServerT`-г **БИШ**. Эс бөгөөс build webpack алдаа өгнө.

---

## ⬜ TODO — Phase 1-ийг дуусгах (дараалал)
Толь бичигт (`web/lib/i18n.ts`) бүх түлхүүр **аль хэдийн бэлэн** (`co.*`, `cart.*`, `acc.*`, `auth.*`, `ok.*`, `proc.*`, `common.*`). Зүгээр л компонентод `t(...)` холбоно.

1. **Product page** — `web/app/product/[slug]/page.tsx` + `AddToCart` компонент
   (Сагсанд хийх / Хэмжээ / Өнгө / tabs / "Танд бас таалагдаж магадгүй" / trust badges)
2. **Cart** — `web/app/cart/page.tsx` (Таны сагс, дүн, хүргэлт, төлбөр рүү)
3. **Checkout** — `web/app/checkout/page.tsx` (бүх form талбар, алхмууд, төлбөрийн товч)
4. **Success / Processing** — `web/app/checkout/success/page.tsx`, `web/app/checkout/processing/page.tsx`
5. **Auth** — `web/app/auth/page.tsx` (нэвтрэх / бүртгүүлэх)
6. **Account** — `web/app/account/page.tsx` (профайл, tab-ууд)
7. **Shop** — `web/app/shop/page.tsx` (гарчиг, шүүлтүүр, sort)
8. **MobileTabBar** — `web/components/MobileTabBar.tsx`

**Дараа нь:** `cd web && npm run build` (EXIT=0 болтол), дараа `git add -A && git commit && git push origin main` → Vercel автоматаар redeploy.

---

## ⬜ TODO — Дараагийн phase-ууд (эхлээгүй)
- **Phase 2 (UX):** cart drawer, ажилладаг хайлт/шүүлтүүр, PDP зураг zoom, mobile sticky CTA товч
- **Phase 3 (Animation):** хуудас хоорондын шилжилт, "add to cart" нисэх анимаци, тоо count-up
- **Phase 4 (A11y):** focus states, aria labels, keyboard navigation, contrast
- **Production:** Wire-ийг MOCK-оос бодит горимд (бодит QPay keys — нууц, надтай битгий хуваалц), Resend бодит API key

Дэлгэрэнгүй: `docs/UI_IMPROVEMENT_PLAN.md`

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

## ⚠️ Анхаарах
- Нууц түлхүүр (admin password, Wire keys, Resend key) **надтай битгий хуваалц** — env/Railway/Vercel дотор шууд тавь.
- Build амжилттай (EXIT=0) болсон тохиолдолд л push хий — эвдэрсэн build шууд live-д нөлөөлнө.
- Postgres native host дээр 5432 дээр зөрчилддөг тул Docker нь **5433** ашигладаг.
