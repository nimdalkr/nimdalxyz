"use client";

import { Check, Target } from "lucide-react";
import { usePortfolioData } from "@/components/LocaleProvider";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";

export function Offer() {
  const { offers, sections, ui } = usePortfolioData();

  return (
    <section className="deep-section relative border-b border-white/10 py-20 md:py-28" aria-labelledby="offer-title">
      <div className="section-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <Reveal>
          <div className="eyebrow">{sections.offer.eyebrow}</div>
          <h2 id="offer-title" className="display-tight mt-4 max-w-4xl text-balance">
            {sections.offer.heading}
          </h2>
          <p className="copy-xl mt-6">{sections.offer.body}</p>
          <div className="mt-8">
            <MagneticButton href="#contact">{sections.offer.cta}</MagneticButton>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="glass-panel overflow-hidden">
            <div className="flex items-center gap-3 border-b border-white/12 p-5 text-sm font-black uppercase tracking-[0.14em] text-[var(--acid)]">
              <Target className="h-5 w-5" aria-hidden />
              {ui.offerScopeLabel}
            </div>
            <ul className="grid">
              {offers.map((offer) => (
                <li
                  key={offer}
                  className="flex gap-4 border-b border-white/10 p-5 text-base font-bold text-white/78 last:border-b-0"
                >
                  <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--acid)]" aria-hidden />
                  <span>{offer}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
