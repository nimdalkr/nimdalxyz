"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { InkSound } from "@/lib/ink/sound";

gsap.registerPlugin(ScrollTrigger);

/**
 * The author in the margin.
 *
 * The NFT octopus lives beside the scroll and travels down the margin as the
 * visitor unrolls it: always a little ahead, leaning with the scroll's
 * velocity. Press it and it startles, spraying ink that stains the paper for
 * the rest of the session.
 */

type Splat = { x: number; y: number; seed: number };

const STORE = "ink-splats";

function drawSplat(ctx: CanvasRenderingContext2D, splat: Splat, dpr: number) {
  const rand = (n: number) => {
    const v = Math.sin(splat.seed * 127.1 + n * 311.7) * 43758.5453;
    return v - Math.floor(v);
  };
  ctx.save();
  ctx.translate(splat.x * dpr, splat.y * dpr);
  ctx.fillStyle = "rgba(20, 21, 25, 0.88)";
  // A ragged core plus satellite droplets.
  ctx.beginPath();
  const points = 14;
  for (let i = 0; i <= points; i++) {
    const a = (i / points) * Math.PI * 2;
    const r = (8 + rand(i) * 14) * dpr;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r * (0.75 + rand(i + 40) * 0.5);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  for (let i = 0; i < 7; i++) {
    const a = rand(i + 80) * Math.PI * 2;
    const d = (22 + rand(i + 90) * 46) * dpr;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * d, Math.sin(a) * d, (1.2 + rand(i + 99) * 3.4) * dpr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function InkAuthor({
  label,
  soundOnLabel,
  soundOffLabel
}: {
  label: string;
  soundOnLabel: string;
  soundOffLabel: string;
}) {
  const wrap = useRef<HTMLButtonElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const splats = useRef<Splat[]>([]);
  const sound = useRef<InkSound | null>(null);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Restore this session's stains.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      cv.width = window.innerWidth * dpr;
      cv.height = window.innerHeight * dpr;
      const ctx = cv.getContext("2d");
      if (ctx) splats.current.forEach((s) => drawSplat(ctx, s, dpr));
    };
    try {
      splats.current = JSON.parse(window.sessionStorage.getItem(STORE) ?? "[]");
    } catch { splats.current = []; }
    resize();
    window.addEventListener("resize", resize);

    let trigger: ScrollTrigger | undefined;
    if (!reduce) {
      trigger = ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.8,
        onUpdate: (self) => {
          const top = 11 + self.progress * 72;
          el.style.top = `${top}vh`;
          // The author draws the margin line on the way down.
          if (line.current) line.current.style.height = `calc(${top}vh + 38px)`;
          const velocity = self.getVelocity();
          const lean = Math.max(-14, Math.min(14, velocity / 260));
          el.style.transform = `rotate(${lean}deg)`;
          // The paper whispers only while the pen moves.
          sound.current?.brush(velocity);
        }
      });
    } else {
      el.style.top = "14vh";
      if (line.current) line.current.style.height = "calc(14vh + 38px)";
    }

    // Wet ink: dragging the pointer across a freshly drawn stroke smudges it.
    const onMove = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest?.("svg.is-wet")) return;
      const ctx2 = cv.getContext("2d");
      if (!ctx2) return;
      ctx2.fillStyle = "rgba(20, 21, 25, 0.12)";
      ctx2.beginPath();
      ctx2.ellipse(
        event.clientX * dpr,
        event.clientY * dpr,
        (5 + Math.random() * 8) * dpr,
        (2 + Math.random() * 3) * dpr,
        Math.random() * Math.PI,
        0, Math.PI * 2
      );
      ctx2.fill();
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // Seals report their landings for the thump.
    const onStamp = () => sound.current?.thump();
    window.addEventListener("ink-stamp", onStamp);

    return () => {
      trigger?.kill();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("ink-stamp", onStamp);
      sound.current?.dispose();
    };
  }, []);

  const toggleSound = async () => {
    if (!sound.current) sound.current = new InkSound();
    if (soundOn) {
      sound.current.stop();
      setSoundOn(false);
    } else {
      await sound.current.start();
      setSoundOn(true);
    }
  };

  const spray = () => {
    const el = wrap.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx) return;
    const rect = el.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const splat: Splat = {
      x: rect.left + rect.width * (0.9 + Math.random() * 0.6),
      y: rect.top + rect.height * (0.4 + Math.random() * 0.5),
      seed: Math.random() * 1000
    };
    splats.current.push(splat);
    try { window.sessionStorage.setItem(STORE, JSON.stringify(splats.current.slice(-40))); } catch {}
    drawSplat(ctx, splat, dpr);
    sound.current?.splat();
    // Startle squish.
    gsap.fromTo(el, { scale: 0.82 }, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.45)" });
  };

  return (
    <>
      <span ref={line} className="ink-margin-line" aria-hidden />
      <canvas ref={canvas} className="ink-stains" aria-hidden />
      <button ref={wrap} type="button" className="ink-author" onClick={spray} aria-label={label}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/identity-octopus.jpg" alt="" width={72} height={72} />
      </button>
      <button
        type="button"
        className="ink-sound"
        onClick={toggleSound}
        aria-pressed={soundOn}
      >
        {soundOn ? soundOnLabel : soundOffLabel}
      </button>
    </>
  );
}
