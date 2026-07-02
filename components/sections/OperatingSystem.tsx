"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { usePortfolioData } from "@/components/LocaleProvider";
import { Reveal } from "@/components/ui/Reveal";

export function OperatingSystem() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const marqueeX = useTransform(scrollYProgress, [0, 1], ["0%", "-24%"]);
  const { operatingSystem, sections } = usePortfolioData();

  return (
    <section
      id="system"
      ref={sectionRef}
      className="deep-section relative overflow-hidden border-b border-white/10 py-20 md:py-28"
      aria-labelledby="system-title"
    >
      <motion.div
        aria-hidden
        className="motion-heavy marquee-text absolute left-0 top-8 text-white/[0.035]"
        style={shouldReduceMotion ? undefined : { x: marqueeX }}
      >
        {sections.system.marquee}
      </motion.div>

      <div className="section-shell relative z-10">
        <Reveal>
          <div className="eyebrow">{sections.system.eyebrow}</div>
          <h2 id="system-title" className="display-tight mt-4 max-w-5xl text-balance">
            {sections.system.heading}
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {operatingSystem.map((step, index) => (
            <Reveal key={step.step} delay={index * 0.05}>
              <article className="system-node glass-panel min-h-[270px] p-6 md:p-7">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-[var(--font-mono)] text-sm font-black text-[var(--acid)]">
                    {step.step}
                  </span>
                  <span className="h-px flex-1 translate-y-3 bg-white/12" aria-hidden />
                </div>
                <h3 className="mt-9 font-[var(--font-display)] text-3xl font-black uppercase leading-none md:text-4xl">
                  {step.title}
                </h3>
                <p className="mt-5 text-base leading-7 text-white/58">{step.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
