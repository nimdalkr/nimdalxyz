"use client";

import { useEffect, useRef } from "react";

/**
 * The sea lives inside the ink.
 *
 * A blot of ink blooms across the band as it scrolls into view, and inside the
 * black, fish swim as negative space: paper-coloured silhouettes cut out of
 * the ink. The blot's edge is noise-driven so it spreads like ink in water,
 * not like a scaling circle.
 *
 * The band answers the hand: fish flee the pointer, and moving across the ink
 * leaves paper-coloured ripples that widen and close again.
 *
 * Canvas 2D, running only while on screen. Reduced motion renders a finished
 * blot with the fish frozen mid-swim.
 */

function noiseRadius(seed: number, angle: number, t: number) {
  return (
    1 +
    0.16 * Math.sin(angle * 3 + seed) +
    0.1 * Math.sin(angle * 7 + seed * 2.7 + t * 0.4) +
    0.06 * Math.sin(angle * 13 - seed * 1.3 + t * 0.7)
  );
}

function drawFish(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, dir: number, flap: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * size, size);
  ctx.beginPath();
  // Teardrop body.
  ctx.moveTo(0.5, 0);
  ctx.quadraticCurveTo(0.1, -0.28, -0.25, 0);
  ctx.quadraticCurveTo(0.1, 0.28, 0.5, 0);
  // Tail, flapping.
  ctx.moveTo(-0.22, 0);
  ctx.lineTo(-0.52, -0.22 - flap * 0.1);
  ctx.lineTo(-0.52, 0.22 + flap * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

type Ripple = { x: number; y: number; t0: number };

export function InkBloom({ height = 240 }: { height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let raf = 0;
    let running = false;
    let progress = reduce ? 1 : 0;
    const seed = 7.31;
    // Lanes stay inside the thick of the ink so the fish read as cut paper.
    const fish = Array.from({ length: 7 }, (_, i) => ({
      lane: 0.32 + (i / 6) * 0.36,
      speed: 0.05 + (i % 3) * 0.025,
      size: 24 + (i % 4) * 11,
      dir: i % 2 === 0 ? 1 : -1,
      phase: i * 1.7,
      ox: 0,
      oy: 0
    }));

    const pointer = { x: -9999, y: -9999 };
    const ripples: Ripple[] = [];
    let lastRipple = 0;

    const resize = () => {
      width = canvas.clientWidth;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const render = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      if (progress < 1 && !reduce) progress = Math.min(1, progress + 0.016);

      // The blot: a chain of noisy blobs across the band.
      ctx.fillStyle = "#141519";
      const blobs = 6;
      for (let b = 0; b < blobs; b++) {
        const bx = ((b + 0.5) / blobs) * width;
        const by = height / 2 + Math.sin(b * 2.1 + seed) * height * 0.12;
        const base = Math.min(width / blobs * 0.85, height * 0.62) * progress;
        ctx.beginPath();
        const steps = 72;
        for (let i = 0; i <= steps; i++) {
          const a = (i / steps) * Math.PI * 2;
          const r = base * noiseRadius(seed + b * 3.3, a, t / 1000);
          const x = bx + Math.cos(a) * r * 1.35;
          const y = by + Math.sin(a) * r * 0.6;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }

      // Droplets thrown off the blot: deterministic, so every visit agrees.
      for (let d = 0; d < 18; d++) {
        const u = Math.sin(seed * 31.7 + d * 12.9) * 0.5 + 0.5;
        const v = Math.sin(seed * 17.3 + d * 7.1) * 0.5 + 0.5;
        const dx = u * width;
        const dy = height / 2 + (v - 0.5) * height * 0.86;
        const dr = (1.4 + (Math.sin(d * 3.7) * 0.5 + 0.5) * 3.2) * progress;
        ctx.beginPath();
        ctx.arc(dx, dy, dr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Paper cut out of the ink: the fish, and the hand's ripples.
      ctx.globalCompositeOperation = "destination-out";
      const time = reduce ? 0 : t / 1000;
      fish.forEach((f) => {
        const travel = ((time * f.speed * f.dir + f.phase) % 1.4 + 1.4) % 1.4 - 0.2;
        const x = travel * width;
        const y = f.lane * height + Math.sin(time * 1.3 + f.phase) * 8;
        // Flee the pointer, then drift back to the lane.
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const dist = Math.hypot(dx, dy);
        let tx = 0;
        let ty = 0;
        if (dist > 0.001 && dist < 130) {
          const push = (1 - dist / 130) * 54;
          tx = (dx / dist) * push;
          ty = (dy / dist) * push;
        }
        f.ox += (tx - f.ox) * 0.14;
        f.oy += (ty - f.oy) * 0.14;
        drawFish(ctx, x + f.ox, y + f.oy, f.size, f.dir, Math.sin(time * 6 + f.phase));
      });

      const now = performance.now();
      for (let i = ripples.length - 1; i >= 0; i--) {
        const age = (now - ripples[i].t0) / 900;
        if (age >= 1) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(0, 0, 0, ${(1 - age) * 0.9})`;
        ctx.lineWidth = 3.4 * (1 - age) + 0.6;
        ctx.beginPath();
        ctx.arc(ripples[i].x, ripples[i].y, 8 + age * 92, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";

      if (running && !reduce) raf = requestAnimationFrame(render);
    };

    const toLocal = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const onMove = (event: PointerEvent) => {
      const p = toLocal(event);
      pointer.x = p.x;
      pointer.y = p.y;
      const now = performance.now();
      if (now - lastRipple > 110) {
        lastRipple = now;
        ripples.push({ x: p.x, y: p.y, t0: now });
        if (ripples.length > 24) ripples.shift();
      }
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const onDown = (event: PointerEvent) => {
      const p = toLocal(event);
      const now = performance.now();
      for (let i = 0; i < 3; i++) ripples.push({ x: p.x, y: p.y, t0: now + i * 130 });
    };
    if (!reduce) {
      canvas.addEventListener("pointermove", onMove, { passive: true });
      canvas.addEventListener("pointerleave", onLeave);
      canvas.addEventListener("pointerdown", onDown, { passive: true });
    }

    // Only spend frames while the band is on screen.
    const io = new IntersectionObserver((entries) => {
      const visible = entries[0]?.isIntersecting ?? false;
      if (visible && !running) {
        running = true;
        if (!reduce) raf = requestAnimationFrame(render);
        else render(0);
      } else if (!visible && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    }, { threshold: 0.05 });
    io.observe(canvas);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
    };
  }, [height]);

  return <canvas ref={canvasRef} className="ink-bloom" style={{ height }} aria-hidden />;
}
