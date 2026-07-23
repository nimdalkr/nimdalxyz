import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PixelEffects } from "@/components/pixel/PixelEffects";
import { LegacyHashBridge } from "@/components/compat/LegacyHashBridge";
import { StructuredData } from "@/components/seo/StructuredData";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getLocalizedBlogPosts } from "@/content/blog/posts";
import { getProject, isLocale, siteContent } from "@/lib/content";
import { absoluteCanonicalUrl, metadataAlternates, openGraphLocaleByLocale } from "@/lib/seo";

interface HomePageProps { params: Promise<{ locale: string }>; }

const work = ["hyperalphaduo", "alphaduo", "mylol"] as const;
const engagementRows = [
  { period: "2026.04–2026.06", organization: "1six.tech Inc. / NEVADA", role: "Marketing Lead", focus: "SEO / KOL / LOCALIZATION" },
  { period: "2025.01–2025.09", organization: "071Labs", role: "GTM", focus: "CONTENT / COMMUNITY OPS" },
  { period: "2012.12–2024.09", organization: "MKR", role: "MARKETING AGENCY", focus: "CLIENT OPS / CAMPAIGN SYSTEM" }
] as const;

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
    openGraph: { title: content.seo.title, description: content.seo.description, url: canonical, locale: openGraphLocaleByLocale[locale], type: "website", images: [{ url: "/media/identity-octopus.jpg", width: 400, height: 400, alt: content.home.identity.avatarAlt }] },
    twitter: { card: "summary", title: content.seo.title, description: content.seo.description, images: ["/media/identity-octopus.jpg"] }
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const locale = pageLocale((await params).locale);
  const korean = locale === "ko";
  const content = siteContent[locale];
  const selectedProjects = work.map((slug) => {
    const project = getProject(slug);
    if (!project) throw new Error(`Missing ${slug}`);
    const media = project.media.find((item) => item.role === "proof") ?? project.media[0];
    return { project, media };
  });
  const posts = (await getLocalizedBlogPosts(locale)).slice(0, 2);
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
    <div className="pixel-surface">
      <PixelEffects />
      <LegacyHashBridge locale={locale} />
      <StructuredData data={schema} />
      <SiteHeader locale={locale} active="home" />
      <main id="main-content">
        <section className="pixel-hero" id="top" aria-labelledby="home-title">
          <div className="pixel-wrap pixel-hero-grid">
            <div className="pixel-hero-copy">
              <p className="pixel-kicker">SEOUL, KR — MARKETER &amp; BUILDER</p>
              <h1 id="home-title">{korean ? <>만드는 마케터,<br />님달입니다.</> : <>A marketer<br />who ships.</>}</h1>
              <p className="pixel-lead">{korean ? "2012년부터 캠페인을 운영했습니다. 지금은 리서치 도구와 자동화 제품을 직접 만들고 있습니다. 기획서보다 돌아가는 화면을 먼저 보여드립니다." : "Running campaigns since 2012. Now building research tools and automation — with working screens before slide decks."}</p>
              <div className="pixel-actions">
                <Link data-mag className="pixel-button is-pink" href="#work">{korean ? "프로젝트 보기" : "SEE PROJECTS"} ↓</Link>
                <Link data-mag className="pixel-button" href={`/${locale}/about`}>{korean ? "소개 읽기" : "ABOUT ME"}</Link>
              </div>
            </div>
            <figure className="pixel-hero-avatar" aria-label={content.home.identity.avatarAlt}>
              <Image src="/media/identity-octopus.jpg" alt={content.home.identity.avatarAlt} width={230} height={230} priority sizes="(max-width: 680px) 180px, 230px" />
            </figure>
          </div>
        </section>

        <div className="pixel-marquee" aria-label="Shipped, not slides. Campaign operations. Web3 Korean GTM. Research tools. Automation.">
          <div>★ SHIPPED, NOT SLIDES <b>★ CAMPAIGN OPS</b> ★ WEB3 KR GTM <b>★ RESEARCH TOOLS</b> ★ AUTOMATION ★ SHIPPED, NOT SLIDES <b>★ CAMPAIGN OPS</b> ★ WEB3 KR GTM <b>★ RESEARCH TOOLS</b> ★ AUTOMATION</div>
        </div>

        <section className="pixel-section" id="work" aria-labelledby="work-title">
          <div className="pixel-wrap">
            <div className="pixel-section-title" data-pixel-reveal><span>WORK</span><h2 id="work-title">{korean ? "직접 만든 것들" : "Things I built"}</h2></div>
            <div className="pixel-work-grid">
              {selectedProjects.map(({ project, media }, index) => {
                const copy = project.copy[locale];
                const status = project.status === "live" ? "LIVE" : "PROTO";
                return <Link data-pixel-reveal key={project.slug} className={`pixel-work-card pixel-tilt-${index + 1}`} href={`/${locale}/projects/${project.slug}`}>
                  <span className="pixel-work-image"><Image src={media.src} alt={media.alt[locale]} fill sizes="(max-width: 720px) calc(100vw - 48px), 340px" /></span>
                  <span className="pixel-work-copy"><span className="pixel-work-line"><strong>{copy.title}</strong><em className={project.status === "live" ? "is-live" : undefined}>{status}</em></span><small>{copy.summary}</small></span>
                </Link>;
              })}
            </div>
          </div>
        </section>

        <section className="pixel-section pixel-about-card-wrap" aria-labelledby="about-title">
          <div className="pixel-wrap"><article className="pixel-about-card" data-pixel-reveal>
            <div><p>ABOUT</p><h2 id="about-title">{korean ? "마케터의 눈, 빌더의 손" : "A marketer's eye, a builder's hands"}</h2><p className="pixel-card-copy">{korean ? "에이전시에서 브랜드와 로컬 비즈니스의 마케팅을 운영했습니다. Web3 프로젝트의 한국 GTM을 거쳐, 지금은 반복되는 일을 도구로 바꾸고 있습니다." : "From agency operations to Korean Web3 GTM, I now turn recurring market work into useful tools."}</p><Link href={`/${locale}/about`}>{korean ? "소개 더 보기" : "MORE ABOUT ME"} →</Link></div>
            <div className="pixel-portrait-box"><Image src="/media/operator-portrait.png" alt={content.home.identity.portraitAlt} width={150} height={200} sizes="150px" /></div>
          </article></div>
        </section>

        <section className="pixel-career-band" id="career" aria-labelledby="career-title"><div className="pixel-wrap">
          <div className="pixel-section-title is-dark" data-pixel-reveal><span>CAREER</span><h2 id="career-title">{korean ? "거쳐온 곳들" : "Where I've worked"}</h2><Link href={`/${locale}/portfolio`}>{korean ? "경력 자세히" : "FULL CAREER"} →</Link></div>
          <div className="pixel-career-list" data-pixel-reveal>{engagementRows.map((row) => <div key={row.organization}><time>{row.period}</time><strong>{row.organization}</strong><span>{row.role} · {row.focus}</span></div>)}</div>
          <p className="pixel-client-tags" data-pixel-reveal><span>LEICA</span><span>H ANIMAL MEDICAL CENTER</span><span>JOYA SWISS</span><span>NEVADA</span></p>
        </div></section>

        <section className="pixel-section" id="blog" aria-labelledby="blog-title"><div className="pixel-wrap">
          <div className="pixel-section-title" data-pixel-reveal><span>BLOG</span><h2 id="blog-title">{korean ? "만들면서 배운 것들" : "Notes from building"}</h2></div>
          <div className="pixel-post-list">{posts.map((post) => <a data-pixel-reveal key={post.slug} className="pixel-post-row" href={post.canonicalUrl}><span><i>{post.category} · {post.publishedAt.replaceAll("-", ".")}</i><strong>{post.title}</strong></span><b aria-hidden>→</b></a>)}</div>
          <a className="pixel-more" href={`https://blog.nimdal.xyz/${locale}`}>{korean ? "글 전체 보기" : "ALL POSTS"} →</a>
        </div></section>

        <section className="pixel-contact" id="contact" aria-labelledby="contact-title"><div className="pixel-wrap"><div data-pixel-reveal className="pixel-contact-card"><p>CONTACT</p><h2 id="contact-title">{korean ? "재미있는 문제를 찾고 있습니다." : "Looking for interesting problems."}</h2><span>{korean ? "제품, 시장, 지금 막힌 지점을 보내주세요." : "Send the product, market, and the point where it is stuck."}</span><a data-mag className="pixel-button" href="mailto:0xnimdal@gmail.com">0xnimdal@gmail.com</a><nav><a href="https://x.com/0xnimdal" target="_blank" rel="noreferrer">X ↗</a><a href="https://t.me/nimdal" target="_blank" rel="noreferrer">TELEGRAM ↗</a><a href="https://linkedin.com/in/chanwoo-tak-132b281a4" target="_blank" rel="noreferrer">LINKEDIN ↗</a></nav></div></div></section>
      </main>
      <SiteFooter locale={locale} note="MADE BY A MARKETER, SHIPPED LIKE A DEV" />
    </div>
  );
}
