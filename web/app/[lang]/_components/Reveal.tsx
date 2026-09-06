"use client";
import { motion } from "framer-motion";

const ease: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

// Scroll-triggered entrance for a section or block. Rises + fades in once when it
// enters the viewport; `blur` adds a soft focus-in for hero-weight feature blocks.
// Stagger a group by giving siblings incremental `delay`. MotionConfig
// (reducedMotion="user") keeps the fade but drops the movement for a11y.
export function Reveal({
  children, delay = 0, y = 28, blur = false, className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  blur?: boolean;
  className?: string;
}) {
  const hidden = blur ? { opacity: 0, y, filter: "blur(10px)" } : { opacity: 0, y };
  const shown = blur ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 1, y: 0 };
  return (
    <motion.div
      className={className}
      initial={hidden}
      whileInView={shown}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </motion.div>
  );
}
