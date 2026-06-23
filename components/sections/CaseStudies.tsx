"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import { usePortfolioData } from "@/components/LocaleProvider";
import { MetricTicker } from "@/components/ui/MetricTicker";
import { Reveal } from "@/components/ui/Reveal";
import type { CaseStudy } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

export function CaseStudies() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const { caseStudies, sections, ui } = usePortfolioData();

  useEffect(() => {
    if (shouldReduceMotion || !sectionRef.current || !trackRef.current) return;

    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    if (!desktopQuery.matches) return;

    const section = sectionRef.current;
    const track = trackRef.current;

    const context = gsap.context(() => {
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 48);

      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          anticipatePin: 1,
          end: () => `+=${distance()}`,
          invalidateOnRefresh: true,
          pin: true,
          scrub: 0.85,
          start: "top top",
          trigger: section
        }
      });
    }, section);

    return () => context.revert();
  }, [caseStudies, shouldReduceMotion]);

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative overflow-hidden border-b border-white/10 py-20 md:py-28"
      aria-labelledby="work-title"
    >
      <div className="section-shell">
        <Reveal>
          <div className="eyebrow">{sections.work.eyebrow}</div>
          <h2 id="work-title" className="display-tight mt-4 max-w-5xl text-balance">
            {sections.work.heading}
          </h2>
        </Reveal>
      </div>

      <div className="mt-12 overflow-hidden lg:mt-16">
        <div
          ref={trackRef}
          className="section-shell flex flex-col gap-4 will-change-transform lg:w-max lg:flex-row lg:gap-5"
        >
          {caseStudies.map((item, index) => (
            <CaseStudyCard key={item.slug} ctaLabel={ui.caseStudyCta} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseStudyCard({
  ctaLabel,
  item,
  index
}: {
  ctaLabel: string;
  item: CaseStudy;
  index: number;
}) {
  return (
    <article
      id={item.slug}
      className="case-card glass-panel group overflow-hidden p-5 transition duration-300 hover:border-[var(--acid)]/50 hover:shadow-[0_0_46px_rgba(223,255,79,0.09)] md:p-7"
    >
      <div className="flex h-full min-h-[620px] flex-col justify-between gap-10">
        <div>
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--acid)]">
                {item.category}
              </p>
              <p className="mt-2 text-sm text-white/45">
                {String(index + 1).padStart(2, "0")} / {item.client}
              </p>
            </div>
            <a
              href={item.href ?? "#contact"}
              aria-label={`${item.href ? "Open" : ctaLabel}: ${item.client}`}
              target={item.href ? "_blank" : undefined}
              rel={item.href ? "noreferrer" : undefined}
              className="grid h-11 w-11 place-items-center rounded-md border border-white/12 text-white/68 transition hover:border-white/45 hover:text-white"
            >
              <ArrowUpRight className="h-5 w-5" />
            </a>
          </div>

          <h3 className="mt-9 max-w-xl font-[var(--font-display)] text-4xl font-black uppercase leading-none md:text-5xl">
            {item.title}
          </h3>
          <p className="mt-5 text-lg leading-8 text-white/66">{item.oneLiner}</p>
          <p className="mt-7 border-l border-[var(--acid)]/50 pl-5 text-sm leading-7 text-white/48">
            {item.context}
          </p>

          <ul className="mt-7 grid gap-3">
            {item.strategy.map((point) => (
              <li key={point} className="flex gap-3 text-sm leading-6 text-white/66">
                <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--acid)]" aria-hidden />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          {item.metrics?.length ? (
            <div className="grid border-l border-t border-white/12 md:grid-cols-3">
              {item.metrics.map((metric) => (
                <div key={metric.label} className="border-b border-r border-white/12 p-4">
                  <MetricTicker metric={metric} compact />
                </div>
              ))}
            </div>
          ) : null}

          <ul className="mt-6 flex flex-wrap gap-2">
            {item.stack.map((tag) => (
              <li
                key={tag}
                className="border border-white/12 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white/48"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
