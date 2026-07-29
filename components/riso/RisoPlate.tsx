"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";

interface RisoPlateProps {
  src: string;
  alt: string;
  className?: string;
  /** Ink plate instead of the accent plate, for supporting imagery. */
  quiet?: boolean;
  priority?: boolean;
  sizes?: string;
  /** Misregistration distance in pixels before the plate lands. */
  offset?: number;
}

/**
 * A photograph as the press would reproduce it: one accent plate, one ink
 * impression, one halftone screen.
 *
 * The motion is the misregistration resolving. The accent plate enters offset
 * from the ink and slides into register as the element scrolls into view, which
 * tells the reader the page is being printed rather than merely scrolled. It is
 * driven entirely by motion values so nothing re-renders per frame.
 *
 * Reduced motion is pinned in CSS rather than branched here, so the server and
 * the client always render the same tree.
 */
export function RisoPlate({
  src,
  alt,
  className,
  quiet = false,
  priority = false,
  sizes = "(max-width: 767px) 100vw, 50vw",
  offset = 14
}: RisoPlateProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"]
  });
  const settle = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });
  const x = useTransform(settle, [0, 1], [-offset, 0]);
  const y = useTransform(settle, [0, 1], [offset * 0.75, 0]);

  return (
    <span
      ref={ref}
      className={["riso-plate", quiet ? "riso-plate-quiet" : "", className].filter(Boolean).join(" ")}
    >
      <motion.span className="riso-plate-flo" style={{ x, y }} aria-hidden />
      <span className="riso-plate-ink">
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} />
      </span>
    </span>
  );
}
