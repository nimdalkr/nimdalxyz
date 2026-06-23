"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import { useRef } from "react";
import { revealTransition } from "@/lib/motion";

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
};

export function Reveal({ children, delay = 0, ...props }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
      animate={shouldReduceMotion || inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ ...revealTransition, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
