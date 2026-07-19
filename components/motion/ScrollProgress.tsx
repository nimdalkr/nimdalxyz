"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

export function ScrollProgress() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 32,
    mass: 0.28
  });

  if (reduceMotion) {
    return null;
  }

  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden />;
}
