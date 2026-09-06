"use client";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Interactive 3D tilt card. Follows the cursor with a perspective rotate + lift
 * and a soft glare that tracks the pointer, so the card feels physical and
 * responsive. Desktop (fine pointer) only and disabled under reduced-motion —
 * everywhere else it renders as a plain elevated card (no JS transform), so
 * touch never gets a stuck tilt. Children opt into parallax depth with the
 * `.depth` utility (translateZ), which reads as floating above the surface.
 */
export function TiltCard({
  children,
  className = "",
  max = 9,
  lift = 6,
  scale = 1.03,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  max?: number;   // peak rotation in degrees
  lift?: number;  // px raised toward the viewer on hover
  scale?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useRef(false);
  const raf = useRef(0);

  useEffect(() => {
    enabled.current =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const onMove = (e: React.MouseEvent) => {
    if (!enabled.current) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;  // 0..1 across
    const py = (e.clientY - r.top) / r.height;  // 0..1 down
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.transition = "transform .1s ease-out";
      el.style.transform =
        `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateY(${-lift}px) scale(${scale})`;
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
    });
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.style.transition = "transform .55s cubic-bezier(.22,.61,.36,1)";
    el.style.transform = "";
  };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={`tilt-card ${className}`}>
      {children}
      {glare && <span aria-hidden className="tilt-glare" />}
    </div>
  );
}
