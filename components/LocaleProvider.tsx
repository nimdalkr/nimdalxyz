"use client";

import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import {
  defaultLocale,
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

export function LocaleProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = "en";
    window.localStorage.setItem("nimdal-locale", defaultLocale);
  }, []);

  const setLocale = useCallback((_nextLocale: Locale) => {
    document.documentElement.lang = "en";
  }, []);

  const value = useMemo(
    () => ({
      data: portfolioDataByLocale[defaultLocale],
      locale: defaultLocale,
      setLocale
    }),
    [setLocale]
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
