"use client";
import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLang } from "./LangProvider";

// Drop-in replacement for next/link that keeps navigation inside the current
// locale: internal paths ("/shop") are prefixed with "/{lang}". External URLs,
// hashes, and already-prefixed paths pass through unchanged.
export function LocaleLink({ href, ...props }: ComponentProps<typeof NextLink>) {
  const lang = useLang();
  let h = href;
  if (typeof href === "string" && href.startsWith("/")) {
    const prefixed = href === `/${lang}` || href.startsWith(`/${lang}/`);
    if (!prefixed) h = href === "/" ? `/${lang}` : `/${lang}${href}`;
  }
  return <NextLink href={h} {...props} />;
}
