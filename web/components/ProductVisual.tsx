import type { Product, Shape } from "@/lib/types";

function shade(hex: string, factor: number) {
  if (!hex.startsWith("#") || hex.length < 7) return hex;
  const f = (v: number) => Math.max(0, Math.min(255, Math.floor(v * factor))).toString(16).padStart(2, "0");
  return `#${f(parseInt(hex.slice(1,3),16))}${f(parseInt(hex.slice(3,5),16))}${f(parseInt(hex.slice(5,7),16))}`;
}
const isPale = (c: string) => {
  if (!c.startsWith("#") || c.length < 7) return false;
  const lum = 0.299*parseInt(c.slice(1,3),16) + 0.587*parseInt(c.slice(3,5),16) + 0.114*parseInt(c.slice(5,7),16);
  return lum > 175;
};

type V = { product: Pick<Product, "shape" | "accent">; size?: "sm" | "md" | "lg" | "xl" };

export function ProductVisual({ product, size = "md" }: V) {
  const dim = { sm: 150, md: 250, lg: 380, xl: 520 }[size];
  const c = product.accent;
  const u = c.replace("#", "") + "-" + size + "-" + product.shape;
  const id = (k: string) => `${k}-${u}`;
  const seam = isPale(c) ? "rgba(14,15,16,.16)" : "rgba(255,255,255,.22)";
  const stitch = isPale(c) ? "rgba(14,15,16,.26)" : "rgba(255,255,255,.32)";

  const Defs = (
    <defs>
      <linearGradient id={id("fab")} x1=".2" x2=".8" y1="0" y2="1">
        <stop offset="0" stopColor={shade(c, 1.18)}/>
        <stop offset=".5" stopColor={c}/>
        <stop offset="1" stopColor={shade(c, .78)}/>
      </linearGradient>
      <linearGradient id={id("dark")} x1=".2" x2=".8" y1="0" y2="1">
        <stop offset="0" stopColor={shade(c, .9)}/>
        <stop offset="1" stopColor={shade(c, .58)}/>
      </linearGradient>
      <radialGradient id={id("sh")} cx=".5" cy=".5" r=".5">
        <stop offset="0" stopColor="rgba(14,15,16,.28)"/>
        <stop offset="1" stopColor="rgba(14,15,16,0)"/>
      </radialGradient>
      <filter id={id("soft")} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
    </defs>
  );
  const Shadow = <ellipse cx="200" cy="374" rx="118" ry="13" fill={`url(#${id("sh")})`} filter={`url(#${id("soft")})`}/>;
  const hi = "rgba(255,255,255,.5)";
  const wrap = (children: React.ReactNode) => (
    <svg viewBox="0 0 400 400" width={dim} height={dim} aria-hidden>{Defs}{Shadow}{children}</svg>
  );
  // Generic beauty-bottle fallback (shown only if a product image fails to load).
  return wrap(<>
    {/* cap */}
    <rect x="176" y="70" width="48" height="44" rx="8" fill={`url(#${id("dark")})`}/>
    <rect x="184" y="110" width="32" height="18" fill={`url(#${id("dark")})`}/>
    {/* bottle body */}
    <rect x="128" y="126" width="144" height="210" rx="34" fill={`url(#${id("fab")})`}/>
    {/* liquid band */}
    <rect x="140" y="228" width="120" height="98" rx="22" fill={`url(#${id("dark")})`} opacity=".55"/>
    {/* label */}
    <rect x="158" y="180" width="84" height="36" rx="7" fill="rgba(255,255,255,.85)"/>
    {/* highlight */}
    <path d="M150 150 C146 220 148 290 154 322" stroke={hi} strokeWidth="7" fill="none"/>
  </>);
}
