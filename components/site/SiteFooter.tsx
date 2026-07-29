import Link from "next/link";

import type { Locale } from "@/lib/content";

interface SiteFooterProps {
  locale: Locale;
  note: string;
}

export function SiteFooter({ locale, note }: SiteFooterProps) {
  return (
    <footer className="colophon">
      <Link href={`/${locale}`}>NIMDAL.XYZ</Link>
      <p>{note}</p>
      <span>{new Date().getFullYear()} Tak Chanwoo</span>
    </footer>
  );
}
