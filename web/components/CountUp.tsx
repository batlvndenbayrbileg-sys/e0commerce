"use client";
import { useEffect, useState } from "react";
import { animate } from "framer-motion";

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Animates a number from 0 up to `value` on mount / when the value changes.
export function CountUp({
  value, duration = 1, format,
}: { value: number; duration?: number; format?: (n: number) => string }) {
  const [n, setN] = useState(0);
  const fmt = format ?? ((x: number) => Math.round(x).toLocaleString());

  useEffect(() => {
    if (prefersReduced()) { setN(value); return; }
    const controls = animate(0, value, {
      duration, ease: [0.22, 0.61, 0.36, 1], onUpdate: v => setN(v),
    });
    return () => controls.stop();
  }, [value, duration]);

  return <>{fmt(Math.round(n))}</>;
}
