"use client";

import Image from "next/image";
import { Activity, ArrowDown, BadgeCheck, Sparkles, Waves } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { usePortfolioData } from "@/components/LocaleProvider";
import { MagneticButton } from "@/components/ui/MagneticButton";
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
      className="relative isolate min-h-[96svh] overflow-hidden border-b border-white/10 pb-12 pt-4"
      aria-labelledby="hero-title"
    >
      <div className="deep-current-layer absolute inset-0" aria-hidden />
      <div className="signal-grid absolute inset-0 opacity-45" aria-hidden />
      <div className="pixel-caustics absolute inset-0" aria-hidden />

      <header className="section-shell relative z-10">
        <nav className="flex min-h-[var(--nav-height)] items-center justify-between border-b border-white/12 py-4 backdrop-blur-sm">
          <a
            href="#top"
            className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.16em]"
            aria-label={`${profile.name} home`}
          >
            <span className="relative grid h-9 w-9 place-items-center overflow-hidden border border-[var(--cyan)] bg-cyan-300/10">
              <Image
                src="/media/identity-octopus.jpg"
                alt=""
                width={36}
                height={36}
                className="h-full w-full object-cover pixelated"
                aria-hidden
              />
            </span>
            {profile.name}
          </a>
          <div className="hidden items-center gap-5 text-xs font-black uppercase tracking-[0.14em] text-white/52 md:flex">
            {nav.map((item) => (
              <a key={item.href} className="transition-colors hover:text-white" href={item.href}>
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <motion.div
        className="section-shell relative z-10 grid min-h-[calc(96svh-var(--nav-height)-16px)] gap-10 pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,430px)] lg:content-center lg:items-end lg:pt-16"
        style={shouldReduceMotion ? undefined : { y, opacity }}
      >
        <div className="content-end lg:pb-4">
          <motion.div
            initial={shouldReduceMotion === true ? false : { opacity: 0, y: 18 }}
            animate={shouldReduceMotion === true ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.68, delay: 0.08, ease: easing }}
          >
            <div className="eyebrow">
              <span>{profile.role}</span>
            </div>
          </motion.div>

          <motion.h1
            id="hero-title"
            aria-label={profile.headline}
            className="hero-display mt-6 max-w-5xl text-balance"
          >
            {profile.headlineParts.map((part, index) => (
              <motion.span
                key={`${part}-${index}`}
                aria-hidden
                className="block pr-[0.16em]"
                initial={shouldReduceMotion === true ? false : { opacity: 0, y: 60 }}
                animate={shouldReduceMotion === true ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.16 + index * 0.055, ease: easing }}
              >
                {part}{" "}
              </motion.span>
            ))}
          </motion.h1>

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-end">
            <motion.div
              initial={shouldReduceMotion === true ? false : { opacity: 0, y: 24 }}
              animate={shouldReduceMotion === true ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.72, delay: 0.32, ease: easing }}
            >
              <div>
                <p className="copy-xl text-balance">{profile.subheadline}</p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <MagneticButton href="#work">{profile.primaryCta}</MagneticButton>
                  <MagneticButton href="#contact" variant="ghost">
                    {profile.secondaryCta}
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={shouldReduceMotion === true ? false : { opacity: 0, y: 24 }}
              animate={shouldReduceMotion === true ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.72, delay: 0.42, ease: easing }}
            >
              <aside className="glass-panel depth-panel p-5" aria-label={ui.availabilityLabel}>
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-1 h-5 w-5 shrink-0 text-[var(--acid)]" />
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.14em] text-white">
                      {ui.availabilityLabel}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/60">{profile.availability}</p>
                  </div>
                </div>
              </aside>
            </motion.div>
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
                  className="border border-white/12 bg-white/[0.025] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white/48"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div className="motion-heavy absolute right-[460px] top-32 hidden w-[360px] border border-white/10 bg-black/25 p-4 text-white/45 2xl:block">
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
                        : index % 13 === 0
                          ? "var(--coral)"
                          : index % 7 === 0
                            ? "rgba(85, 214, 194, 0.55)"
                            : "rgba(255,255,255,0.05)"
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <OperatorFrame />
      </motion.div>
    </section>
  );
}

function OperatorFrame() {
  return (
    <motion.aside
      className="operator-stage relative mx-auto w-full max-w-[430px] lg:mx-0 lg:self-center lg:justify-self-end"
      initial={{ opacity: 0, y: 44, rotate: -1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 1, delay: 0.22, ease: easing }}
      aria-label="Nimdal operator portrait and pixel octopus identity"
    >
      <div className="operator-shell glass-panel relative overflow-hidden p-3">
        <div className="relative aspect-[4/5] overflow-hidden border border-white/12 bg-[#071412]">
          <Image
            src="/media/operator-portrait.png"
            alt="Nimdal portrait in a navy suit."
            fill
            priority
            sizes="(min-width: 1024px) 430px, 92vw"
            className="operator-image object-cover object-[50%_26%]"
          />
          <div className="operator-glass absolute inset-0" aria-hidden />
          <div className="scanline absolute inset-0" aria-hidden />

          <div className="absolute left-4 top-4 flex items-center gap-2 border border-white/14 bg-black/42 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-white/72 backdrop-blur-md">
            <Waves className="h-4 w-4 text-[var(--cyan)]" aria-hidden />
            Operator layer
          </div>

          <div className="absolute bottom-4 left-4 right-4 grid gap-2">
            <div className="flex items-center justify-between border border-white/12 bg-black/52 px-3 py-3 backdrop-blur-md">
              <span className="font-[var(--font-mono)] text-xs font-black uppercase tracking-[0.14em] text-white/58">
                Depth
              </span>
              <span className="font-[var(--font-mono)] text-xs font-black text-[var(--acid)]">
                04 / artifact zone
              </span>
            </div>
            <div className="flex items-center justify-between border border-white/12 bg-black/52 px-3 py-3 backdrop-blur-md">
              <span className="font-[var(--font-mono)] text-xs font-black uppercase tracking-[0.14em] text-white/58">
                Signal
              </span>
              <span className="font-[var(--font-mono)] text-xs font-black text-[var(--cyan)]">
                clean / live
              </span>
            </div>
          </div>

          <div className="avatar-badge absolute -right-3 top-[30%] w-28 border border-[var(--cyan)]/50 bg-[#061817]/92 p-2 shadow-[0_0_44px_rgba(85,214,194,0.22)] backdrop-blur-md sm:w-32">
            <div className="relative aspect-square overflow-hidden border border-white/12">
              <Image
                src="/media/identity-octopus.jpg"
                alt="Pixel octopus NFT identity."
                fill
                sizes="128px"
                className="object-cover pixelated"
              />
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[0.62rem] font-black uppercase tracking-[0.12em] text-[var(--acid)]">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
              Avatar link
            </div>
          </div>
        </div>

        <div className="sonar-ring absolute -left-8 top-12 h-32 w-32" aria-hidden />
        <div className="sonar-ring sonar-ring-delayed absolute -bottom-6 right-10 h-40 w-40" aria-hidden />
      </div>
    </motion.aside>
  );
}
