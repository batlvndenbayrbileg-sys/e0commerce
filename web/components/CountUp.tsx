"use client";
import { useEffect, useRef, useState } from "react";

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

// Animates a number up to `value`. Re-runs whenever `value` changes (e.g. after
// async data loads) and always settles exactly on `value`.
export function CountUp({
  value, duration = 1, format,
}: { value: number; duration?: number; format?: (n: number) => string }) {
  const [n, setN] = useState(value);
  const raf = useRef<number>();
  const fmt = format ?? ((x: number) => Math.round(x).toLocaleString());

  useEffect(() => {
    if (prefersReduced() || value === 0) { setN(value); return; }
    const from = 0;
    const startTs = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - startTs) / (duration * 1000));
      setN(from + (value - from) * easeOut(p));
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else setN(value); // guarantee exact final value
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [value, duration]);

  return <>{fmt(Math.round(n))}</>;
}
