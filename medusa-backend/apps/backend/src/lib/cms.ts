import { Modules } from "@medusajs/framework/utils";

// Lightweight CMS for editable homepage content (spec A4 / A-22). Stored on the
// Store's metadata (metadata.cms_homepage) — no migration, and easy to expand
// later (spec AR-03: start with hero/banner, grow the model afterwards).
//
// Text fields are bilingual { mn, en } so the storefront can localize.

export type Bi = { mn: string; en: string };

export type HeroSlide = {
  kicker: Bi;
  top: Bi;
  accent: Bi;
  desc: Bi;
  img: string;
  href: string;
};

export type Promo = {
  enabled: boolean;
  kicker: Bi;
  title: Bi;
  desc: Bi;
  cta: Bi;
  href: string;
  img: string;
};

export type HomepageContent = {
  hero: HeroSlide[];
  promo: Promo;
};

const KEY = "cms_homepage";

const bi = (mn = "", en = ""): Bi => ({ mn, en });

// Empty scaffold returned when nothing has been saved yet. The storefront falls
// back to its built-in defaults when hero is empty, so this never blanks the page.
export function emptyHomepage(): HomepageContent {
  return {
    hero: [],
    promo: { enabled: false, kicker: bi(), title: bi(), desc: bi(), cta: bi(), href: "/shop", img: "" },
  };
}

async function getStore(scope: { resolve: (k: any) => any }) {
  const storeModule = scope.resolve(Modules.STORE);
  const [store] = await storeModule.listStores({}, { take: 1, select: ["id", "metadata"] as any });
  return { storeModule, store };
}

export async function readHomepage(scope: { resolve: (k: any) => any }): Promise<HomepageContent> {
  const { store } = await getStore(scope);
  const saved = (store?.metadata as any)?.[KEY];
  if (!saved) return emptyHomepage();
  const base = emptyHomepage();
  return { hero: Array.isArray(saved.hero) ? saved.hero : base.hero, promo: { ...base.promo, ...(saved.promo || {}) } };
}

export async function writeHomepage(scope: { resolve: (k: any) => any }, content: HomepageContent) {
  const { storeModule, store } = await getStore(scope);
  if (!store) throw new Error("Store not found");
  await storeModule.updateStores(store.id, {
    metadata: { ...(store.metadata || {}), [KEY]: content },
  } as any);
  return content;
}

// Normalize/validate an incoming payload into a safe HomepageContent.
export function sanitize(input: any): HomepageContent {
  const base = emptyHomepage();
  const b = (v: any): Bi => bi(String(v?.mn ?? ""), String(v?.en ?? ""));
  const hero: HeroSlide[] = Array.isArray(input?.hero)
    ? input.hero.slice(0, 8).map((s: any) => ({
        kicker: b(s?.kicker), top: b(s?.top), accent: b(s?.accent), desc: b(s?.desc),
        img: String(s?.img || ""), href: String(s?.href || "/shop"),
      }))
    : base.hero;
  const p = input?.promo || {};
  const promo: Promo = {
    enabled: !!p.enabled,
    kicker: b(p.kicker), title: b(p.title), desc: b(p.desc), cta: b(p.cta),
    href: String(p.href || "/shop"), img: String(p.img || ""),
  };
  return { hero, promo };
}
