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
  const hi = "rgba(255,255,255,.14)";
  const s = product.shape;

  const wrap = (children: React.ReactNode) => (
    <svg viewBox="0 0 400 400" width={dim} height={dim} aria-hidden>{Defs}{Shadow}{children}</svg>
  );

  if (s === "hoodie") return wrap(<>
    {/* hood */}
    <path d="M150 86 C150 58 250 58 250 86 L262 132 C232 116 168 116 138 132 Z" fill={`url(#${id("dark")})`}/>
    <path d="M168 96 C185 112 215 112 232 96" fill="none" stroke={seam} strokeWidth="2"/>
    {/* sleeves */}
    <path d="M120 120 L66 184 L92 250 L138 196 Z" fill={`url(#${id("dark")})`}/>
    <path d="M280 120 L334 184 L308 250 L262 196 Z" fill={`url(#${id("dark")})`}/>
    {/* body */}
    <path d="M132 118 C160 104 240 104 268 118 L268 332 L132 332 Z" fill={`url(#${id("fab")})`}/>
    {/* ribbed hem + cuffs */}
    <rect x="132" y="314" width="136" height="18" fill={`url(#${id("dark")})`}/>
    {[150,170,190,210,230,250].map(x=> <line key={x} x1={x} y1="314" x2={x} y2="332" stroke={seam} strokeWidth="1.5"/>)}
    <rect x="72" y="230" width="52" height="16" fill={`url(#${id("dark")})`} transform="rotate(42 98 238)"/>
    <rect x="276" y="230" width="52" height="16" fill={`url(#${id("dark")})`} transform="rotate(-42 302 238)"/>
    {/* kangaroo pocket */}
    <path d="M156 250 L244 250 L236 300 L164 300 Z" fill="none" stroke={seam} strokeWidth="2"/>
    {/* drawcords */}
    <line x1="186" y1="128" x2="184" y2="180" stroke={stitch} strokeWidth="2.5"/>
    <line x1="214" y1="128" x2="216" y2="180" stroke={stitch} strokeWidth="2.5"/>
    <path d="M156 150 C150 230 152 290 156 310" stroke={hi} strokeWidth="6" fill="none"/>
  </>);

  if (s === "jacket") return wrap(<>
    {/* hood collar */}
    <path d="M156 84 C156 64 244 64 244 84 L256 120 C232 108 168 108 144 120 Z" fill={`url(#${id("dark")})`}/>
    {/* sleeves */}
    <path d="M120 116 L64 182 L90 250 L138 192 Z" fill={`url(#${id("fab")})`}/>
    <path d="M280 116 L336 182 L310 250 L262 192 Z" fill={`url(#${id("fab")})`}/>
    {/* body */}
    <path d="M134 112 C160 98 240 98 266 112 L270 338 L130 338 Z" fill={`url(#${id("fab")})`}/>
    {/* center zip */}
    <line x1="200" y1="116" x2="200" y2="332" stroke={stitch} strokeWidth="2.5" strokeDasharray="3 3"/>
    <rect x="195" y="120" width="10" height="16" rx="2" fill={stitch}/>
    {/* zip chest + hand pockets */}
    <line x1="210" y1="170" x2="246" y2="170" stroke={seam} strokeWidth="2" strokeDasharray="2 3"/>
    <line x1="150" y1="270" x2="180" y2="290" stroke={seam} strokeWidth="2" strokeDasharray="2 3"/>
    <line x1="250" y1="270" x2="220" y2="290" stroke={seam} strokeWidth="2" strokeDasharray="2 3"/>
    {/* laser vents */}
    {[250,260,270].map(y=> <line key={y} x1="160" y1={y} x2="240" y2={y} stroke={seam} strokeWidth=".8" opacity=".5"/>)}
    <path d="M150 130 C146 230 148 300 150 330" stroke={hi} strokeWidth="6" fill="none"/>
  </>);

  if (s === "tank") return wrap(<>
    {/* straps / shoulders */}
    <path d="M150 110 C160 92 175 86 188 96 L184 150 L150 150 Z" fill={`url(#${id("dark")})`}/>
    <path d="M250 110 C240 92 225 86 212 96 L216 150 L250 150 Z" fill={`url(#${id("dark")})`}/>
    {/* body */}
    <path d="M150 120 C170 108 230 108 250 120 L262 332 L138 332 Z" fill={`url(#${id("fab")})`}/>
    {/* neckline */}
    <path d="M184 96 C192 116 208 116 216 96" fill="none" stroke={seam} strokeWidth="2"/>
    {/* deep armholes */}
    <path d="M150 122 C150 170 156 210 150 250" fill="none" stroke={seam} strokeWidth="1.5"/>
    <path d="M250 122 C250 170 244 210 250 250" fill="none" stroke={seam} strokeWidth="1.5"/>
    <path d="M170 150 C166 240 168 300 172 326" stroke={hi} strokeWidth="6" fill="none"/>
  </>);

  if (s === "tee") return wrap(<>
    {/* sleeves */}
    <path d="M126 112 L78 156 L98 206 L142 168 Z" fill={`url(#${id("dark")})`}/>
    <path d="M274 112 L322 156 L302 206 L258 168 Z" fill={`url(#${id("dark")})`}/>
    {/* body */}
    <path d="M138 108 C162 94 238 94 262 108 L264 320 L136 320 Z" fill={`url(#${id("fab")})`}/>
    {/* crew neck */}
    <path d="M176 100 C188 118 212 118 224 100" fill="none" stroke={seam} strokeWidth="3"/>
    <path d="M178 96 C190 110 210 110 222 96" fill="none" stroke={stitch} strokeWidth="1.5"/>
    {/* raw hem */}
    <line x1="136" y1="314" x2="264" y2="314" stroke={seam} strokeWidth="1.5" strokeDasharray="2 3"/>
    <path d="M162 130 C158 220 160 280 162 312" stroke={hi} strokeWidth="6" fill="none"/>
  </>);

  if (s === "longsleeve") return wrap(<>
    {/* sleeves (long) */}
    <path d="M124 110 L70 188 L88 300 L138 286 L140 176 Z" fill={`url(#${id("dark")})`}/>
    <path d="M276 110 L330 188 L312 300 L262 286 L260 176 Z" fill={`url(#${id("dark")})`}/>
    {/* thumbhole cuffs */}
    <rect x="84" y="286" width="40" height="16" rx="4" fill={`url(#${id("fab")})`}/>
    <rect x="276" y="286" width="40" height="16" rx="4" fill={`url(#${id("fab")})`}/>
    {/* body */}
    <path d="M138 106 C162 92 238 92 262 106 L262 322 L138 322 Z" fill={`url(#${id("fab")})`}/>
    {/* compression seam zones */}
    <path d="M160 120 L160 318" stroke={seam} strokeWidth="1.5" opacity=".6"/>
    <path d="M240 120 L240 318" stroke={seam} strokeWidth="1.5" opacity=".6"/>
    <path d="M180 150 C195 165 205 165 220 150" fill="none" stroke={seam} strokeWidth="1" opacity=".5"/>
    <path d="M176 96 C190 110 210 110 224 96" fill="none" stroke={stitch} strokeWidth="2"/>
    <path d="M160 130 C156 220 158 280 160 314" stroke={hi} strokeWidth="5" fill="none"/>
  </>);

  if (s === "joggers") return wrap(<>
    {/* waistband */}
    <rect x="138" y="70" width="124" height="28" rx="8" fill={`url(#${id("dark")})`}/>
    <line x1="186" y1="88" x2="186" y2="74" stroke={stitch} strokeWidth="2.5"/>
    <line x1="214" y1="88" x2="214" y2="74" stroke={stitch} strokeWidth="2.5"/>
    {/* legs (tapered) */}
    <path d="M140 96 L150 330 L188 330 L200 150 L196 96 Z" fill={`url(#${id("fab")})`}/>
    <path d="M260 96 L250 330 L212 330 L200 150 L204 96 Z" fill={`url(#${id("fab")})`}/>
    {/* ribbed ankle cuffs */}
    <rect x="150" y="326" width="38" height="16" fill={`url(#${id("dark")})`}/>
    <rect x="212" y="326" width="38" height="16" fill={`url(#${id("dark")})`}/>
    {/* zip pockets */}
    <line x1="150" y1="120" x2="160" y2="160" stroke={seam} strokeWidth="2" strokeDasharray="2 3"/>
    <line x1="250" y1="120" x2="240" y2="160" stroke={seam} strokeWidth="2" strokeDasharray="2 3"/>
    {/* seams */}
    <line x1="170" y1="100" x2="168" y2="326" stroke={seam} strokeWidth="1.5"/>
    <line x1="230" y1="100" x2="232" y2="326" stroke={seam} strokeWidth="1.5"/>
    <path d="M158 110 C156 220 158 300 160 320" stroke={hi} strokeWidth="5" fill="none"/>
  </>);

  if (s === "shorts") return wrap(<>
    <rect x="138" y="96" width="124" height="26" rx="8" fill={`url(#${id("dark")})`}/>
    <line x1="186" y1="114" x2="186" y2="100" stroke={stitch} strokeWidth="2.5"/>
    <line x1="214" y1="114" x2="214" y2="100" stroke={stitch} strokeWidth="2.5"/>
    {/* legs (short) */}
    <path d="M140 120 L146 250 L194 250 L200 168 L198 120 Z" fill={`url(#${id("fab")})`}/>
    <path d="M260 120 L254 250 L206 250 L200 168 L202 120 Z" fill={`url(#${id("fab")})`}/>
    {/* center + hems */}
    <line x1="200" y1="124" x2="200" y2="168" stroke={seam} strokeWidth="1.5"/>
    <line x1="146" y1="244" x2="194" y2="244" stroke={seam} strokeWidth="1.5"/>
    <line x1="206" y1="244" x2="254" y2="244" stroke={seam} strokeWidth="1.5"/>
    {/* vents */}
    {[150,160,170].map(y=> <line key={y} x1="155" y1={y} x2="190" y2={y} stroke={seam} strokeWidth=".7" opacity=".5"/>)}
    <path d="M158 130 C156 190 158 230 160 244" stroke={hi} strokeWidth="5" fill="none"/>
  </>);

  if (s === "leggings") return wrap(<>
    <rect x="146" y="64" width="108" height="30" rx="10" fill={`url(#${id("dark")})`}/>
    {/* legs (full, contoured) */}
    <path d="M148 92 L162 352 L196 352 L200 150 L198 92 Z" fill={`url(#${id("fab")})`}/>
    <path d="M252 92 L238 352 L204 352 L200 150 L202 92 Z" fill={`url(#${id("fab")})`}/>
    {/* sculpt panel seams */}
    <path d="M172 100 C166 200 168 300 170 348" fill="none" stroke={seam} strokeWidth="1.5"/>
    <path d="M228 100 C234 200 232 300 230 348" fill="none" stroke={seam} strokeWidth="1.5"/>
    <path d="M180 150 C195 170 205 170 220 150" fill="none" stroke={seam} strokeWidth="1" opacity=".5"/>
    <path d="M178 230 C195 250 205 250 222 230" fill="none" stroke={seam} strokeWidth="1" opacity=".5"/>
    <path d="M162 100 C158 220 160 320 164 348" stroke={hi} strokeWidth="5" fill="none"/>
  </>);

  if (s === "cap") return wrap(<>
    {/* crown */}
    <path d="M120 230 C120 150 280 150 280 232 C240 218 160 218 120 230 Z" fill={`url(#${id("fab")})`}/>
    {/* panel seams */}
    <path d="M200 158 L200 224" stroke={seam} strokeWidth="1.5"/>
    <path d="M160 164 C160 200 162 218 164 226" stroke={seam} strokeWidth="1.2" opacity=".6"/>
    <path d="M240 164 C240 200 238 218 236 226" stroke={seam} strokeWidth="1.2" opacity=".6"/>
    {/* button */}
    <circle cx="200" cy="158" r="6" fill={`url(#${id("dark")})`}/>
    {/* brim */}
    <path d="M118 230 C160 270 320 264 332 224 C300 250 150 256 118 230 Z" fill={`url(#${id("dark")})`}/>
    {/* perforations */}
    {[170,200,230].map(x=> <circle key={x} cx={x} cy="196" r="2" fill={seam}/>)}
    <path d="M150 175 C148 200 150 215 154 224" stroke={hi} strokeWidth="5" fill="none"/>
  </>);

  // bag (sling)
  return wrap(<>
    {/* strap */}
    <path d="M118 150 C160 90 250 96 286 150" fill="none" stroke={`url(#${id("dark")})`} strokeWidth="16" strokeLinecap="round"/>
    {/* body — angled sling */}
    <path d="M120 150 L300 168 L286 268 L106 250 Z" fill={`url(#${id("fab")})`}/>
    {/* front zip pocket */}
    <path d="M132 196 L284 210 L280 244 L128 230 Z" fill={`url(#${id("dark")})`}/>
    <line x1="138" y1="206" x2="276" y2="218" stroke={stitch} strokeWidth="2" strokeDasharray="3 3"/>
    {/* clip */}
    <rect x="192" y="150" width="22" height="14" rx="3" fill={`url(#${id("dark")})`}/>
    {/* webbing detail */}
    <line x1="120" y1="170" x2="300" y2="188" stroke={seam} strokeWidth="1.5" opacity=".6"/>
    <path d="M134 162 C130 200 132 230 138 248" stroke={hi} strokeWidth="5" fill="none"/>
  </>);
}
