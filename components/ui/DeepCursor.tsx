"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

export function DeepCursor() {
  const shouldReduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const x = useSpring(useMotionValue(-100), { stiffness: 260, damping: 28, mass: 0.22 });
  const y = useSpring(useMotionValue(-100), { stiffness: 260, damping: 28, mass: 0.22 });

  useEffect(() => {
    if (shouldReduceMotion || !window.matchMedia("(pointer: fine)").matches) return;

    setEnabled(true);

    const handleMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [shouldReduceMotion, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      className="motion-heavy pointer-events-none fixed left-0 top-0 z-40 h-16 w-16 -translate-x-1/2 -translate-y-1/2 border border-[var(--cyan)]/55 mix-blend-screen"
      style={{ x, y }}
      aria-hidden
    >
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[var(--cyan)]/24" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[var(--cyan)]/24" />
      <span className="absolute inset-3 border border-[var(--acid)]/35" />
    </motion.div>
  );
}
