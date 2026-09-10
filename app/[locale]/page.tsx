import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";

import { ProfileHome } from "@/components/profile/ProfileHome";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  careerCases,
  careerChapters,
  featuredProject,
  isLocale,
  type Project,
  projects as projectRecords,
  siteContent
} from "@/lib/content";
import { absoluteCanonicalUrl, metadataAlternates, openGraphLocaleByLocale } from "@/lib/seo";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export const viewport: Viewport = {
  themeColor: "#fafbf9",
  colorScheme: "light"
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
      ? "창업가이자 빌더 Nimdal, 탁찬우. 2012년부터 이어 온 경력과 캠페인, 커뮤니티, 직접 만든 제품을 소개합니다."
      : "Nimdal / Tak Chanwoo. Founder, growth operator, and builder. Explore the projects, campaigns, and communities I've been building since 2012.",
    alternates: metadataAlternates(locale),
    openGraph: {
      title: content.seo.title,
      description: content.seo.description,
      url: canonical,
      locale: openGraphLocaleByLocale[locale],
      type: "website",
      images: [{
        url: "/media/identity-octopus.jpg",
        alt: korean ? "Nimdal의 픽셀 문어 프로필" : "Nimdal's pixel octopus identity"
      }]
    },
    twitter: {
      card: "summary",
      title: content.seo.title,
      description: content.seo.description,
      images: ["/media/identity-octopus.jpg"]
    }
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const locale = pageLocale((await params).locale);
  const korean = locale === "ko";
  const [featured, ...projects] = [featuredProject, ...projectRecords].map((projectRecord) => {
    const project: Project = projectRecord;
    const localized = project.copy[locale];
    const preview = project.media.find((media) => media.role === "proof") ?? project.media[0];

    return {
      slug: project.slug,
      title: localized.title,
      category: localized.category,
      summary: localized.summary,
      status: project.status,
      tags: [...localized.tags],
      detail: { ...localized.detail },
      image: preview.src,
      imageAlt: preview.alt[locale],
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
  const careerArc = careerChapters.map((chapter) => ({
    id: chapter.id,
    period: chapter.period,
    ...chapter.copy[locale]
  }));

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
      <StructuredData data={schema} />
      <ProfileHome
        locale={locale}
        featured={featured}
        projects={projects}
        career={career}
        careerArc={careerArc}
      />
    </>
  );
}
