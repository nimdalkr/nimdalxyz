"use client";

import { LocaleProvider } from "@/components/LocaleProvider";
import { NimdalPortfolioExperience } from "@/components/NimdalPortfolioExperience";

type Props = {
  initialProjectSlug?: string;
  initialRoomId?: string;
};

export function PortfolioExperience({ initialProjectSlug, initialRoomId }: Props = {}) {
  return (
    <LocaleProvider>
      <div className="main-shell nimdal-main">
        <NimdalPortfolioExperience
          initialProjectSlug={initialProjectSlug}
          initialRoomId={initialRoomId}
        />
      </div>
    </LocaleProvider>
  );
}
