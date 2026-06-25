"use client";
import { useState } from "react";
import type { Product } from "@/lib/types";

export function Tabs({ product }: { product: Product }) {
  const [tab, setTab] = useState<"desc" | "spec" | "reviews" | "faq">("desc");
  const tabs = [["desc","Description"],["spec","Specs"],["reviews","Reviews"],["faq","FAQ"]] as const;

  return (
    <>
      <div className="flex gap-1 mt-6 border-b border-border">
        {tabs.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4.5 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === k ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
            }`}>{label}</button>
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
              { n: "Camille D.", q: "Three winters in and it looks better than the day it arrived. The fit is exactly as described." },
              { n: "Theo M.", q: "Runs true to size. I'm usually between M and L — took the L for layering and it's perfect." },
            ].map(r => (
              <div key={r.n} className="card p-6">
                <div className="text-camel">★★★★★</div>
                <p className="my-3">"{r.q}"</p>
                <div className="tiny">{r.n} · Verified buyer</div>
              </div>
            ))}
          </div>
        )}
        {tab === "faq" && (
          <div>
            {[
              ["How does it fit?", "Athletic fit, true to size. Between sizes? Size up for layering, down for a compression feel. See the size guide above each option."],
              ["How should I care for it?", "Machine wash cold and hang or tumble low — technical fabrics keep their stretch and wicking best without high heat or fabric softener."],
              ["What does the performance warranty cover?", "Every VEXO piece is covered for one year against seam failure and fabric defects under normal training use."],
              ["What are shipping and returns like?", "Free shipping over $200 and free returns within 30 days. Items arrive in 3–5 business days, tracked."],
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
