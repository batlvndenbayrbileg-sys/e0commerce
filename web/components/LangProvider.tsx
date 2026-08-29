"use client";
import { createContext, useContext } from "react";
import { MotionConfig } from "framer-motion";
import { tFor, type Lang } from "@/lib/i18n";

const LangCtx = createContext<Lang>("mn");

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <LangCtx.Provider value={lang}>
      {/* Honor the OS "reduce motion" preference across all Framer Motion animations. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LangCtx.Provider>
  );
}

export function useLang(): Lang {
  return useContext(LangCtx);
}
export function useT() {
  return tFor(useContext(LangCtx));
}
export function setLang(l: Lang) {
  // Remember the choice (middleware uses it for locale-less URLs) and navigate to
  // the same page under the new locale prefix.
  document.cookie = `lang=${l};path=/;max-age=31536000;samesite=lax`;
  const stripped = window.location.pathname.replace(/^\/(mn|en)(?=\/|$)/, "");
  window.location.href = `/${l}${stripped}${window.location.search}`;
}
