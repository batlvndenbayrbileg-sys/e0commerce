import { tFor, type Lang } from "@/lib/i18n";

const ico = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const Truck = () => (<svg {...ico}><path d="M3 6h11v9H3z"/><path d="M14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/></svg>);
const Returns = () => (<svg {...ico}><path d="M3 9a9 9 0 0 1 15-3l3 3"/><path d="M21 4v5h-5"/><path d="M21 15a9 9 0 0 1-15 3l-3-3"/><path d="M3 20v-5h5"/></svg>);
const Shield = () => (<svg {...ico}><path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>);
const Secure = () => (<svg {...ico}><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);

const ITEMS = [
  { Icon: Truck, k: "home.vpShip", s: "home.vpShipSub" },
  { Icon: Returns, k: "home.vpReturns", s: "home.vpReturnsSub" },
  { Icon: Shield, k: "home.vpWarranty", s: "home.vpWarrantySub" },
  { Icon: Secure, k: "home.vpSecure", s: "home.vpSecureSub" },
];

export function ValueProps({ lang }: { lang: Lang }) {
  const t = tFor(lang);
  return (
    <section className="mt-9">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {ITEMS.map(({ Icon, k, s }) => (
          <div key={k} className="flex items-center gap-3 bg-white border border-line rounded-2xl p-3.5 sm:p-4 shadow-soft">
            <span className="w-10 h-10 rounded-full bg-surface-2 grid place-items-center text-ink shrink-0"><Icon /></span>
            <div className="min-w-0">
              <div className="font-semibold text-[13px] leading-tight">{t(k)}</div>
              <div className="tiny truncate">{t(s)}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
