"use client";

import { useEffect, useState } from "react";

import type { ThemeMode } from "@/data/profile";

const STORAGE_KEY = "koriel-theme";

function resolveSystemTheme(): Exclude<ThemeMode, "system"> {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(mode: ThemeMode) {
  const resolved = mode === "system" ? resolveSystemTheme() : mode;
  document.documentElement.dataset.theme = resolved;
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    const storedMode = (window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? "system";
    setMode(storedMode);
    applyTheme(storedMode);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      if ((window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null) !== "dark" &&
          (window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null) !== "light") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const isDark = (mode === "system" ? resolveSystemTheme() : mode) === "dark";

  const toggleTheme = () => {
    const nextMode: ThemeMode = isDark ? "light" : "dark";
    setMode(nextMode);
    window.localStorage.setItem(STORAGE_KEY, nextMode);
    applyTheme(nextMode);
  };

  return (
    <button
      type="button"
      className="theme-btn"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? "light" : "dark"}
    </button>
  );
}
