"use client";
import { useState } from "react";
import { useT } from "@/components/LangProvider";
import type { Product } from "@/lib/types";

export function Tabs({ product }: { product: Product }) {
  const t = useT();
  const [tab, setTab] = useState<"desc" | "spec" | "reviews" | "faq">("desc");
  const tabs = [["desc","pdp.tabDesc"],["spec","pdp.tabSpec"],["reviews","pdp.tabReviews"],["faq","pdp.tabFaq"]] as const;

  return (
    <>
      <div className="flex gap-1 mt-6 border-b border-border">
        {tabs.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4.5 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === k ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
            }`}>{t(label)}</button>
        ))}
      </div>

      <div className="max-w-[760px] py-6">
        {tab === "desc" && (
          <div className="text-muted leading-[1.8] text-base">
            <p>{product.description}</p>
            <ul className="list-disc pl-5 mt-4 space-y-1">
              {product.bullets.map(b => <li key={b}>{b}</li>)}
            </ul>
          </div>
        )}
        {tab === "spec" && (
          <table className="w-full">
            <tbody>
              {Object.entries(product.specs).map(([k, v]) => (
                <tr key={k} className="border-b border-border last:border-none">
                  <td className="py-3.5 text-muted w-2/5">{k}</td>
                  <td className="font-medium">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "reviews" && (
          <div className="grid gap-4">
            {[
              { n: "Camille D.", q: t("pdp.rev1Q") },
              { n: "Theo M.", q: t("pdp.rev2Q") },
            ].map(r => (
              <div key={r.n} className="card p-6">
                <div className="text-camel" aria-hidden>★★★★★</div>
                <p className="my-3">"{r.q}"</p>
                <div className="tiny">{r.n} · {t("pdp.verified")}</div>
              </div>
            ))}
          </div>
        )}
        {tab === "faq" && (
          <div>
            {[
              [t("pdp.faq1Q"), t("pdp.faq1A")],
              [t("pdp.faq2Q"), t("pdp.faq2A")],
              [t("pdp.faq3Q"), t("pdp.faq3A")],
              [t("pdp.faq4Q"), t("pdp.faq4A")],
            ].map(([q, a]) => (
              <details key={q} className="border-b border-border py-4">
                <summary className="cursor-pointer font-semibold">{q}</summary>
                <p className="mt-2.5 text-muted">{a}</p>
              </details>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
