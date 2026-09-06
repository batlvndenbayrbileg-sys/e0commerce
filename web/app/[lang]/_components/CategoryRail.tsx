"use client";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { Photo } from "@/components/Photo";
import { TiltCard } from "./TiltCard";

export type Cat = { label: string; href: string; img?: string };

/**
 * Bigger, image-forward category tiles with an interactive 3D tilt. A single
 * scrollable rail on mobile, an even 6-up grid on desktop.
 */
export function CategoryRail({ items }: { items: Cat[] }) {
  return (
    <div className="flex md:grid md:grid-cols-6 gap-3 sm:gap-3.5 overflow-x-auto md:overflow-visible no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0 pb-1">
      {items.map((c) => (
        <Link key={c.href} href={c.href} aria-label={c.label}
          className="block shrink-0 basis-[42%] sm:basis-[27%] md:basis-auto">
          <TiltCard max={11} lift={7}
            className="group h-full bg-white border border-line rounded-[1.4rem] p-3.5 sm:p-4 flex flex-col items-center text-center gap-3 elev-3d elev-3d-hover transition-colors duration-200 hover:border-accent/30">
            <span className="depth relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full overflow-hidden bg-surface-3 ring-2 ring-white shadow-[inset_0_0_0_1px_rgba(14,15,16,.05),0_12px_22px_-10px_rgba(14,15,16,.35)]">
              <Photo src={c.img} alt="" sizes="80px"
                fallback={<span className="w-full h-full block bg-surface-3" />}
                imgClassName="w-full h-full object-cover group-hover:scale-110" />
            </span>
            <span className="depth-sm text-[13.5px] sm:text-[14px] font-semibold leading-tight">{c.label}</span>
          </TiltCard>
        </Link>
      ))}
    </div>
  );
}
