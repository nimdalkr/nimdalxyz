"use client";

import { LocaleProvider } from "@/components/LocaleProvider";
import { NimdalPortfolioExperience } from "@/components/NimdalPortfolioExperience";

export function PortfolioExperience() {
  return (
    <LocaleProvider>
      <div className="main-shell nimdal-main">
        <NimdalPortfolioExperience />
      </div>
    </LocaleProvider>
  );
}
