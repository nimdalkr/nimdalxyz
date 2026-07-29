"use client";

import { MoonStars, Sun } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import type { Locale } from "@/lib/content";

type Stock = "paper" | "black";

const STORAGE_KEY = "nimdal-stock";

const copy = {
  ko: { paper: "검정 용지로 보기", black: "밝은 용지로 보기" },
  en: { paper: "Switch to black stock", black: "Switch to paper stock" }
} as const;

/**
 * The two inks stay the same; this switches the paper they are printed on.
 * The resolved value is written to the root element so CSS owns every token.
 */
export function StockToggle({ locale }: { locale: Locale }) {
  const [stock, setStock] = useState<Stock | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const stored = root.dataset.stock as Stock | undefined;
    setStock(
      stored ??
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "black" : "paper")
    );
  }, []);

  const toggle = () => {
    const next: Stock = stock === "black" ? "paper" : "black";
    document.documentElement.dataset.stock = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing can refuse storage; the switch still applies for this page.
    }
    setStock(next);
  };

  const label = stock ? copy[locale][stock] : copy[locale].paper;

  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-label={label} title={label}>
      {stock === "black" ? <Sun size={19} weight="bold" aria-hidden /> : <MoonStars size={19} weight="bold" aria-hidden />}
    </button>
  );
}
