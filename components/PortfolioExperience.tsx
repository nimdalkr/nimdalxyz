"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import { CaseStudies } from "@/components/sections/CaseStudies";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Offer } from "@/components/sections/Offer";
import { OperatingSystem } from "@/components/sections/OperatingSystem";
import { ProofStrip } from "@/components/sections/ProofStrip";
import { LocaleProvider } from "@/components/LocaleProvider";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

const SignalField = dynamic(() => import("@/components/canvas/SignalField"), {
  ssr: false
});

export function PortfolioExperience() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <LocaleProvider>
      <main className="main-shell">
        <ScrollProgress />
        {shouldReduceMotion ? null : <SignalField />}
        <Hero />
        <ProofStrip />
        <CaseStudies />
        <OperatingSystem />
        <Offer />
        <Contact />
      </main>
    </LocaleProvider>
  );
}
