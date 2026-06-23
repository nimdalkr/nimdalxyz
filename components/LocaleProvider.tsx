"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  defaultLocale,
  languageOptions,
  portfolioDataByLocale,
  type Locale,
  type PortfolioContent
} from "@/lib/data";

type LocaleContextValue = {
  data: PortfolioContent;
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && value in portfolioDataByLocale);
}

function localeFromNavigator() {
  if (typeof navigator === "undefined") return defaultLocale;

  const language = navigator.language.toLowerCase();
  if (language.startsWith("ko")) return "ko";
  if (language.startsWith("zh")) return "zh";
  if (language.startsWith("ja")) return "ja";

  return defaultLocale;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedLocale = params.get("lang");
    const storedLocale = window.localStorage.getItem("nimdal-locale");
    const nextLocale = isLocale(requestedLocale)
      ? requestedLocale
      : isLocale(storedLocale)
        ? storedLocale
        : localeFromNavigator();

    setLocaleState(nextLocale);
  }, []);

  useEffect(() => {
    const option = languageOptions.find((item) => item.locale === locale);
    document.documentElement.lang = option?.htmlLang ?? "en";
    window.localStorage.setItem("nimdal-locale", locale);
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);

    const url = new URL(window.location.href);
    url.searchParams.set("lang", nextLocale);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  const value = useMemo(
    () => ({
      data: portfolioDataByLocale[locale],
      locale,
      setLocale
    }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function usePortfolioData() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("usePortfolioData must be used inside LocaleProvider.");
  }

  return context.data;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used inside LocaleProvider.");
  }

  return {
    locale: context.locale,
    setLocale: context.setLocale
  };
}
