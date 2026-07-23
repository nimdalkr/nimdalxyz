import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PixelEffects } from "@/components/pixel/PixelEffects";
import { StructuredData } from "@/components/seo/StructuredData";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getProject, isLocale, locales, projectSlugs, projects } from "@/lib/content";
import { getMediaDimensions } from "@/lib/media";
import { metadataAlternates, openGraphLocaleByLocale, projectCanonicalUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() { return locales.flatMap((locale) => projectSlugs.map((slug) => ({ locale, slug }))); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: value, slug } = await params;
  if (!isLocale(value)) return {};
  const project = getProject(slug);
  if (!project) return { title: value === "ko" ? "프로젝트를 찾을 수 없습니다" : "Project not found" };
  const copy = project.copy[value];
  const image = project.media.find((item) => item.role === "proof") ?? project.media[0];
  return { title: `${copy.title} — ${copy.category}`, description: copy.summary, alternates: metadataAlternates(value, `/projects/${slug}`), openGraph: { title: copy.title, description: copy.summary, url: projectCanonicalUrl(value, slug), siteName: siteConfig.name, locale: openGraphLocaleByLocale[value], images: [{ url: image.src, ...getMediaDimensions(image.src), alt: image.alt[value] }] }, twitter: { card: "summary_large_image", images: [image.src] } };
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
  const links = [[project.liveUrl, korean ? "사이트 보기" : "LIVE PRODUCT"], [project.repositoryUrl, korean ? "저장소 보기" : "REPOSITORY"], [project.articleUrl, korean ? "제작 기록" : "BUILD LOG"], [project.referenceUrl, korean ? "관련 자료" : "REFERENCE"]].filter((item): item is [string, string] => Boolean(item[0]));
  const schema = { "@context": "https://schema.org", "@type": "CreativeWork", name: copy.title, description: copy.summary, url: projectCanonicalUrl(locale, project.slug), image: project.media.map((media) => new URL(media.src, siteConfig.mainUrl).toString()) };
  const chapters = [["signal", "01", korean ? "문제" : "Problem", copy.detail.problem], ["build", "02", korean ? "판단" : "Decision", copy.detail.decision], ["system", "03", korean ? "시스템" : "System", copy.detail.system], ["next", "04", korean ? "다음 단계" : "Next", `${copy.detail.limitation} ${copy.detail.next}`]] as const;

  return <div className="pixel-surface pixel-page"><PixelEffects /><StructuredData data={schema} /><SiteHeader locale={locale} />
    <main id="main-content"><section className="pixel-project-hero"><div className="pixel-wrap pixel-project-hero-grid"><div><Link className="pixel-back" href={`/${locale}#work`}>← {korean ? "프로젝트로 돌아가기" : "BACK TO WORK"}</Link><p className="pixel-kicker">PROJECT — {copy.category}</p><h1>{copy.title}</h1><p className="pixel-lead">{copy.summary}</p><p className="pixel-chip-row">{copy.tags.map((tag) => <span key={tag}>{tag}</span>)}</p><div className="pixel-actions">{links.map(([href, label]) => <a data-mag key={href} className="pixel-button" href={href} target="_blank" rel="noreferrer">{label} ↗</a>)}</div></div><figure className="pixel-project-image"><Image src={hero.src} alt={hero.alt[locale]} fill priority sizes="(max-width: 760px) calc(100vw - 48px), 48vw" /></figure></div></section>
      <section className="pixel-section"><div className="pixel-wrap pixel-chapter-grid">{chapters.map(([id, number, title, body]) => <article id={id} key={id}><p>{number} — {title}</p><h2>{title}</h2><span>{body}</span></article>)}</div></section>
      <section className="pixel-career-band" id="proof"><div className="pixel-wrap"><div className="pixel-section-title is-dark" data-pixel-reveal><span>SCREEN RECORD</span><h2>{korean ? "남아 있는 화면" : "Screens that remain"}</h2></div><p className="pixel-proof-intro">{copy.detail.proof}</p><div className="pixel-media-grid">{project.media.map((media, mediaIndex) => <figure data-pixel-reveal key={media.src}><div><Image src={media.src} alt={media.alt[locale]} fill sizes="(max-width: 700px) calc(100vw - 48px), 48vw" /></div><figcaption><span>{String(mediaIndex + 1).padStart(2, "0")} — {media.role.toUpperCase()}</span><strong>{media.source[locale]}</strong><small>{media.claim[locale]}</small></figcaption></figure>)}</div></div></section>
      <section className="pixel-section"><div className="pixel-wrap"><Link className="pixel-next-project" href={`/${locale}/projects/${next.slug}`}><span>{korean ? "NEXT PROJECT" : "NEXT PROJECT"}</span><strong>{next.copy[locale].title} →</strong></Link></div></section>
    </main><SiteFooter locale={locale} note="MADE BY A MARKETER, SHIPPED LIKE A DEV" /></div>;
}
