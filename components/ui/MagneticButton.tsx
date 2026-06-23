"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import type { MouseEvent, MouseEventHandler, ReactNode } from "react";
import { useRef } from "react";
import { cn } from "@/lib/cn";

type MagneticButtonProps = Omit<HTMLMotionProps<"a">, "children" | "onMouseLeave" | "onMouseMove"> & {
  children: ReactNode;
  onMouseLeave?: MouseEventHandler<HTMLAnchorElement>;
  onMouseMove?: MouseEventHandler<HTMLAnchorElement>;
  variant?: "solid" | "ghost";
};

export function MagneticButton({
  children,
  className,
  variant = "solid",
  onMouseLeave,
  onMouseMove,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 240, damping: 18, mass: 0.35 });
  const y = useSpring(useMotionValue(0), { stiffness: 240, damping: 18, mass: 0.35 });

  const supportsFinePointer = () =>
    typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

  const handleMove = (event: MouseEvent<HTMLAnchorElement>) => {
    onMouseMove?.(event);
    if (shouldReduceMotion || !supportsFinePointer() || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * 0.18);
    y.set((event.clientY - (rect.top + rect.height / 2)) * 0.18);
  };

  const handleLeave = (event: MouseEvent<HTMLAnchorElement>) => {
    onMouseLeave?.(event);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      className={cn(
        "group inline-flex min-h-12 items-center justify-center gap-2 rounded-md border px-5 py-3 text-sm font-black uppercase tracking-[0.12em] transition-colors duration-300",
        variant === "solid"
          ? "border-[var(--acid)] bg-[var(--acid)] text-black shadow-[0_0_32px_rgba(199,241,91,0.22)] hover:bg-[var(--fg)]"
          : "border-white/16 bg-white/[0.035] text-white hover:border-white/42 hover:bg-white/[0.07]",
        className
      )}
      style={shouldReduceMotion ? undefined : { x, y }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...props}
    >
      <span>{children}</span>
      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </motion.a>
  );
}
