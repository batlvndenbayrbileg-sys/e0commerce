"use client";
import { motion } from "framer-motion";

// Per-route wrapper: a subtle cross-fade on navigation. Opacity-only on purpose —
// a transform here would create a containing block and break the PDP's fixed
// sticky add-to-bag bar. Reduced motion is honored via the global MotionConfig.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
