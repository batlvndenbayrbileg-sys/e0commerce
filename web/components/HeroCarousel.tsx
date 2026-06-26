"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Photo } from "./Photo";
import { ArrowUpRight } from "./Icons";
import { useT } from "./LangProvider";

export type Slide = {
  kicker: string;
  top: string;
  accent: string;
  desc: string;
  img?: string;
  href: string;
};

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const paused = useRef(false);
  const t = useT();
  const canParallax = useRef(true);
  useEffect(() => { canParallax.current = !window.matchMedia("(prefers-reduced-motion: reduce)").matches; }, []);

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const child = el.children[i] as HTMLElement;
    if (!child) return;
    el.scrollTo({ left: child.offsetLeft - (el.clientWidth - child.clientWidth) / 2, behavior: "smooth" });
  };

  useEffect(() => {
    const id = setInterval(() => {
      if (paused.current) return;
      setActive(prev => {
        const next = (prev + 1) % slides.length;
        goTo(next);
        return next;
      });
    }, 4500);
    return () => clearInterval(id);
  }, [slides.length]);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0, bd = Infinity;
    Array.from(el.children).forEach((c, i) => {
      const ch = c as HTMLElement;
      const cc = ch.offsetLeft + ch.offsetWidth / 2;
      const delta = cc - center;
      const d = Math.abs(delta);
      if (d < bd) { bd = d; best = i; }
      // Subtle parallax: the image drifts opposite to the slide's offset.
      const wrap = imgRefs.current[i];
      if (wrap) wrap.style.transform = `scale(1.12) translateX(${canParallax.current ? delta * -0.04 : 0}px)`;
    });
    setActive(best);
  };

  return (
    <div>
      <div
        ref={ref}
        onScroll={onScroll}
        onPointerDown={() => (paused.current = true)}
        onPointerUp={() => (paused.current = false)}
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
        className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-1 px-1 pb-1"
        style={{ scrollPadding: "0 4px" }}
      >
        {slides.map((s, i) => (
          <Link
            key={i}
            href={s.href}
            className="snap-center shrink-0 w-full relative overflow-hidden rounded-[1.75rem] card-dark text-white grainy aspect-[16/11] sm:aspect-[5/2]"
          >
            <div ref={el => { imgRefs.current[i] = el; }} className="absolute inset-0 will-change-transform" style={{ transform: "scale(1.12)" }}>
              <Photo src={s.img} alt={`${s.top} ${s.accent}`} fallback={<div className="absolute inset-0"/>}
                priority={i === 0} sizes="100vw"
                imgClassName="absolute inset-0 w-full h-full object-cover"/>
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0B0C0D]/92 via-[#0B0C0D]/45 to-transparent"/>
            <div className="absolute -left-16 -top-16 w-56 h-56 rounded-full bg-accent/40 blur-3xl"/>

            <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-9">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-white/12 backdrop-blur text-[11px] font-semibold uppercase tracking-[.16em] w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"/> {s.kicker}
              </span>
              <div>
                <h2 className="font-display uppercase leading-[.85] tracking-[-.02em] text-[clamp(34px,9vw,72px)]">
                  {s.top}<br/><span className="text-accent">{s.accent}</span>
                </h2>
                <p className="text-white/70 text-[13px] mt-2 max-w-[260px]">{s.desc}</p>
                <span className="inline-flex items-center gap-2.5 h-11 pl-5 pr-1.5 mt-5 rounded-pill bg-accent text-ink text-[13px] font-semibold uppercase tracking-wide">
                  {t("common.shopNow")}
                  <span className="w-8 h-8 rounded-full bg-white text-ink grid place-items-center"><ArrowUpRight width={14} height={14}/></span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* dots */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setActive(i); goTo(i); }}
            aria-label={`${t("a11y.slide")} ${i + 1}`}
            className="grid place-items-center h-6 w-6"
          >
            <span className={`block h-1.5 rounded-pill transition-all ${i === active ? "w-6 bg-accent" : "w-1.5 bg-ink/20"}`}/>
          </button>
        ))}
      </div>
    </div>
  );
}
