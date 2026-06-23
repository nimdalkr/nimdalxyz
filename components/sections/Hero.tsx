"use client";

import { Activity, ArrowDown, Radar, Sparkles } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { usePortfolioData } from "@/components/LocaleProvider";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { easing } from "@/lib/motion";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.24], [0, -86]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.22]);
  const { profile, nav, ui } = usePortfolioData();

  return (
    <section
      id="top"
      className="relative min-h-[92svh] overflow-hidden border-b border-white/10 pb-12 pt-4"
      aria-labelledby="hero-title"
    >
      <div className="signal-grid absolute inset-0 opacity-55" aria-hidden />

      <header className="section-shell relative z-10">
        <nav className="flex min-h-[var(--nav-height)] items-center justify-between border-b border-white/12 py-4">
          <a
            href="#top"
            className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.16em]"
            aria-label={`${profile.name} home`}
          >
            <span className="grid h-8 w-8 place-items-center border border-[var(--acid)] text-[var(--acid)]">
              <Radar className="h-4 w-4" />
            </span>
            {profile.name}
          </a>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-5 text-xs font-black uppercase tracking-[0.14em] text-white/52 md:flex">
              {nav.map((item) => (
                <a key={item.href} className="transition-colors hover:text-white" href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
            <LanguageSwitcher />
          </div>
        </nav>
      </header>

      <motion.div
        className="section-shell relative z-10 grid min-h-[calc(92svh-var(--nav-height)-16px)] content-end pt-16"
        style={shouldReduceMotion ? undefined : { y, opacity }}
      >
        <Reveal>
          <div className="eyebrow">
            <span>{profile.role}</span>
          </div>
        </Reveal>

        <motion.h1
          id="hero-title"
          aria-label={profile.headline}
          className="display mt-6 max-w-6xl text-balance"
          initial={shouldReduceMotion ? false : "hidden"}
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.055, delayChildren: 0.14 }
            }
          }}
        >
          {profile.headlineParts.map((part, index) => (
            <motion.span
              key={`${part}-${index}`}
              aria-hidden
              className={`inline-block pr-[0.16em] ${
                part.toLowerCase().includes("compounding") ? "text-[0.82em] sm:text-[1em]" : ""
              }`}
              variants={{
                hidden: { opacity: 0, y: 60 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.8, ease: easing }
                }
              }}
            >
              {part}{" "}
            </motion.span>
          ))}
        </motion.h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end">
          <Reveal delay={0.2}>
            <div>
              <p className="copy-xl text-balance">{profile.subheadline}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <MagneticButton href="#work">{profile.primaryCta}</MagneticButton>
                <MagneticButton href="#contact" variant="ghost">
                  {profile.secondaryCta}
                </MagneticButton>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.28}>
            <aside className="glass-panel p-5" aria-label={ui.availabilityLabel}>
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 h-5 w-5 shrink-0 text-[var(--acid)]" />
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-white">
                    {ui.availabilityLabel}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/58">{profile.availability}</p>
                </div>
              </div>
            </aside>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 border-t border-white/10 pt-5 md:grid-cols-[auto_1fr] md:items-center">
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.14em] text-white/44">
            <ArrowDown className="h-4 w-4 text-[var(--acid)]" aria-hidden />
            {ui.proofCue}
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {ui.signalWords.map((word) => (
              <span
                key={word}
                className="border border-white/12 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white/42"
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        <div className="motion-heavy absolute right-0 top-28 hidden w-[420px] border border-white/10 bg-black/25 p-4 text-white/45 lg:block">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--cyan)]">
            <Activity className="h-4 w-4" />
            {ui.signalScanLabel}
          </div>
          <div className="mt-4 grid grid-cols-12 gap-1" aria-hidden>
            {Array.from({ length: 72 }).map((_, index) => (
              <span
                key={index}
                className="h-2 border border-white/10"
                style={{
                  background:
                    index % 11 === 0 || index % 17 === 0
                      ? "var(--acid)"
                      : index % 7 === 0
                        ? "rgba(141, 248, 255, 0.5)"
                        : "rgba(255,255,255,0.05)"
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
