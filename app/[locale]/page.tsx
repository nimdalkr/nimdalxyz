import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { LegacyHashBridge } from "@/components/compat/LegacyHashBridge";
import { NimdalDialogue } from "@/components/conversation/NimdalDialogue";
import { StructuredData } from "@/components/seo/StructuredData";
import { careerCases, isLocale, type Project, projects as projectRecords, siteContent } from "@/lib/content";
import { absoluteCanonicalUrl, metadataAlternates, openGraphLocaleByLocale } from "@/lib/seo";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export const viewport: Viewport = {
  themeColor: "#090b0d",
  colorScheme: "dark"
};

function pageLocale(value: string) {
  if (!isLocale(value)) notFound();
  return value;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const locale = pageLocale((await params).locale);
  const content = siteContent[locale];
  const korean = locale === "ko";
  const canonical = absoluteCanonicalUrl(locale);

  return {
    title: content.seo.title,
    description: korean
      ? "Nimdal, 탁찬우의 경력과 프로젝트를 질문으로 탐색하는 대화형 포트폴리오입니다."
      : "A conversational portfolio for exploring Nimdal / Tak Chanwoo's career, projects, and operating philosophy.",
    alternates: metadataAlternates(locale),
    openGraph: {
      title: content.seo.title,
      description: content.seo.description,
      url: canonical,
      locale: openGraphLocaleByLocale[locale],
      type: "website",
      images: [{
        url: "/media/og-dive.png",
        width: 1200,
        height: 630,
        alt: korean ? "Nimdal 대화형 포트폴리오" : "Nimdal conversational portfolio"
      }]
    },
    twitter: {
      card: "summary_large_image",
      title: content.seo.title,
      description: content.seo.description,
      images: ["/media/og-dive.png"]
    }
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const locale = pageLocale((await params).locale);
  const korean = locale === "ko";
  const savedTheme = (await cookies()).get("nimdal-theme")?.value;
  const initialTheme = savedTheme === "claude" ? "claude" : "chatgpt";
  const projects = projectRecords.map((projectRecord) => {
    const project: Project = projectRecord;
    const localized = project.copy[locale];

    return {
      slug: project.slug,
      title: localized.title,
      category: localized.category,
      summary: localized.summary,
      status: project.status,
      tags: [...localized.tags],
      detail: { ...localized.detail },
      image: project.media[0].src,
      imageAlt: project.media[0].alt[locale],
      media: project.media.slice(0, 3).map((media) => ({
        src: media.src,
        alt: media.alt[locale],
        source: media.source[locale],
        claim: media.claim[locale],
        limitation: media.limitation[locale],
        capturedAt: media.capturedAt
      })),
      liveUrl: project.liveUrl,
      repositoryUrl: project.repositoryUrl,
      articleUrl: project.articleUrl,
      referenceUrl: project.referenceUrl
    };
  });
  const career = careerCases.map((careerCase) => {
    const localized = careerCase.copy[locale];

    return {
      id: careerCase.id,
      period: careerCase.period,
      title: localized.title,
      context: localized.context,
      channels: [...localized.channels],
      objective: localized.objective,
      role: localized.role,
      result: localized.result,
      constraint: localized.constraint,
      system: localized.system,
      proof: localized.proof,
      limitation: localized.limitation,
      image: careerCase.media.src,
      imageAlt: careerCase.media.alt[locale],
      metrics: careerCase.metrics.map((metric) => ({
        value: metric.value,
        ...metric.copy[locale]
      }))
    };
  });

  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: korean ? "탁찬우" : "Tak Chanwoo",
    alternateName: "Nimdal",
    url: absoluteCanonicalUrl(locale),
    image: "https://nimdal.xyz/media/operator-portrait.png",
    jobTitle: korean ? "창업가 · 그로스 오퍼레이터 · 프로덕트 빌더" : "Founder · Growth operator · Product builder",
    email: "mailto:admin@fiveovertwo.xyz",
    sameAs: [
      "https://x.com/0xnimdal",
      "https://t.me/nimdal",
      "https://linkedin.com/in/chanwoo-tak-132b281a4"
    ]
  };

  return (
    <>
      <LegacyHashBridge locale={locale} />
      <StructuredData data={schema} />
      <NimdalDialogue
        locale={locale}
        projects={projects}
        career={career}
        initialTheme={initialTheme}
        aiEnabled={Boolean(process.env.GEMINI_API_KEY)}
      />
    </>
  );
}
