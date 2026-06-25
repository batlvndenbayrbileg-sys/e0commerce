import { cookies } from "next/headers";
import { tFor, type Lang } from "./i18n";

// Server components: read the chosen language from the cookie (default Mongolian).
export function getServerLang(): Lang {
  return cookies().get("lang")?.value === "en" ? "en" : "mn";
}
export function getServerT() {
  return tFor(getServerLang());
}
