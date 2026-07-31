"use client";

import { useEffect, useRef } from "react";

/**
 * A ledger number that counts itself in.
 *
 * Server-rendered with the finished value, so search engines and script-free
 * readers see the real number. Once the row is visible the digits run up from
 * zero, like a clerk totalling a column. Reduced motion keeps the total.
 */
export function InkCount({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const match = value.match(/^([^0-9]*)([\d,]+)(.*)$/);
    if (!match) return;
    const target = parseInt(match[2].replace(/,/g, ""), 10);
    if (!Number.isFinite(target) || target <= 0) return;
    const grouped = match[2].includes(",");

    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const duration = 950;
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          const n = Math.round(target * eased);
          el.textContent = match[1] + (grouped ? n.toLocaleString("en-US") : String(n)) + match[3];
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return <span ref={ref}>{value}</span>;
}
