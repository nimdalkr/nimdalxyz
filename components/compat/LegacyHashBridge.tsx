"use client";

import { useEffect } from "react";

import type { Locale } from "@/lib/content";

const legacySlugMap: Record<string, string> = {
  "arcdu-nft": "alphaduo",
  arcdu: "alphaduo"
};

export function LegacyHashBridge({ locale }: { locale: Locale }) {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const roomMatch = hash.match(
      /^project-([a-z0-9-]+)-room-(signal|build|proof|next)$/
    );
    const projectMatch = hash.match(/^project-([a-z0-9-]+)$/);

    if (!roomMatch && (!projectMatch || hash.includes("-room-"))) return;

    const requestedSlug = roomMatch?.[1] ?? projectMatch?.[1];
    if (!requestedSlug) return;

    const slug = legacySlugMap[requestedSlug] ?? requestedSlug;
    const section = roomMatch?.[2] ?? "signal";
    window.location.replace(`/${locale}/projects/${slug}#${section}`);
  }, [locale]);

  return null;
}
