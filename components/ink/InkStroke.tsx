"use client";

import { useEffect, useId, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * A brush stroke that gets drawn.
 *
 * The scroll is the pen: by default the stroke's progress is scrubbed to the
 * viewport position, so descending draws it and ascending erases it. Cover
 * strokes draw once on load instead: the first mark on the paper is the
 * arrival. Edges are roughened with displaced turbulence so the line reads as
 * ink on fibre, not vector on screen.
 *
 * Under prefers-reduced-motion every stroke renders finished. The text of the
 * page never depends on a stroke: these are the calligraphy, not the content.
 */

interface InkStrokeProps {
  d: string;
  viewBox: string;
  strokeWidth?: number;
  className?: string;
  /** "scroll" scrubs to viewport position; "load" draws once on mount. */
  mode?: "scroll" | "load";
  /** Seconds, only for load mode. */
  duration?: number;
  delay?: number;
  /** 0..1 of the stroke to leave undrawn (tapered finish). */
  color?: string;
  rough?: number;
}

export function InkStroke({
  d,
  viewBox,
  strokeWidth = 12,
  className,
  mode = "scroll",
  duration = 1.1,
  delay = 0,
  color = "var(--ink)",
  rough = 5
}: InkStrokeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const filterId = useId().replace(/[:]/g, "");

  useEffect(() => {
    const path = pathRef.current;
    const svg = svgRef.current;
    if (!path || !svg) return;

    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      path.style.strokeDashoffset = "0";
      return;
    }

    path.style.strokeDashoffset = `${length}`;

    if (mode === "load") {
      const tween = gsap.to(path, {
        strokeDashoffset: 0,
        duration,
        delay,
        ease: "power2.inOut"
      });
      return () => { tween.kill(); };
    }

    const tween = gsap.to(path, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: svg,
        start: "top 88%",
        end: "top 42%",
        scrub: 0.6
      }
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [mode, duration, delay]);

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox={viewBox}
      fill="none"
      aria-hidden
      focusable="false"
    >
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={rough} />
        </filter>
      </defs>
      <path
        ref={pathRef}
        d={d}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${filterId})`}
      />
    </svg>
  );
}
