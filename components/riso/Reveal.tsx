"use client";

import { motion } from "motion/react";
import type { ElementType, ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger index. Sequence follows reading order, capped so it never drags. */
  index?: number;
  as?: ElementType;
}

/**
 * Entry for content that arrives in a sequence: list rows, plates, chapters.
 * Sheets settle onto the stack rather than sliding in from the side, so the
 * movement is a short lift on the y axis only.
 *
 * Reduced motion is handled in CSS rather than by branching here. The server
 * cannot read the preference, so branching on it would render one tree on the
 * server and a different one on the client. The stylesheet pins `[data-reveal]`
 * to its settled state instead, which also covers the no-script case.
 */
export function Reveal({ children, className, index = 0, as = "div" }: RevealProps) {
  const Component = motion[as as "div"] ?? motion.div;

  return (
    <Component
      className={className}
      data-reveal=""
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay: Math.min(index, 4) * 0.07,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      {children}
    </Component>
  );
}
