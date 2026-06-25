"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useFly } from "@/lib/store";

// Renders the short-lived "fly to cart" clones. Honors reduced motion via the
// global MotionConfig (transforms are neutralized; the clone simply fades).
export function FlyLayer() {
  const flights = useFly(s => s.flights);
  const land = useFly(s => s.land);

  return (
    <div className="pointer-events-none fixed inset-0 z-[90]">
      <AnimatePresence>
        {flights.map(f => (
          <motion.span
            key={f.id}
            initial={{ x: f.from.x, y: f.from.y, scale: 1, opacity: 1 }}
            animate={{ x: f.to.x, y: f.to.y, scale: 0.3, opacity: 0.6 }}
            transition={{ duration: 0.65, ease: [0.22, 0.61, 0.36, 1] }}
            onAnimationComplete={() => land(f.id)}
            style={{
              position: "absolute", left: 0, top: 0,
              width: 26, height: 26, marginLeft: -13, marginTop: -13,
              borderRadius: 9999, background: f.color,
            }}
            className="shadow-lift"
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
