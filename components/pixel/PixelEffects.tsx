"use client";

import { useEffect } from "react";

/** Small progressive-enhancement layer for the Pixel Pop public surfaces. */
export function PixelEffects() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-pixel-reveal]"));

    if (!reduceMotion && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              (entry.target as HTMLElement).dataset.pixelRevealed = "true";
              observer.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.1 }
      );

      revealTargets.forEach((target, index) => {
        target.style.setProperty("--pixel-reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
        observer.observe(target);
      });

      return () => observer.disconnect();
    }

    revealTargets.forEach((target) => { target.dataset.pixelRevealed = "true"; });
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (reduceMotion || coarsePointer) return;

    const cursor = document.createElement("div");
    cursor.className = "pixel-cursor";
    cursor.setAttribute("aria-hidden", "true");
    document.body.append(cursor);

    let targetX = -100;
    let targetY = -100;
    let x = targetX;
    let y = targetY;
    let frame = 0;

    const onMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      cursor.dataset.interactive = event.target instanceof Element && Boolean(event.target.closest("a, button, [data-mag]")) ? "true" : "false";
    };
    const tick = () => {
      x += (targetX - x) * 0.22;
      y += (targetY - y) * 0.22;
      cursor.style.transform = `translate(${x}px, ${y}px)`;
      frame = window.requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    frame = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.cancelAnimationFrame(frame);
      cursor.remove();
    };
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (reduceMotion || coarsePointer) return;

    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-mag]"));
    const cleanups = targets.map((target) => {
      const onMove = (event: MouseEvent) => {
        const bounds = target.getBoundingClientRect();
        const x = (event.clientX - bounds.left - bounds.width / 2) * 0.12;
        const y = (event.clientY - bounds.top - bounds.height / 2) * 0.12;
        target.style.setProperty("--pixel-mag-x", `${x}px`);
        target.style.setProperty("--pixel-mag-y", `${y}px`);
      };
      const reset = () => {
        target.style.removeProperty("--pixel-mag-x");
        target.style.removeProperty("--pixel-mag-y");
      };
      target.addEventListener("mousemove", onMove);
      target.addEventListener("mouseleave", reset);
      return () => {
        target.removeEventListener("mousemove", onMove);
        target.removeEventListener("mouseleave", reset);
      };
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return null;
}
