"use client";
import { useState } from "react";
import { ArrowRight } from "@/components/Icons";
import { useToast } from "@/lib/store";
import { useT } from "@/components/LangProvider";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const showToast = useToast(s => s.show);
  const t = useT();
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); showToast(t("news.subscribed")); setEmail(""); }}
      className="relative z-10 flex flex-col gap-3"
    >
      <div className="flex gap-2 bg-white/8 backdrop-blur border border-white/15 rounded-pill p-1.5 hover:border-white/25 transition-colors focus-within:border-white/40">
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder={t("news.placeholder")}
          className="flex-1 px-5 py-3 bg-transparent text-white placeholder:text-white/40 outline-none text-[15px]"
        />
        <button type="submit" className="btn bg-white text-ink !h-12 !px-5 hover:opacity-90">
          {t("news.subscribe")}
          <ArrowRight width={14} height={14}/>
        </button>
      </div>
      <p className="text-[11px] text-white/40 tracking-wide">{t("news.policy")}</p>
    </form>
  );
}
