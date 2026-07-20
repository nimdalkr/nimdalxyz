import Link from "next/link";

import type { Locale } from "@/lib/content";

interface SiteFooterProps {
  locale: Locale;
  note: string;
}

export function SiteFooter({ locale, note }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <Link href={`/${locale}`} className="site-wordmark">NIMDAL</Link>
      <p>{note}</p>
      <span>© {new Date().getFullYear()} NIMDAL</span>
    </footer>
  );
}
