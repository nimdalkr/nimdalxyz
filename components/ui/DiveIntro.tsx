"use client";

import Image from "next/image";

export function DiveIntro() {
  return (
    <div
      className="dive-intro motion-heavy pointer-events-none fixed inset-0 z-50 grid place-items-center overflow-hidden bg-[#020706]"
      aria-hidden
    >
      <div className="deep-current-layer absolute inset-0" />
      <div className="pixel-caustics absolute inset-0 opacity-70" />
      <div className="dive-intro-card relative grid w-[min(520px,calc(100vw-40px))] justify-items-center gap-6 text-center">
        <div className="relative h-24 w-24 overflow-hidden border border-[var(--cyan)] bg-cyan-300/10 shadow-[0_0_64px_rgba(85,214,194,0.22)]">
          <Image
            src="/media/identity-octopus.jpg"
            alt=""
            fill
            sizes="96px"
            className="object-cover pixelated"
          />
        </div>
        <div>
          <p className="font-[var(--font-mono)] text-xs font-black uppercase tracking-[0.22em] text-[var(--acid)]">
            Portfolio loading
          </p>
          <p className="mt-3 font-[var(--font-display)] text-4xl font-black uppercase leading-none text-white sm:text-6xl">
            Nimdal Portfolio
          </p>
        </div>
        <div className="grid w-full grid-cols-12 gap-1" aria-hidden>
          {Array.from({ length: 48 }).map((_, index) => (
            <span
              key={index}
              className="dive-intro-bit h-2 border border-white/10 bg-white/[0.035]"
              style={{ animationDelay: `${index * 12}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
