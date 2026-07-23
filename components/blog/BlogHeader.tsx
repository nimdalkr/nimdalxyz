import type { Locale } from "@/lib/content";
import { SiteHeader } from "@/components/site/SiteHeader";

interface BlogHeaderProps {
  locale?: Locale;
  hubHref?: string;
  languagePath?: string;
  languageHref?: string;
}

/** The public blog intentionally shares the portfolio navigation and language switcher. */
export function BlogHeader({ locale = "en" }: BlogHeaderProps) {
  return <SiteHeader locale={locale} active="blog" blogSurface />;
}
