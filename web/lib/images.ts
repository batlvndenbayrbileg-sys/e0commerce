// Real athletic / streetwear photography (Unsplash CDN).
// Swap any URL here to use your own campaign imagery — drop files in /public
// and replace the value with e.g. "/img/hoodie.jpg".

const U = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const PRODUCT_IMG: Record<string, string> = {
  p1:  U("1517836357463-d25dfeac3438"), // tech fleece hoodie
  p2:  U("1571019613454-1cb2f99b2d8b"), // performance tank
  p3:  U("1534438327276-14e5300c3a48"), // training joggers
  p4:  U("1549060279-7e168fcee0c2"),    // compression long sleeve
  p5:  U("1483721310020-03333e577078"), // windbreaker jacket
  p6:  U("1581009146145-b5ef050c2e1e"), // lined shorts
  p7:  U("1518611012118-696072aa579a"), // seamless leggings
  p8:  U("1594381898411-846e7d193883"), // cropped tee
  p9:  U("1605296867304-46d5465a13f1"), // sling bag
  p10: U("1538805060514-97d9cc17730c"), // performance cap
  p11: U("1556817411-31ae72fa3ea0"),    // thermal base
  p12: U("1610384104075-e05c8cf200c3"), // cargo tech pants
};

export const HERO_IMG  = U("1539109136881-3be0616acf4b", 1100); // bold athletic portrait
export const GROUP_IMG = U("1521572163474-6864f9cf17ab", 1100); // streetwear group
export const FILM_IMG  = U("1542291026-7eec264c27ff", 700);     // sneaker / training clip still

export const productImg = (id: string) => PRODUCT_IMG[id];
