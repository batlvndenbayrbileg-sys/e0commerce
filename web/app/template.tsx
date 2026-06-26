"use client";
import { motion } from "framer-motion";

// Module-level flag (client only): false until the first client mount this session.
let warm = false;

// Per-route cross-fade — but only on client-side NAVIGATIONS. The very first
// paint (SSR + first hydration) renders fully visible so it never hides the LCP
// element behind opacity:0. Opacity-only so it can't break the PDP fixed CTA.
export default function Template({ children }: { children: React.ReactNode }) {
  const firstPaint = !warm;
  if (typeof window !== "undefined") warm = true;
  return (
    <motion.div
      initial={firstPaint ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
