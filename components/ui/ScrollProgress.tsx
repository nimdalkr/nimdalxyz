"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

export function ScrollProgress() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 });

  if (shouldReduceMotion) return null;

  return (
    <motion.div
      aria-hidden
      className="fixed left-0 top-0 z-50 h-[2px] w-full origin-left bg-[var(--cyan)] shadow-[0_0_18px_rgba(85,214,194,0.72)]"
      style={{ scaleX }}
    />
  );
}
