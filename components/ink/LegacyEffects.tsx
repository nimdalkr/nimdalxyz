"use client";

import { usePathname } from "next/navigation";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { InkBrush } from "./InkBrush";
import { InkReveals } from "./InkReveals";
import { InkTransition } from "./InkTransition";
import { PaperGrain } from "./PaperGrain";

export function LegacyEffects() {
  const pathname = usePathname();
  // The profile home has its own motion; retain ink only on the existing documents.
  if (/^\/(?:en|ko)\/?$/.test(pathname)) return null;
  return (
    <>
      <ScrollProgress />
      <PaperGrain />
      <InkBrush />
      <InkReveals />
      <InkTransition />
    </>
  );
}
