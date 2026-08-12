"use client";

import { useEffect, useRef } from "react";

import styles from "./NimdalDialogue.module.css";

type Particle = {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
  color: string;
};

export type VisualTheme = "chatgpt" | "claude";

const PALETTES: Record<VisualTheme, {
  background: string;
  trail: string;
  particles: readonly string[];
  signals: readonly string[];
}> = {
  chatgpt: {
    background: "#0d0d0d",
    trail: "rgba(13, 13, 13, 0.18)",
    particles: [
      "rgba(122, 235, 207, 0.54)",
      "rgba(160, 174, 192, 0.32)",
      "rgba(236, 238, 235, 0.2)"
    ],
    signals: [
      "rgba(122, 235, 207, 0.1)",
      "rgba(160, 174, 192, 0.07)",
      "rgba(236, 238, 235, 0.045)",
      "rgba(122, 235, 207, 0.04)"
    ]
  },
  claude: {
    background: "#f7f4ed",
    trail: "rgba(247, 244, 237, 0.2)",
    particles: [
      "rgba(197, 91, 63, 0.34)",
      "rgba(112, 94, 78, 0.2)",
      "rgba(206, 154, 105, 0.24)"
    ],
    signals: [
      "rgba(197, 91, 63, 0.075)",
      "rgba(112, 94, 78, 0.055)",
      "rgba(206, 154, 105, 0.065)",
      "rgba(53, 46, 40, 0.035)"
    ]
  }
};

function seeded(index: number, salt: number) {
  const value = Math.sin(index * 9283.13 + salt * 117.31) * 43758.5453;
  return value - Math.floor(value);
}

export function NimdalAtmosphere({ theme }: { theme: VisualTheme }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const palette = PALETTES[theme];
    const particles: Particle[] = Array.from({ length: 54 }, (_, index) => ({
      x: seeded(index, 1),
      y: seeded(index, 2),
      size: 1 + Math.floor(seeded(index, 3) * 3),
      speed: 0.000012 + seeded(index, 4) * 0.000025,
      phase: seeded(index, 5) * Math.PI * 2,
      color: palette.particles[index % palette.particles.length]
    }));

    let width = 0;
    let height = 0;
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.fillStyle = palette.background;
      context.fillRect(0, 0, width, height);
    };

    const onPointerMove = (event: PointerEvent) => {
      targetX = event.clientX / Math.max(width, 1) - 0.5;
      targetY = event.clientY / Math.max(height, 1) - 0.5;
    };

    const drawSignal = (time: number, row: number, color: string, amplitude: number) => {
      const baseY = height * (0.18 + row * 0.17) + pointerY * (8 + row * 2);
      context.beginPath();
      for (let x = -20; x <= width + 20; x += 18) {
        const y = baseY
          + Math.sin(x * 0.006 + time * 0.00015 + row * 1.7) * amplitude
          + Math.sin(x * 0.017 - time * 0.00009 + row) * (amplitude * 0.34);
        if (x === -20) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.strokeStyle = color;
      context.lineWidth = 1;
      context.stroke();
    };

    const draw = (time: number) => {
      pointerX += (targetX - pointerX) * 0.025;
      pointerY += (targetY - pointerY) * 0.025;

      context.fillStyle = reducedMotion ? palette.background : palette.trail;
      context.fillRect(0, 0, width, height);

      drawSignal(time, 0, palette.signals[0], 34);
      drawSignal(time, 1, palette.signals[1], 54);
      drawSignal(time, 2, palette.signals[2], 29);
      drawSignal(time, 3, palette.signals[3], 42);

      for (const particle of particles) {
        const progress = reducedMotion ? particle.x : (particle.x + time * particle.speed) % 1.08;
        const x = progress * width - width * 0.04 + pointerX * 16;
        const y = particle.y * height
          + Math.sin(time * 0.0003 + particle.phase + x * 0.008) * 13
          + pointerY * 10;
        context.fillStyle = particle.color;
        context.fillRect(Math.round(x), Math.round(y), particle.size, particle.size);
      }

      if (!reducedMotion) frame = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    draw(0);
    if (!reducedMotion) frame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className={styles.atmosphere} aria-hidden />;
}
