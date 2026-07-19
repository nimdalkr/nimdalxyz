import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LegacyHashBridge } from "@/components/compat/LegacyHashBridge";
import { LabFilter } from "@/components/home/LabFilter";
import { Reveal } from "@/components/motion/Reveal";
import { StructuredData } from "@/components/seo/StructuredData";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { blogPosts, isLocale, projects, siteContent } from "@/lib/content";
import { absoluteCanonicalUrl, metadataAlternates, openGraphLocaleByLocale } from "@/lib/seo";
import { uiCopy } from "@/lib/ui";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

const featuredSlugs = ["alphaduo", "hyperalphaduo", "mylol"];

function localeOrNotFound(value: string) {
  if (!isLocale(value)) notFound();
  return value;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const locale = localeOrNotFound((await params).locale);
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
      images: [{ url: "/media/identity-octopus.jpg", width: 400, height: 400, alt: content.home.identity.avatarAlt }]
    },
    twitter: { card: "summary", title: content.seo.title, description: content.seo.description, images: ["/media/identity-octopus.jpg"] }
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const locale = localeOrNotFound((await params).locale);
  const content = siteContent[locale];
  const ui = uiCopy[locale];
  const featured = featuredSlugs.map((slug) => projects.find((project) => project.slug === slug)).filter(Boolean);
  const labProjects = projects.filter((project) => !featuredSlugs.includes(project.slug));
  const identity = content.home.identity;
  const signalIndexes = [0, 3, 5, 6] as const;
  const signals = signalIndexes.map((index) => content.career.signals[index]);

  const labItems = labProjects.map((project) => {
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

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Nimdal",
      url: absoluteCanonicalUrl(locale),
      inLanguage: locale,
      description: content.seo.description
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: identity.legalName,
      alternateName: "Nimdal",
      url: absoluteCanonicalUrl(locale, "/portfolio"),
      image: "https://nimdal.xyz/media/operator-portrait.png",
      email: `mailto:${content.home.contact.email}`,
      sameAs: ["https://x.com/0xnimdal", "https://t.me/nimdal", "https://linkedin.com/in/chanwoo-tak-132b281a4"]
    }
  ];

  return (
    <div className="site-shell home-page">
      <LegacyHashBridge locale={locale} />
      <StructuredData data={structuredData} />
      <div className="home-header-surface">
        <SiteHeader locale={locale} labels={ui.header} tone="cyan" />
      </div>
      <main id="main-content">
        <section className="hero-surface" aria-labelledby="hero-title">
          <div className="hero-content">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow hero-eyebrow">{identity.eyebrow} · {identity.role}</p>
              <h1 id="hero-title">NIMDAL</h1>
              <p className="hero-headline">{identity.headline}</p>
              <p className="hero-description">{identity.description}</p>
              <div className="hero-actions">
                <Link className="button button-dark" href={`/${locale}#work`}>{identity.primaryCta}</Link>
                <Link className="text-link" href={`/${locale}/portfolio`}>{identity.secondaryCta}<span aria-hidden>↗</span></Link>
              </div>
            </div>
            <figure className="identity-portal">
              <Image
                src="/media/identity-octopus.jpg"
                alt={identity.avatarAlt}
                fill
                priority
                loading="eager"
                sizes="(max-width: 760px) 82vw, 34vw"
              />
              <figcaption><span>IDENTITY / 01</span><span>PIXEL OCTOPUS</span></figcaption>
            </figure>
          </div>
          <div className="hero-meta" aria-label="Location and availability">
            <span>{identity.location}</span>
            <span>{identity.availability}</span>
          </div>
          </div>
        </section>

        <section className="signal-rail" aria-label={locale === "ko" ? "경력 수치" : "Career signals"}>
        <div className="signal-label">PORTFOLIO CLAIM</div>
        {signals.map((signal) => (
          <article key={signal.value}>
            <strong>{signal.value}</strong>
            <span>{signal.label}</span>
            <small>{signal.limitation}</small>
          </article>
        ))}
        </section>

        <section className="selected-work section-navy" id="work" aria-labelledby="selected-title">
        <div className="section-heading section-heading-light">
          <div>
            <p className="eyebrow">{ui.selected.eyebrow}</p>
            <h2 id="selected-title">{ui.selected.title}</h2>
          </div>
          <p>{ui.selected.description}</p>
        </div>
        <div className="proof-list">
          {featured.map((project, index) => {
            if (!project) return null;
            const copy = project.copy[locale];
            const media = project.media.find((item) => item.role === "proof") ?? project.media[0];
            return (
              <Reveal key={project.slug}>
                <article className="proof-row">
                  <Link className="proof-image" href={`/${locale}/projects/${project.slug}`} aria-label={`${ui.selected.open}: ${copy.title}`}>
                    <Image src={media.src} alt={media.alt[locale]} fill sizes="(max-width: 820px) 100vw, 54vw" />
                    <span className="proof-badge">{media.role === "proof" ? ui.proof.proof : ui.proof.concept}</span>
                  </Link>
                  <div className="proof-copy">
                    <div className="proof-index">0{index + 1} / 03</div>
                    <p className="eyebrow">{copy.category}</p>
                    <h3><Link href={`/${locale}/projects/${project.slug}`}>{copy.title}</Link></h3>
                    <p>{copy.summary}</p>
                    <ul className="tag-list" aria-label="Project tags">
                      {copy.tags.map((tag) => <li key={tag}>{tag}</li>)}
                    </ul>
                    <div className="proof-links">
                      <Link className="text-link text-link-light" href={`/${locale}/projects/${project.slug}`}>{ui.selected.open}<span aria-hidden>→</span></Link>
                      {"liveUrl" in project && project.liveUrl ? <a className="text-link text-link-light" href={project.liveUrl} target="_blank" rel="noreferrer">{ui.selected.live}<span aria-hidden>↗</span></a> : null}
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
        </section>

        <section className="dual-practice section-foam" aria-labelledby="practice-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{ui.practice.eyebrow}</p>
            <h2 id="practice-title">{ui.practice.title}</h2>
          </div>
          <p>{content.home.process.description}</p>
        </div>
        <div className="practice-pair">
          <article className="practice-card is-cyan">
            <span>01</span><h3>{ui.practice.operations}</h3><p>{ui.practice.operationsBody}</p>
          </article>
          <article className="practice-card is-coral">
            <span>02</span><h3>{ui.practice.product}</h3><p>{ui.practice.productBody}</p>
          </article>
        </div>
        <ol className="process-list">
          {content.home.process.steps.map((step) => (
            <li key={step.index}>
              <span>{step.index}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <small>{step.outcome}</small>
            </li>
          ))}
        </ol>
        </section>

        <section className="lab-section section-foam" id="lab" aria-labelledby="lab-title">
        <div className="section-heading">
          <div><p className="eyebrow">{content.lab.eyebrow}</p><h2 id="lab-title">{content.lab.title}</h2></div>
          <div className="heading-aside"><p>{content.lab.description}</p><Link className="text-link" href={`/${locale}/lab`}>{ui.lab.archive}<span aria-hidden>→</span></Link></div>
        </div>
        <LabFilter items={labItems} labels={ui.lab} />
        </section>

        <section className="operator-section" id="about" aria-labelledby="operator-title">
        <div className="operator-portrait">
          <Image src="/media/operator-portrait.png" alt={identity.portraitAlt} fill sizes="(max-width: 800px) 100vw, 42vw" />
        </div>
        <div className="operator-copy">
          <p className="eyebrow">{ui.about.eyebrow}</p>
          <h2 id="operator-title">{ui.about.title}</h2>
          <p>{ui.about.body}</p>
          <div className="operator-mini-signals">
            {content.career.signals.slice(0, 4).map((signal) => <div key={signal.value}><strong>{signal.value}</strong><span>{signal.label}</span></div>)}
          </div>
          <div className="operator-actions">
            <Link className="button button-light" href={`/${locale}/portfolio`}>{ui.about.dossier}</Link>
            <a className="text-link text-link-light" href="/media/career/tak-chanwoo-nimdal-portfolio-v2.pdf" download>{ui.about.download}<span aria-hidden>↓</span></a>
          </div>
        </div>
        </section>

        <section className="log-section section-foam" id="log" aria-labelledby="log-title">
        <div className="section-heading">
          <div><p className="eyebrow">{content.blog.eyebrow}</p><h2 id="log-title">{content.blog.title}</h2></div>
          <div className="heading-aside"><p>{content.blog.description}</p><a className="text-link" href={`https://blog.nimdal.xyz/${locale}`}>{ui.log.all}<span aria-hidden>↗</span></a></div>
        </div>
        <div className="log-grid">
          {blogPosts.map((post, index) => {
            const copy = post.copy[locale];
            return (
              <article className="log-card" key={post.slug}>
                <a href={`https://blog.nimdal.xyz/${locale}/posts/${post.slug}`} className="log-card-image" aria-label={`${content.blog.readMore}: ${copy.title}`}>
                  <Image src={post.cover} alt="" fill sizes="(max-width: 760px) 100vw, 33vw" />
                  <span>0{index + 1}</span>
                </a>
                <p className="eyebrow">{copy.category} · <time dateTime={post.publishedAt}>{post.publishedAt}</time></p>
                <h3><a href={`https://blog.nimdal.xyz/${locale}/posts/${post.slug}`}>{copy.title}</a></h3>
                <p>{copy.description}</p>
              </article>
            );
          })}
        </div>
        </section>

        <section className="contact-section" id="contact" aria-labelledby="contact-title">
        <p className="eyebrow">{content.home.contact.eyebrow}</p>
        <h2 id="contact-title">{content.home.contact.title}</h2>
        <p>{content.home.contact.description}</p>
        <a className="contact-email" href={`mailto:${content.home.contact.email}`}>{content.home.contact.email}<span aria-hidden>↗</span></a>
        <div className="contact-links">
          <a href="https://x.com/0xnimdal" target="_blank" rel="noreferrer">{ui.contact.x} ↗</a>
          <a href="https://t.me/nimdal" target="_blank" rel="noreferrer">{ui.contact.telegram} ↗</a>
          <a href="https://linkedin.com/in/chanwoo-tak-132b281a4" target="_blank" rel="noreferrer">{ui.contact.linkedin} ↗</a>
        </div>
        </section>
      </main>
      <SiteFooter locale={locale} note={content.footer.tagline} />
    </div>
  );
}
