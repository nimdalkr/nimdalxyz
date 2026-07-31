"use client";

import { useEffect, useRef } from "react";

/**
 * The visitor holds a brush.
 *
 * A fixed canvas follows the pointer with a trail of ink that thins as the
 * hand speeds up and dries away within a second. Pressing down loads the
 * brush. Fine pointers only; touch and reduced motion leave the paper clean.
 */

type Point = { x: number; y: number; t: number; w: number };

export function InkBrush() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      cv.width = window.innerWidth * dpr;
      cv.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const points: Point[] = [];
    const LIFE = 950;
    let raf = 0;
    let live = false;
    let pressed = false;

    const render = () => {
      const now = performance.now();
      while (points.length && now - points[0].t > LIFE) points.shift();
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.lineCap = "round";
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        if (b.t - a.t > 90) continue;
        const age = (now - b.t) / LIFE;
        ctx.strokeStyle = `rgba(20, 21, 25, ${(1 - age) * 0.52})`;
        ctx.lineWidth = Math.max(0.6, b.w * (1 - age * 0.55)) * dpr;
        ctx.beginPath();
        ctx.moveTo(a.x * dpr, a.y * dpr);
        ctx.lineTo(b.x * dpr, b.y * dpr);
        ctx.stroke();
      }
      if (points.length) raf = requestAnimationFrame(render);
      else live = false;
    };

    const onMove = (event: PointerEvent) => {
      const last = points[points.length - 1];
      const dist = last ? Math.hypot(event.clientX - last.x, event.clientY - last.y) : 12;
      if (dist < 3) return;
      // A slow hand presses hard; a fast hand leaves a thin tail.
      const w = Math.max(2.2, 13 - dist * 0.32) * (pressed ? 1.55 : 1);
      points.push({ x: event.clientX, y: event.clientY, t: performance.now(), w });
      if (points.length > 240) points.shift();
      if (!live) {
        live = true;
        raf = requestAnimationFrame(render);
      }
    };
    const onDown = () => { pressed = true; };
    const onUp = () => { pressed = false; };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return <canvas ref={ref} className="ink-brush" aria-hidden />;
}
