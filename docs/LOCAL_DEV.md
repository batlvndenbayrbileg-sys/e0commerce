# VEXO — Local dev (Docker-гүй хувилбар)

Энэ файл нь 2026-08-24-нд локал орчинг дахин ажиллуулах үед бичигдсэн.

## Tech stack

| Давхарга | Технологи |
|---|---|
| Storefront | Next.js 14 (App Router), TypeScript, Tailwind, Framer Motion, Zustand, Lenis |
| Commerce backend | **Medusa v2 (2.17)** — `medusa-backend/apps/backend`, порт **9000** (+ admin `/app`) |
| Payment/email API | Express + TypeScript (Zod, JWT, Resend) — `api/`, порт **4000** |
| Өгөгдлийн сан | PostgreSQL 15+ (Medusa), Redis — сонголтоор (тохируулаагүй бол in-memory) |
| Monorepo | npm workspaces (`web`, `api`) + Medusa-д тусдаа turbo workspace |

Бараа, үнэ, сагс, захиалга, харилцагчийн эрх — **бүгд Medusa Store API** дээр
(`web/lib/medusa.ts`). Express нь зөвхөн Wire төлбөр + имэйл хариуцна.

## 1. Postgres (порт 5433)

`infra/docker-compose.yml` нь Docker шаарддаг. Хэрэв Docker Desktop эвдэрсэн бол
локал суусан PostgreSQL-ийн binary-аар тусдаа cluster ажиллуулж болно
(`.localdb/` нь gitignore-д байгаа):

```bash
PG="/c/Program Files/PostgreSQL/18/bin"
"$PG/initdb.exe" -D .localdb/pgdata -U vexo --auth-local=trust --auth-host=trust -E UTF8   # анх нэг удаа
"$PG/pg_ctl.exe" -D .localdb/pgdata -l .localdb/pg.log -o "-p 5433" start
"$PG/createdb.exe" -h 127.0.0.1 -p 5433 -U vexo vexo_store                                  # анх нэг удаа
```

Зогсоох: `"$PG/pg_ctl.exe" -D .localdb/pgdata stop`

`medusa-backend/apps/backend/.env` дэх `DATABASE_URL` нь аль хэдийн
`postgres://vexo:vexo@127.0.0.1:5433/vexo_store` руу заасан (trust auth тул нууц үг хамаагүй).

## 2. Medusa migration + seed

```bash
cd medusa-backend/apps/backend
npx medusa db:migrate
npx medusa exec ./src/scripts/seed-region.ts
npx medusa exec ./src/scripts/seed-shipping.ts
npx medusa exec ./src/scripts/seed-vexo.ts
npx medusa exec ./src/scripts/seed-inventory.ts
npx medusa exec ./src/scripts/seed-mnt.ts
npm run dev            # → http://localhost:9000
```

Admin хэрэглэгч: `npx medusa user -e admin@vexo.gear -p <password>` → `http://localhost:9000/app`

## 3. Storefront + payment API

```bash
npm run dev            # root: api :4000 + web :3000
```

## 4. Env түлхүүрүүд

Шинэ DB болгон seed хийх бүрд **publishable key ба region id шинэчлэгдэнэ**.
Одоогийн локал утгууд `web/.env.local` болон `api/.env` дотор:

```
NEXT_PUBLIC_MEDUSA_PK     = pk_… (DB-ийн `api_key` хүснэгтээс)
NEXT_PUBLIC_MEDUSA_REGION = reg_… (Mongolia / MNT region)
```

SQL-ээр шалгах:
```bash
"$PG/psql.exe" -h 127.0.0.1 -p 5433 -U vexo -d vexo_store -c "select token from api_key; select id,name,currency_code from region;"
```

## Анхаарах зүйл

- **`npm run build` нь dev server-ийн `.next`-ийг дарж бичдэг.** Build хийсний дараа
  dev server 500 буцаавал `rm -rf web/.next && npm run dev`.
- **Docker Desktop 4.79 crash:** `%LOCALAPPDATA%\Docker\run\dockerInference` гэсэн
  хуучин socket файл үлдсэнээс "initializing Inference manager" алдаа өгч унадаг.
  Компьютерээ restart хийх (эсвэл тэр файлыг устгах) → `docker compose -f infra/docker-compose.yml up -d`
  ажиллана. Тэр үед Postgres нь мөн **5433** порт дээр гарна.
- Redis тохируулаагүй тул Medusa in-memory event bus/cache ашиглана — dev-д хангалттай.
