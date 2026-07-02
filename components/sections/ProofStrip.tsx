"use client";

import { usePortfolioData } from "@/components/LocaleProvider";
import { MetricTicker } from "@/components/ui/MetricTicker";
import { Reveal } from "@/components/ui/Reveal";

export function ProofStrip() {
  const { proofMetrics, sections } = usePortfolioData();

  return (
    <section
      id="proof"
      className="deep-section relative border-b border-white/10 py-20 md:py-28"
      aria-labelledby="proof-title"
    >
      <div className="section-shell">
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-[0.82fr_1fr] lg:items-end">
            <div>
              <div className="eyebrow">{sections.proof.eyebrow}</div>
              <h2 id="proof-title" className="display-tight mt-4 max-w-5xl text-balance">
                {sections.proof.heading}
              </h2>
            </div>
            <p className="max-w-xl text-sm font-bold uppercase leading-7 tracking-[0.08em] text-[var(--acid)] lg:justify-self-end">
              {sections.proof.note}
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid border-l border-t border-white/12 sm:grid-cols-2 lg:grid-cols-4">
          {proofMetrics.map((metric) => (
            <Reveal key={metric.label}>
              <article className="proof-cell min-h-[230px] border-b border-r border-white/12 bg-white/[0.025] p-5 transition duration-300 hover:bg-white/[0.045]">
                <MetricTicker metric={metric} />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
