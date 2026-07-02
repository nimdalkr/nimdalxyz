"use client";

import { CalendarDays, Mail, Quote } from "lucide-react";
import { usePortfolioData } from "@/components/LocaleProvider";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";

export function Contact() {
  const { contact, profile, sections, testimonials, ui } = usePortfolioData();

  return (
    <>
      <section className="deep-section relative border-b border-white/10 py-20 md:py-28" aria-labelledby="testimonials-title">
        <div className="section-shell">
          <Reveal>
            <div className="eyebrow">{sections.testimonials.eyebrow}</div>
            <h2 id="testimonials-title" className="display-tight mt-4 max-w-4xl text-balance">
              {sections.testimonials.heading}
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <Reveal key={testimonial.quote} delay={index * 0.08}>
                <figure className="glass-panel min-h-[270px] p-6 md:p-7">
                  <Quote className="h-7 w-7 text-[var(--acid)]" aria-hidden />
                  <blockquote className="mt-8 text-2xl font-black leading-tight text-white md:text-3xl">
                    {ui.quoteOpen}
                    {testimonial.quote}
                    {ui.quoteClose}
                  </blockquote>
                  <figcaption className="mt-8 border-t border-white/12 pt-5 text-sm leading-6 text-white/50">
                    <strong className="block text-white/76">{testimonial.name}</strong>
                    {testimonial.title}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="deep-section relative py-20 md:py-28" aria-labelledby="contact-title">
        <div className="section-shell">
          <Reveal>
            <div className="grid gap-10 border-y border-white/12 py-12 lg:grid-cols-[0.95fr_1fr] lg:items-end">
              <div>
                <div className="eyebrow">{sections.contact.eyebrow}</div>
                <h2 id="contact-title" className="display-tight mt-4 max-w-4xl text-balance">
                  {sections.contact.heading}
                </h2>
              </div>
              <div>
                <p className="copy-xl">{sections.contact.body}</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <MagneticButton href={`mailto:${contact.email}`} aria-label={ui.emailAria}>
                    <Mail className="h-4 w-4" aria-hidden />
                    {sections.contact.primaryCta}
                  </MagneticButton>
                  <MagneticButton
                    href={contact.scheduleUrl}
                    target="_blank"
                    rel="noreferrer"
                    variant="ghost"
                    aria-label={ui.scheduleAria}
                  >
                    <CalendarDays className="h-4 w-4" aria-hidden />
                    {sections.contact.secondaryCta}
                  </MagneticButton>
                </div>
              </div>
            </div>
          </Reveal>

          <footer className="flex flex-col gap-3 py-8 text-xs font-black uppercase tracking-[0.14em] text-white/36 sm:flex-row sm:items-center sm:justify-between">
            <span>{profile.name} / {ui.footerProduct}</span>
            <span>{profile.location}</span>
          </footer>
        </div>
      </section>
    </>
  );
}
