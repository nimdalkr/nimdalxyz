import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/motion/Reveal";
import { ProofSwitcher } from "@/components/project/ProofSwitcher";
import { StructuredData } from "@/components/seo/StructuredData";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import {
  getProject,
  isLocale,
  locales,
  projects,
  projectSlugs,
  siteContent
} from "@/lib/content";
import {
  metadataAlternates,
  openGraphLocaleByLocale,
  projectCanonicalUrl
} from "@/lib/seo";
import { getMediaDimensions } from "@/lib/media";
import { siteConfig } from "@/lib/site";
import { mediaRoleLabel, uiCopy } from "@/lib/ui";

interface ProjectPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

const projectLabels = {
  ko: {
    caseStudy: "Case study",
    live: "실서비스",
    repository: "공개 저장소",
    article: "빌드 로그",
    reference: "참고 자료",
    media: "프로젝트 증빙",
    evidenceLedger: "증빙 기록",
    previous: "이전 프로젝트",
    next: "다음 프로젝트",
    undated: "날짜 미상",
    sections: "케이스 스터디 구성"
  },
  en: {
    caseStudy: "Case study",
    live: "Live product",
    repository: "Public repository",
    article: "Build log",
    reference: "Reference",
    media: "Project evidence",
    evidenceLedger: "Evidence ledger",
    previous: "Previous project",
    next: "Next project",
    undated: "Undated",
    sections: "Case study sections"
  }
} as const;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    projectSlugs.map((slug) => ({
      locale,
      slug
    }))
  );
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;

  if (!isLocale(localeParam)) {
    return { title: "Project not found" };
  }

  const locale = localeParam;
  const project = getProject(slug);

  if (!project) {
    return { title: "Project not found" };
  }

  const copy = project.copy[locale];
  const image = project.media.find((item) => item.role === "proof") ?? project.media[0];
  const imageDimensions = getMediaDimensions(image.src);
  const canonical = projectCanonicalUrl(locale, project.slug);
  const title = `${copy.title} — ${copy.category}`;

  return {
    title,
    description: copy.summary,
    alternates: metadataAlternates(locale, `/projects/${project.slug}`),
    openGraph: {
      title,
      description: copy.summary,
      url: canonical,
      siteName: siteConfig.name,
      locale: openGraphLocaleByLocale[locale],
      type: "article",
      images: [{ url: image.src, ...imageDimensions, alt: image.alt[locale] }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: copy.summary,
      images: [image.src]
    }
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { locale: localeParam, slug } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  const content = siteContent[locale];
  const ui = uiCopy[locale];
  const labels = projectLabels[locale];
  const copy = project.copy[locale];
  const detailLabels = content.lab.detailLabels;
  const heroMedia = project.media.find((item) => item.role === "proof") ?? project.media[0];
  const canonical = projectCanonicalUrl(locale, project.slug);
  const currentIndex = projects.findIndex((item) => item.slug === project.slug);
  const previousProject = projects[(currentIndex - 1 + projects.length) % projects.length];
  const nextProject = projects[(currentIndex + 1) % projects.length];

  const externalLinks: Array<{ href: string; label: string }> = [];

  if (project.liveUrl) {
    externalLinks.push({ href: project.liveUrl, label: labels.live });
  }
  if (project.repositoryUrl) {
    externalLinks.push({ href: project.repositoryUrl, label: labels.repository });
  }
  if (project.articleUrl) {
    externalLinks.push({ href: project.articleUrl, label: labels.article });
  }
  if (project.referenceUrl) {
    externalLinks.push({ href: project.referenceUrl, label: labels.reference });
  }

  const proofItems = project.media.map((media, index) => ({
    src: media.src,
    alt: media.alt[locale],
    label: `${String(index + 1).padStart(2, "0")} · ${mediaRoleLabel(locale, media.role)}`,
    caption: media.claim[locale],
    role: mediaRoleLabel(locale, media.role)
  }));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: copy.title,
    description: copy.summary,
    url: canonical,
    mainEntityOfPage: canonical,
    inLanguage: locale,
    genre: copy.category,
    keywords: copy.tags.join(", "),
    image: project.media.map((media) => new URL(media.src, siteConfig.mainUrl).toString()),
    author: {
      "@type": "Person",
      name: locale === "ko" ? "탁찬우 / Nimdal" : "Tak Chanwoo / Nimdal",
      url: new URL(`/${locale}/portfolio`, siteConfig.mainUrl).toString()
    },
    sameAs: externalLinks.map((link) => link.href),
    associatedMedia: project.media.map((media) => ({
      "@type": "ImageObject",
      contentUrl: new URL(media.src, siteConfig.mainUrl).toString(),
      caption: media.claim[locale],
      creditText: media.source[locale],
      ...(media.capturedAt === "undated" ? {} : { dateCreated: media.capturedAt })
    }))
  };

  return (
    <div className="site-shell project-page">
      <StructuredData data={structuredData} />
      <SiteHeader locale={locale} labels={ui.header} tone="navy" />
      <main id="main-content">
        <section className="project-hero section-navy" aria-labelledby="project-title">
          <div className="project-hero-grid">
            <div className="project-hero-copy">
              <Link className="project-back-link" href={`/${locale}#work`}>
                {ui.project.back}
              </Link>
              <p className="eyebrow">
                {labels.caseStudy} · {copy.category}
              </p>
              <h1 id="project-title">{copy.title}</h1>
              <p className="project-summary">{copy.summary}</p>
              <ul className="tag-list" aria-label={locale === "ko" ? "프로젝트 태그" : "Project tags"}>
                {copy.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              <div className="project-status-row">
                <span>{ui.project.status}</span>
                <strong>{content.lab.status[project.status]}</strong>
              </div>
              {externalLinks.length > 0 ? (
                <div className="project-external-links" aria-label={ui.project.visit}>
                  {externalLinks.map((link) => (
                    <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            <figure className="project-hero-media">
              <div className="project-hero-image">
                <Image
                  src={heroMedia.src}
                  alt={heroMedia.alt[locale]}
                  fill
                  priority
                  loading="eager"
                  sizes="(max-width: 860px) 100vw, 52vw"
                />
              </div>
              <figcaption>
                <span>{mediaRoleLabel(locale, heroMedia.role)}</span>
                <p>{heroMedia.source[locale]}</p>
              </figcaption>
            </figure>
          </div>

          <nav className="case-anchor-nav" aria-label={labels.sections}>
            <Link href="#signal">{detailLabels.problem}</Link>
            <Link href="#build">{detailLabels.decision} · {detailLabels.system}</Link>
            <Link href="#proof">{detailLabels.proof}</Link>
            <Link href="#next">{detailLabels.limitation} · {detailLabels.next}</Link>
          </nav>
        </section>

        <div className="case-study section-foam">
          <Reveal>
            <section className="case-section" id="signal" aria-labelledby="problem-title">
              <div className="case-index" aria-hidden="true">01</div>
              <div className="case-copy">
                <p className="eyebrow">{detailLabels.problem}</p>
                <h2 id="problem-title">{detailLabels.problem}</h2>
                <p>{copy.detail.problem}</p>
              </div>
            </section>
          </Reveal>

        <Reveal>
          <section className="case-section case-section-build" id="build" aria-label={`${detailLabels.decision}, ${detailLabels.system}`}>
            <div className="case-index" aria-hidden="true">02</div>
            <div className="case-build-grid">
              <article>
                <p className="eyebrow">{detailLabels.decision}</p>
                <h2>{detailLabels.decision}</h2>
                <p>{copy.detail.decision}</p>
              </article>
              <article>
                <p className="eyebrow">{detailLabels.system}</p>
                <h2>{detailLabels.system}</h2>
                <p>{copy.detail.system}</p>
              </article>
            </div>
          </section>
        </Reveal>

        <section className="case-section evidence-section" id="proof" aria-labelledby="proof-title">
          <div className="case-index" aria-hidden="true">03</div>
          <div className="case-copy evidence-intro">
            <p className="eyebrow">{detailLabels.proof}</p>
            <h2 id="proof-title">{labels.media}</h2>
            <p>{copy.detail.proof}</p>
          </div>

          <div className="proof-switcher-wrap">
            <ProofSwitcher items={proofItems} />
          </div>

          <div className="evidence-ledger" aria-label={labels.evidenceLedger}>
            {project.media.map((media, index) => (
              <Reveal key={`${media.src}-${media.role}`}>
                <figure className="evidence-card">
                  <div className="evidence-card-media">
                    <Image
                      src={media.src}
                      alt={media.alt[locale]}
                      fill
                      sizes="(max-width: 860px) 100vw, 44vw"
                    />
                  </div>
                  <figcaption>
                    <div className="evidence-card-heading">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{mediaRoleLabel(locale, media.role)}</strong>
                    </div>
                    <dl className="evidence-facts">
                      <div>
                        <dt>{ui.project.source}</dt>
                        <dd>{media.source[locale]}</dd>
                      </div>
                      <div>
                        <dt>{ui.project.captured}</dt>
                        <dd>
                          {media.capturedAt === "undated" ? (
                            labels.undated
                          ) : (
                            <time dateTime={media.capturedAt}>{media.capturedAt}</time>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt>{ui.project.claim}</dt>
                        <dd>{media.claim[locale]}</dd>
                      </div>
                      <div>
                        <dt>{ui.project.boundary}</dt>
                        <dd>{media.limitation[locale]}</dd>
                      </div>
                    </dl>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>

        <Reveal>
          <section className="case-section case-section-next" id="next" aria-label={`${detailLabels.limitation}, ${detailLabels.next}`}>
            <div className="case-index" aria-hidden="true">04</div>
            <div className="case-next-grid">
              <article>
                <p className="eyebrow">{detailLabels.limitation}</p>
                <h2>{detailLabels.limitation}</h2>
                <p>{copy.detail.limitation}</p>
              </article>
              <article>
                <p className="eyebrow">{detailLabels.next}</p>
                <h2>{detailLabels.next}</h2>
                <p>{copy.detail.next}</p>
              </article>
            </div>
          </section>
        </Reveal>
        </div>

        <nav className="project-pagination" aria-label={locale === "ko" ? "프로젝트 이동" : "Project navigation"}>
          <Link href={`/${locale}/projects/${previousProject.slug}`}>
            <span>{labels.previous}</span>
            <strong>{previousProject.copy[locale].title}</strong>
          </Link>
          <Link href={`/${locale}/projects/${nextProject.slug}`}>
            <span>{labels.next}</span>
            <strong>{nextProject.copy[locale].title}</strong>
          </Link>
        </nav>
      </main>

      <SiteFooter locale={locale} note={content.footer.tagline} />
    </div>
  );
}
