"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Metric } from "@/lib/data";
import { cn } from "@/lib/cn";

type MetricTickerProps = {
  metric: Metric;
  compact?: boolean;
};

function formatValue(value: number) {
  if (Number.isInteger(value)) {
    return value.toLocaleString("en-US");
  }

  return value.toLocaleString("en-US", {
    maximumFractionDigits: 1
  });
}

export function MetricTicker({ metric, compact = false }: MetricTickerProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(shouldReduceMotion ? metric.value : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(metric.value);
      return;
    }

    if (!inView) return;

    const controls = animate(0, metric.value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setDisplayValue
    });

    return () => controls.stop();
  }, [inView, metric.value, shouldReduceMotion]);

  return (
    <div ref={ref} className="min-w-0">
      <div
        className={cn(
          "metric-tabular font-black leading-none",
          compact ? "text-3xl md:text-4xl" : "text-5xl md:text-6xl"
        )}
      >
        {metric.prefix}
        {formatValue(displayValue)}
        {metric.suffix}
      </div>
      <div className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-white/72">
        {metric.label}
      </div>
      <div className="mt-2 text-sm leading-6 text-white/45">{metric.detail}</div>
    </div>
  );
}
