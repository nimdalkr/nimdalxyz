"use client";

import { languageOptions } from "@/lib/data";
import { cn } from "@/lib/cn";
import { useLocale, usePortfolioData } from "@/components/LocaleProvider";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const data = usePortfolioData();

  return (
    <div
      aria-label={data.ui.languageLabel}
      className="flex border border-white/12 bg-black/20 p-1"
      role="group"
    >
      {languageOptions.map((option) => {
        const isActive = option.locale === locale;

        return (
          <button
            key={option.locale}
            type="button"
            aria-pressed={isActive}
            className={cn(
              "min-h-8 px-2.5 text-[0.66rem] font-black uppercase tracking-[0.08em] transition-colors duration-200",
              isActive
                ? "bg-[var(--acid)] text-black"
                : "text-white/48 hover:bg-white/[0.08] hover:text-white"
            )}
            onClick={() => setLocale(option.locale)}
          >
            {option.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
