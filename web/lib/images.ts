// Beauty product photography. Files live in web/public/products/*.avif and are
// referenced by relative path (resolved against the storefront's own origin).
// In production these move to Cloudflare R2 (F5). Swap any value for your own.

const P = (n: number) => `/products/p${n}.avif`;

// 6 real product photos, cycled across the 12 slots the UI expects.
export const PRODUCT_IMG: Record<string, string> = {
  p1:  P(1), // eau de parfum (amber)
  p2:  P(2), // eau de parfum (signature)
  p3:  P(3), // cream / lotion (cream)
  p4:  P(4), // serum (amber glass)
  p5:  P(5), // gift set
  p6:  P(6), // lip / makeup (pink)
  p7:  P(1),
  p8:  P(4),
  p9:  P(5),
  p10: P(6),
  p11: P(3),
  p12: P(2),
};

export const HERO_IMG  = P(1); // fragrance hero
export const GROUP_IMG = P(5); // gift set
export const FILM_IMG  = P(4); // serum still

export const productImg = (id: string) => PRODUCT_IMG[id];
