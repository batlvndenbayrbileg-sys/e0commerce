"use client";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useUI, useQuickView } from "@/lib/store";

// Premium smooth scrolling (Lenis). Disabled entirely under reduced-motion, and
// paused while a full-height overlay is open so the background can't scroll.
export function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const cartOpen = useUI(s => s.cartOpen);
  const qvOpen = useQuickView(s => !!s.product);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Touch devices already have buttery native momentum scrolling; intercepting it
    // with JS only adds perceptible lag. Run Lenis on fine-pointer (desktop) only.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    // Premium glide: framerate-independent lerp smoothing (modern Lenis default
    // style) gives a soft, continuous deceleration that settles gracefully —
    // smoother than duration+easing, without feeling floaty or laggy.
    const lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 1, smoothWheel: true });
    lenisRef.current = lenis;
    let raf = 0;
    const loop = (time: number) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);

    // Smoothly glide to in-page anchors (#section) instead of the browser's instant jump.
    const onAnchorClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -80, duration: 1.4 });
    };
    document.addEventListener("click", onAnchorClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onAnchorClick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const l = lenisRef.current;
    if (!l) return;
    if (cartOpen || qvOpen) l.stop(); else l.start();
  }, [cartOpen, qvOpen]);

  return null;
}
