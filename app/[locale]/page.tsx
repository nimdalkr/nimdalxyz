import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AtlasGate } from "@/components/atlas/AtlasGate";
import { LegacyHashBridge } from "@/components/compat/LegacyHashBridge";
import { ReadableHome } from "@/components/home/ReadableHome";
import { StructuredData } from "@/components/seo/StructuredData";
import { buildAtlas } from "@/lib/atlas/world";
import { isLocale, siteContent } from "@/lib/content";
import { absoluteCanonicalUrl, metadataAlternates, openGraphLocaleByLocale } from "@/lib/seo";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

function pageLocale(value: string) {
  if (!isLocale(value)) notFound();
  return value;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const locale = pageLocale((await params).locale);
  const content = siteContent[locale];
  const canonical = absoluteCanonicalUrl(locale);
  return {
    title: content.seo.title,
    description: content.seo.description,
    alternates: metadataAlternates(locale),
    openGraph: {
      title: content.seo.title,
      description: content.seo.description,
      url: canonical,
      locale: openGraphLocaleByLocale[locale],
      type: "website",
      images: [{
        url: "/media/operator-portrait.png",
        width: 640,
        height: 853,
        alt: content.home.identity.portraitAlt
      }]
    },
    twitter: {
      card: "summary",
      title: content.seo.title,
      description: content.seo.description,
      images: ["/media/operator-portrait.png"]
    }
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const locale = pageLocale((await params).locale);
  const korean = locale === "ko";
  const landmarks = buildAtlas(locale);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: korean ? "탁찬우" : "Tak Chanwoo",
    alternateName: "Nimdal",
    url: absoluteCanonicalUrl(locale),
    image: "https://nimdal.xyz/media/operator-portrait.png",
    email: "mailto:0xnimdal@gmail.com",
    sameAs: ["https://x.com/0xnimdal", "https://t.me/nimdal", "https://linkedin.com/in/chanwoo-tak-132b281a4"]
  };

  return (
    <>
      <LegacyHashBridge locale={locale} />
      <StructuredData data={schema} />
      {/* The readable portfolio is the server-rendered payload. The atlas is an
          upgrade the client applies only when the device can carry it. */}
      <AtlasGate locale={locale} landmarks={landmarks}>
        <ReadableHome locale={locale} />
      </AtlasGate>
    </>
  );
}
