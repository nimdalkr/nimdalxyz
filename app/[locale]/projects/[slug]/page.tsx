import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/riso/Reveal";
import { RisoPlate } from "@/components/riso/RisoPlate";
import { StructuredData } from "@/components/seo/StructuredData";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getProject, isLocale, locales, projectSlugs, projects } from "@/lib/content";
import { getMediaDimensions } from "@/lib/media";
import { metadataAlternates, openGraphLocaleByLocale, projectCanonicalUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => projectSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: value, slug } = await params;
  if (!isLocale(value)) return {};
  const project = getProject(slug);
  if (!project) return { title: value === "ko" ? "프로젝트를 찾을 수 없습니다" : "Project not found" };
  const copy = project.copy[value];
  const image = project.media.find((item) => item.role === "proof") ?? project.media[0];
  return {
    title: `${copy.title} / ${copy.category}`,
    description: copy.summary,
    alternates: metadataAlternates(value, `/projects/${slug}`),
    openGraph: {
      title: copy.title,
      description: copy.summary,
      url: projectCanonicalUrl(value, slug),
      siteName: siteConfig.name,
      locale: openGraphLocaleByLocale[value],
      images: [{ url: image.src, ...getMediaDimensions(image.src), alt: image.alt[value] }]
    },
    twitter: { card: "summary_large_image", images: [image.src] }
  };
}

export default async function ProjectPage({ params }: Props) {
  const { locale: value, slug } = await params;
  if (!isLocale(value)) notFound();
  const project = getProject(slug);
  if (!project) notFound();
  const locale = value;
  const korean = locale === "ko";
  const copy = project.copy[locale];
  const hero = project.media.find((item) => item.role === "proof") ?? project.media[0];
  const index = projects.findIndex((item) => item.slug === project.slug);
  const next = projects[(index + 1) % projects.length];
  const links = [
    [project.liveUrl, korean ? "사이트 보기" : "Live product"],
    [project.repositoryUrl, korean ? "저장소 보기" : "Repository"],
    [project.articleUrl, korean ? "제작 기록" : "Build log"],
    [project.referenceUrl, korean ? "관련 자료" : "Reference"]
  ].filter((item): item is [string, string] => Boolean(item[0]));
  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: copy.title,
    description: copy.summary,
    url: projectCanonicalUrl(locale, project.slug),
    image: project.media.map((media) => new URL(media.src, siteConfig.mainUrl).toString())
  };
  const chapters = [
    { id: "signal", title: korean ? "문제" : "Problem", body: copy.detail.problem },
    { id: "build", title: korean ? "판단" : "Decision", body: copy.detail.decision },
    { id: "system", title: korean ? "시스템" : "System", body: copy.detail.system },
    { id: "next", title: korean ? "다음 단계" : "What is next", body: `${copy.detail.limitation} ${copy.detail.next}` }
  ];

  return (
    <div className="page">
      <StructuredData data={schema} />
      <SiteHeader locale={locale} />
      <main id="main-content">
        {/* 1. Split hero: the proof screen as a printed plate. */}
        <section className="page-head" aria-labelledby="project-title">
          <div className="wrap split-flip">
            <div>
              <Link className="rule-link" href={`/${locale}#work`}>
                {korean ? "프로젝트로 돌아가기" : "Back to work"}
              </Link>
              <p className="press-mark" style={{ marginTop: "1.5rem" }}>{copy.category}</p>
              <h1 id="project-title">{copy.title}</h1>
              <p className="lede">{copy.summary}</p>
              <ul className="chip-row">
                {copy.tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
              {links.length ? (
                <div className="actions">
                  {links.map(([href, label], linkIndex) => (
                    <a
                      key={href}
                      className={linkIndex === 0 ? "btn btn-flo" : "btn"}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
            <RisoPlate
              className="feature-plate"
              src={hero.src}
              alt={hero.alt[locale]}
              priority
              offset={18}
              sizes="(max-width: 767px) 100vw, 45vw"
            />
          </div>
        </section>

        {/* 2. Chapters: four ruled blocks, two by two. */}
        <section className="band" aria-labelledby="chapters-title">
          <div className="wrap">
            <div className="head">
              <h2 id="chapters-title">{korean ? "어떻게 만들었나" : "How it was built"}</h2>
            </div>
            <div className="chapters">
              {chapters.map((chapter, chapterIndex) => (
                <Reveal key={chapter.id} as="article" index={chapterIndex}>
                  <div id={chapter.id}>
                    <h3>{chapter.title}</h3>
                    <p>{chapter.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Proof sheet: a contact sheet, captions under the frame. */}
        <section className="band band-ink" id="proof" aria-labelledby="proof-title">
          <div className="wrap">
            <div className="head">
              <h2 id="proof-title">{korean ? "남아 있는 화면" : "Screens that remain"}</h2>
            </div>
            <p className="lede" style={{ marginBottom: "clamp(2rem, 4vw, 3rem)" }}>{copy.detail.proof}</p>
            <div className="proof-sheet">
              {project.media.map((media, mediaIndex) => (
                <Reveal key={media.src} as="figure" index={mediaIndex}>
                  <RisoPlate
                    className="proof-plate"
                    src={media.src}
                    alt={media.alt[locale]}
                    sizes="(max-width: 767px) 100vw, 45vw"
                  />
                  <figcaption>
                    <strong>{media.source[locale]}</strong>
                    <small>{media.claim[locale]}</small>
                  </figcaption>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Next. */}
        <section className="band band-tight">
          <div className="wrap">
            <Link className="next-project" href={`/${locale}/projects/${next.slug}`}>
              <span className="press-mark">{korean ? "다음 프로젝트" : "Next project"}</span>
              <strong>{next.copy[locale].title}</strong>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} note={korean ? "마케터가 만들고, 개발자처럼 배포합니다" : "Made by a marketer, shipped like a dev"} />
    </div>
  );
}
