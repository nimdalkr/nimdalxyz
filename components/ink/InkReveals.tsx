"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Structural ink.
 *
 * One observer serves the whole page: rules under record rows draw
 * themselves, labels stamp in, and headings are wiped onto the paper by an
 * invisible brush. The hidden states live behind the html.ink-ready class,
 * so a page without script (or with reduced motion) stays fully readable.
 */

/* Headings hide behind their own clip-path, which Chrome folds into the
   intersection box; observing the unclipped parent keeps the events firing. */
const TARGETS = ".cover-ink, .head, .case dl > div, .record > div";

export function InkReveals() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("ink-ready");

    const els = document.querySelectorAll<HTMLElement>(TARGETS);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("ink-in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.3, rootMargin: "0px 0px -5% 0px" }
    );
    els.forEach((el, index) => {
      el.style.setProperty("--ink-delay", `${(index % 4) * 90}ms`);
      io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
