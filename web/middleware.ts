import { NextRequest, NextResponse } from "next/server";
import { LANGS, isLang } from "@/lib/i18n";

// Locale routing: every page lives under /mn or /en. Requests without a locale
// prefix are redirected to the visitor's saved locale (cookie) or the default
// (mn). Static files, _next, api, sitemap/robots (paths with a dot) are excluded
// by the matcher below, so this never runs for them.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const hasLocale = LANGS.some(l => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return NextResponse.next();

  const cookieLang = req.cookies.get("lang")?.value;
  const lang = isLang(cookieLang) ? cookieLang : "mn";

  const url = req.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Run on everything except _next internals, api routes, and files with an
  // extension (sitemap.xml, robots.txt, icon.svg, /products/*.avif, …).
  matcher: ["/((?!_next|api|.*\\.).*)"],
};
