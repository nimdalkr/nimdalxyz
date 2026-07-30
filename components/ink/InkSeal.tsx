"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * A seal that stamps itself.
 *
 * It waits above the paper until the record scrolls into view, then comes down
 * hard: scale and rotation land in one press, the way a real seal meets paper.
 * Reduced motion renders it already stamped.
 */
export function InkSeal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tween = gsap.fromTo(
      el,
      { scale: 1.8, opacity: 0, rotate: -16 },
      {
        scale: 1,
        opacity: 1,
        rotate: -4,
        duration: 0.3,
        ease: "power3.in",
        scrollTrigger: { trigger: el, start: "top 86%" },
        onComplete: () => window.dispatchEvent(new Event("ink-stamp"))
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <span ref={ref} className={className ? `seal ${className}` : "seal"} aria-hidden>
      {children}
    </span>
  );
}
