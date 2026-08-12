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
    background: "#ffffff",
    trail: "#ffffff",
    particles: ["transparent"],
    signals: ["transparent", "transparent", "transparent", "transparent"]
  },
  claude: {
    background: "#f7f5ef",
    trail: "rgba(247, 245, 239, 0.34)",
    particles: [
      "rgba(79, 70, 61, 0.055)",
      "rgba(151, 87, 63, 0.05)",
      "rgba(109, 94, 80, 0.04)"
    ],
    signals: [
      "rgba(79, 70, 61, 0.028)",
      "rgba(151, 87, 63, 0.025)",
      "rgba(109, 94, 80, 0.022)",
      "rgba(53, 46, 40, 0.018)"
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
    const particles: Particle[] = Array.from({ length: theme === "claude" ? 28 : 0 }, (_, index) => ({
      x: seeded(index, 1),
      y: seeded(index, 2),
      size: 1 + Math.floor(seeded(index, 3) * 3),
      speed: 0.000004 + seeded(index, 4) * 0.000009,
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

      if (theme === "claude") {
        drawSignal(time, 0, palette.signals[0], 24);
        drawSignal(time, 1, palette.signals[1], 38);
        drawSignal(time, 2, palette.signals[2], 21);
        drawSignal(time, 3, palette.signals[3], 31);
      }

      for (const particle of particles) {
        const progress = reducedMotion ? particle.x : (particle.x + time * particle.speed) % 1.08;
        const x = progress * width - width * 0.04 + pointerX * 16;
        const y = particle.y * height
          + Math.sin(time * 0.0003 + particle.phase + x * 0.008) * 13
          + pointerY * 10;
        context.fillStyle = particle.color;
        context.fillRect(Math.round(x), Math.round(y), particle.size, particle.size);
      }

      if (!reducedMotion && theme === "claude") frame = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    if (theme === "claude") window.addEventListener("pointermove", onPointerMove, { passive: true });
    draw(0);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      if (theme === "claude") window.removeEventListener("pointermove", onPointerMove);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className={styles.atmosphere} aria-hidden />;
}
