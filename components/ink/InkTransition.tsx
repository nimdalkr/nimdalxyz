"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Ink carries the reader between pages.
 *
 * Clicking an internal link floods a blot of ink out of the cursor, the
 * navigation happens under the black, and the new page surfaces as the ink
 * sinks back into the paper. The blot edge is roughened by a displacement
 * filter on the wrapper so the flood reads as ink, not as a circle wipe.
 * Reduced motion navigates plainly.
 */
export function InkTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const wrap = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const covering = useRef(false);

  // The reveal: the route changed under the ink, so let the page surface.
  useEffect(() => {
    const w = wrap.current;
    if (!w || !covering.current) return;
    covering.current = false;
    const anim = w.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 420,
      easing: "ease",
      delay: 60,
      fill: "forwards"
    });
    anim.onfinish = () => {
      w.style.display = "none";
    };
  }, [pathname]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const uncover = () => {
      const w = wrap.current;
      if (!w) return;
      covering.current = false;
      const anim = w.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: "ease", fill: "forwards" });
      anim.onfinish = () => {
        w.style.display = "none";
      };
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      const w = wrap.current;
      const v = veil.current;
      if (!w || !v) return;
      // While the ink is in flight, swallow further clicks instead of letting
      // the browser start a second, uncovered navigation.
      event.preventDefault();
      if (covering.current) return;

      covering.current = true;
      w.style.display = "block";
      w.style.opacity = "1";
      // The veil is oversized by 90px on every side; shift the blot origin.
      const x = (event.clientX || window.innerWidth / 2) + 90;
      const y = (event.clientY || window.innerHeight / 2) + 90;
      const anim = v.animate(
        [
          { clipPath: `circle(0px at ${x}px ${y}px)` },
          { clipPath: `circle(125vmax at ${x}px ${y}px)` }
        ],
        { duration: 620, easing: "cubic-bezier(0.6, 0, 0.35, 1)", fill: "forwards" }
      );
      anim.onfinish = () => {
        router.push(url.pathname + url.search + url.hash);
        // Never trap the reader under the ink if the route fails to change.
        window.setTimeout(() => {
          if (covering.current) uncover();
        }, 3200);
      };
    };

    // Capture phase: the Link component's own click handler would otherwise
    // navigate first and leave no room for the ink to flood.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return (
    <>
      <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
        <filter id="ink-veil-rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="46" />
        </filter>
      </svg>
      <div ref={wrap} className="ink-veil-wrap" style={{ display: "none" }} aria-hidden>
        <div ref={veil} className="ink-veil" />
      </div>
    </>
  );
}
