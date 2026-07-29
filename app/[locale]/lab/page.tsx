import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LabFilter } from "@/components/home/LabFilter";
import { StructuredData } from "@/components/seo/StructuredData";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { isLocale, projects, siteContent } from "@/lib/content";
import { absoluteCanonicalUrl, metadataAlternates, openGraphLocaleByLocale } from "@/lib/seo";
import { getMediaDimensions } from "@/lib/media";
import { uiCopy } from "@/lib/ui";

interface LabPageProps { params: Promise<{ locale: string }> }

function localeOrNotFound(value: string) {
  if (!isLocale(value)) notFound();
  return value;
}

export async function generateMetadata({ params }: LabPageProps): Promise<Metadata> {
  const locale = localeOrNotFound((await params).locale);
  const copy = siteContent[locale].lab;
  const title = locale === "ko" ? "Nimdal Lab / 9개 프로젝트" : "Nimdal Lab / 9 projects";
  return {
    title,
    description: copy.description,
    alternates: metadataAlternates(locale, "/lab"),
    openGraph: {
      title,
      description: copy.description,
      url: absoluteCanonicalUrl(locale, "/lab"),
      locale: openGraphLocaleByLocale[locale],
      type: "website",
      images: [{
        url: "/media/projects/alphaduo-proof.png",
        ...getMediaDimensions("/media/projects/alphaduo-proof.png"),
        alt: locale === "ko" ? "AlphaDuo 실제 서비스 화면" : "AlphaDuo live product"
      }]
    }
  };
}

export default async function LabPage({ params }: LabPageProps) {
  const locale = localeOrNotFound((await params).locale);
  const korean = locale === "ko";
  const content = siteContent[locale];
  const ui = uiCopy[locale];
  const items = projects.map((project) => {
    const copy = project.copy[locale];
    const media = project.media.find((item) => item.role === "proof") ?? project.media[0];
    const statusKey = project.slug === "ethosalpha" ? "repository" : project.status === "live" ? "live" : project.status;
    return {
      slug: project.slug,
      title: copy.title,
      summary: copy.summary,
      status: content.lab.status[project.status],
      statusKey,
      media: media.src,
      mediaAlt: media.alt[locale],
      href: `/${locale}/projects/${project.slug}`,
      label: content.lab.openProject
    } as const;
  });

  return (
    <div className="page">
      <StructuredData data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: content.lab.title,
        description: content.lab.description,
        url: absoluteCanonicalUrl(locale, "/lab"),
        inLanguage: locale,
        hasPart: projects.map((project) => ({
          "@type": "CreativeWork",
          name: project.copy[locale].title,
          url: absoluteCanonicalUrl(locale, `/projects/${project.slug}`)
        }))
      }} />
      <SiteHeader locale={locale} />
      <main id="main-content">
        <section className="page-head" aria-labelledby="lab-title">
          <div className="wrap">
            <p className="press-mark">{content.lab.eyebrow}</p>
            <h1 id="lab-title">{content.lab.title}</h1>
            <p className="lede">{content.lab.description}</p>
          </div>
        </section>
        <section className="band band-tight">
          <div className="wrap">
            <LabFilter
              items={items}
              labels={ui.lab}
              empty={{
                title: korean ? "이 분류에는 프로젝트가 없습니다" : "Nothing in this category yet",
                body: korean
                  ? "다른 상태를 선택하면 나머지 프로젝트를 볼 수 있습니다."
                  : "Pick another status to see the rest of the projects."
              }}
            />
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} note={content.footer.tagline} />
    </div>
  );
}
