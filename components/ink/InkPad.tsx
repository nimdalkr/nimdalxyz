"use client";

import { useEffect, useRef } from "react";

/**
 * The visitor's page of the guest book.
 *
 * A small sheet of paper in the signature band where anyone can pick up the
 * brush and draw. Strokes taper with speed like the site's brush cursor,
 * stay for the whole session, and survive resizes because points are stored
 * in paper-relative coordinates.
 */

type Pt = { x: number; y: number; w: number };

const STORE = "ink-guestpad";
const INK = "rgba(20, 21, 25, 0.92)";

export function InkPad({
  title,
  hint,
  clearLabel
}: {
  title: string;
  hint: string;
  clearLabel: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Pt[][]>([]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const redraw = () => {
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = INK;
      strokes.current.forEach((stroke) => {
        for (let i = 1; i < stroke.length; i++) {
          ctx.lineWidth = stroke[i].w;
          ctx.beginPath();
          ctx.moveTo(stroke[i - 1].x * w, stroke[i - 1].y * h);
          ctx.lineTo(stroke[i].x * w, stroke[i].y * h);
          ctx.stroke();
        }
      });
    };

    try {
      strokes.current = JSON.parse(window.sessionStorage.getItem(STORE) ?? "[]");
    } catch {
      strokes.current = [];
    }
    redraw();
    window.addEventListener("resize", redraw);

    let drawing = false;
    const pos = (event: PointerEvent) => {
      const rect = cv.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height
      };
    };
    const down = (event: PointerEvent) => {
      drawing = true;
      cv.setPointerCapture(event.pointerId);
      strokes.current.push([{ ...pos(event), w: 7 }]);
    };
    const move = (event: PointerEvent) => {
      if (!drawing) return;
      const stroke = strokes.current[strokes.current.length - 1];
      if (!stroke) return;
      const rect = cv.getBoundingClientRect();
      const p = pos(event);
      const last = stroke[stroke.length - 1];
      const dist = Math.hypot((p.x - last.x) * rect.width, (p.y - last.y) * rect.height);
      if (dist < 2) return;
      const w = Math.max(2, 11 - dist * 0.3);
      stroke.push({ ...p, w });
      ctx.strokeStyle = INK;
      ctx.lineCap = "round";
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(last.x * rect.width, last.y * rect.height);
      ctx.lineTo(p.x * rect.width, p.y * rect.height);
      ctx.stroke();
    };
    const up = () => {
      if (!drawing) return;
      drawing = false;
      const points = strokes.current.reduce((n, s) => n + s.length, 0);
      if (points > 6000) strokes.current.splice(0, strokes.current.length - 60);
      try {
        window.sessionStorage.setItem(STORE, JSON.stringify(strokes.current));
      } catch {}
    };
    cv.addEventListener("pointerdown", down);
    cv.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);

    return () => {
      window.removeEventListener("resize", redraw);
      cv.removeEventListener("pointerdown", down);
      cv.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  const clear = () => {
    strokes.current = [];
    try {
      window.sessionStorage.removeItem(STORE);
    } catch {}
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    if (cv && ctx) ctx.clearRect(0, 0, cv.width, cv.height);
  };

  return (
    <div className="ink-pad">
      <p className="ink-pad-title">{title}</p>
      <canvas ref={canvasRef} role="img" aria-label={title} />
      <div className="ink-pad-foot">
        <span>{hint}</span>
        <button type="button" onClick={clear}>{clearLabel}</button>
      </div>
    </div>
  );
}
