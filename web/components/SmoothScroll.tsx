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
    const lenis = new Lenis({ duration: 1.05, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenisRef.current = lenis;
    let raf = 0;
    const loop = (time: number) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); lenisRef.current = null; };
  }, []);

  useEffect(() => {
    const l = lenisRef.current;
    if (!l) return;
    if (cartOpen || qvOpen) l.stop(); else l.start();
  }, [cartOpen, qvOpen]);

  return null;
}
