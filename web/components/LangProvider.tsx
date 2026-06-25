"use client";
import { createContext, useContext } from "react";
import { tFor, type Lang } from "@/lib/i18n";

const LangCtx = createContext<Lang>("mn");

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangCtx.Provider value={lang}>{children}</LangCtx.Provider>;
}

export function useLang(): Lang {
  return useContext(LangCtx);
}
export function useT() {
  return tFor(useContext(LangCtx));
}
export function setLang(l: Lang) {
  document.cookie = `lang=${l};path=/;max-age=31536000;samesite=lax`;
  location.reload();
}
