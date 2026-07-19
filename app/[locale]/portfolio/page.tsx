import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/motion/Reveal";
import { StructuredData } from "@/components/seo/StructuredData";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { careerCases, isLocale, locales, siteContent, type Locale } from "@/lib/content";
import { absoluteCanonicalUrl, metadataAlternates } from "@/lib/seo";
import { uiCopy } from "@/lib/ui";

interface CareerPageProps {
  params: Promise<{ locale: string }>;
}

const contactLinks = [
  { label: "Email", href: "mailto:0xnimdal@gmail.com", handle: "0xnimdal@gmail.com" },
  { label: "X", href: "https://x.com/0xnimdal", handle: "@0xnimdal" },
  { label: "Telegram", href: "https://t.me/nimdal", handle: "@nimdal" },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/chanwoo-tak-132b281a4",
    handle: "Tak Chanwoo"
  }
] as const;

const pageCopy = {
  ko: {
    metadataTitle: "탁찬우 경력 소개",
    aboutEyebrow: "소개",
    name: "탁찬우 / Nimdal",
    role: "제품 제작 · 캠페인 운영 · 전략",
    aboutTitle: "마케팅과 제품을 기획하고, 직접 만들고 운영합니다.",
    aboutBody:
      "서울에서 일합니다. Web2 에이전시와 로컬·프리미엄 브랜드의 마케팅을 운영했고, 웹3 프로젝트의 한국 시장 진출(GTM)도 맡았습니다. 지금은 리서치 도구와 개인 제품을 함께 만들고 있습니다. 공개 수치는 출처와 확인할 수 있는 범위를 따로 적었습니다.",
    location: "서울 · 원격 협업",
    availability: "현재 리서치 도구와 자동화 제품을 만들며, 캠페인과 한국 GTM을 맡고 있습니다.",
    download: "영문 포트폴리오 PDF",
    signalsEyebrow: "경력 수치",
    signalsTitle: "숫자만 보여주지 않고, 어디서 나온 값인지 함께 적었습니다.",
    casesEyebrow: "주요 경력",
    casesTitle: "대표 운영 사례 6개",
    casesBody:
      "각 사례의 목표, 맡은 일, 운영 방식, 결과를 정리하고 공개 자료로 확인할 수 있는 범위를 따로 적었습니다.",
    period: "기간",
    objective: "목표",
    roleLabel: "맡은 일",
    system: "운영 방식",
    result: "결과",
    constraint: "제약 조건",
    proof: "확인할 수 있는 자료",
    limitation: "이 자료로는 알 수 없는 점",
    channels: "채널",
    source: "자료 출처",
    captured: "기록 날짜",
    capturedUndated: "날짜 미상",
    mediaClaim: "이 자료로 확인되는 것",
    mediaBoundary: "이 자료만으로 알 수 없는 것",
    metricSource: "수치 출처",
    metricBoundary: "수치의 한계",
    careerContext: "경력 참고 자료",
    proofSurface: "제품 화면",
    contactEyebrow: "연락",
    contactTitle: "함께 풀고 싶은 문제를 알려주세요.",
    contactBody: "제품, 시장, 현재 막힌 지점과 원하는 결과를 보내주시면 확인한 뒤 답변드리겠습니다.",
    backHome: "홈으로"
  },
  en: {
    metadataTitle: "Operator Dossier — Nimdal",
    aboutEyebrow: "Operator identity",
    name: "Tak Chanwoo / Nimdal",
    role: "Builder · Campaign operator · Strategist",
    aboutTitle: "I read markets, then turn complex briefs into systems that keep operating.",
    aboutBody:
      "Based in Seoul, I connect Web2 agency operations, local and premium-brand growth, Korean Web3 GTM, research tools, and personal products. Public figures are presented with their context and evidence boundaries at equal weight.",
    location: "Seoul · Remote",
    availability: "Building research tools, automation systems, and campaign and GTM operations.",
    download: "Download English PDF",
    signalsEyebrow: "Operating signals",
    signalsTitle: "Career figures are useful only when their sources and limits travel with them.",
    casesEyebrow: "Representative operations",
    casesTitle: "Six operating cases",
    casesBody:
      "Each case separates the problem, role, system, and recorded result from the strength of its public evidence.",
    period: "Period",
    objective: "Objective",
    roleLabel: "Role",
    system: "Operating system",
    result: "Recorded result",
    constraint: "Constraint",
    proof: "Current evidence",
    limitation: "Limitation",
    channels: "Channels",
    source: "Media source",
    captured: "Recorded",
    capturedUndated: "Undated",
    mediaClaim: "What this media supports",
    mediaBoundary: "Media evidence boundary",
    metricSource: "Metric source",
    metricBoundary: "Metric boundary",
    careerContext: "Career context",
    proofSurface: "Product proof",
    contactEyebrow: "Direct contact",
    contactTitle: "Send the product, market, bottleneck, and outcome you want to build.",
    contactBody: "I will reply by email or a public channel once the context is clear.",
    backHome: "Back home"
  }
} as const;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: CareerPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const locale = localeParam;
  const content = siteContent[locale].career;
  const title = pageCopy[locale].metadataTitle;
  const canonical = absoluteCanonicalUrl(locale, "/portfolio");

  return {
    title,
    description: content.description,
    alternates: metadataAlternates(locale, "/portfolio"),
    openGraph: {
      type: "profile",
      url: canonical,
      title,
      description: content.description,
      locale: locale === "ko" ? "ko_KR" : "en_US",
      alternateLocale: locale === "ko" ? ["en_US"] : ["ko_KR"],
      images: [
        {
          url: "/media/identity-octopus.jpg",
          width: 400,
          height: 400,
          alt: siteContent[locale].home.identity.avatarAlt
        }
      ]
    },
    twitter: {
      card: "summary",
      title,
      description: content.description,
      images: ["/media/identity-octopus.jpg"]
    }
  };
}

export default async function CareerPage({ params }: CareerPageProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale: Locale = localeParam;
  const content = siteContent[locale];
  const career = content.career;
  const copy = pageCopy[locale];
  const provenance = uiCopy[locale].provenance;
  const canonical = absoluteCanonicalUrl(locale, "/portfolio");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${canonical}#profile`,
    url: canonical,
    name: copy.metadataTitle,
    description: career.description,
    inLanguage: locale,
    mainEntity: {
      "@type": "Person",
      name: locale === "ko" ? "탁찬우" : "Tak Chanwoo",
      alternateName: "Nimdal",
      image: new URL("/media/identity-octopus.jpg", "https://nimdal.xyz").toString(),
      email: "mailto:0xnimdal@gmail.com",
      url: canonical,
      jobTitle: copy.role,
      homeLocation: {
        "@type": "Place",
        name: locale === "ko" ? "서울" : "Seoul"
      },
      sameAs: contactLinks.slice(1).map((contact) => contact.href)
    }
  };

  return (
    <div className="career-page">
      <StructuredData data={structuredData} />
      <SiteHeader locale={locale} labels={uiCopy[locale].header} tone="foam" />

      <main className="career-page-main" id="main-content">
        <section className="career-about" id="about" aria-labelledby="career-about-title">
          <div className="career-about-copy">
            <p className="section-eyebrow">{copy.aboutEyebrow}</p>
            <p className="career-role">{copy.role}</p>
            <h1 id="career-about-title">{copy.aboutTitle}</h1>
            <p className="career-about-body">{copy.aboutBody}</p>

            <div className="career-identity-meta" aria-label={copy.name}>
              <strong>{copy.name}</strong>
              <span>{copy.location}</span>
              <span>{copy.availability}</span>
            </div>

            <div className="career-hero-actions">
              <a
                className="button-link is-primary"
                href="/media/career/tak-chanwoo-nimdal-portfolio-v2.pdf"
                download
              >
                {copy.download}
              </a>
              <Link className="text-link" href={`/${locale}`}>
                {copy.backHome}
              </Link>
            </div>
          </div>

          <figure className="career-portrait">
            <Image
              src="/media/operator-portrait.png"
              alt={content.home.identity.portraitAlt}
              width={640}
              height={853}
              priority
              loading="eager"
              sizes="(max-width: 760px) 100vw, 42vw"
            />
            <figcaption>
              <span>{copy.name}</span>
              <span>{copy.role}</span>
            </figcaption>
          </figure>
        </section>

        <section className="career-signals" aria-labelledby="career-signals-title">
          <Reveal className="section-heading career-section-heading">
            <p className="section-eyebrow">{copy.signalsEyebrow}</p>
            <h2 id="career-signals-title">{copy.signalsTitle}</h2>
            <p>{career.metricNotice}</p>
          </Reveal>

          <div className="career-signal-grid">
            {career.signals.map((signal, index) => (
              <Reveal className="career-signal-card" delay={Math.min(index * 0.035, 0.18)} key={signal.value}>
                <div className="career-signal-topline">
                  <strong>{signal.value}</strong>
                  <span className={`provenance-tag is-${signal.provenance}`}>
                    {provenance[signal.provenance]}
                  </span>
                </div>
                <h3>{signal.label}</h3>
                <p>{signal.context}</p>
                <dl className="career-evidence-list">
                  <div>
                    <dt>{copy.metricSource}</dt>
                    <dd>{signal.source}</dd>
                  </div>
                  <div>
                    <dt>{copy.metricBoundary}</dt>
                    <dd>{signal.limitation}</dd>
                  </div>
                </dl>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="career-cases" id="cases" aria-labelledby="career-cases-title">
          <Reveal className="section-heading career-section-heading">
            <p className="section-eyebrow">{copy.casesEyebrow}</p>
            <h2 id="career-cases-title">{copy.casesTitle}</h2>
            <p>{copy.casesBody}</p>
            <p className="career-proof-notice">{career.proofNotice}</p>
          </Reveal>

          <div className="career-case-list">
            {careerCases.map((careerCase, index) => {
              const caseCopy = careerCase.copy[locale];
              const media = careerCase.media;
              const isNevada = careerCase.id === "nevada-korea-marketing-lead";

              return (
                <article className="career-case" id={careerCase.id} key={careerCase.id}>
                  <Reveal className="career-case-header">
                    <span className="career-case-index" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div className="career-case-kicker">
                        <span>{careerCase.period}</span>
                        {isNevada ? <span className="career-gtm-tag">KR GTM</span> : null}
                      </div>
                      <h3>{caseCopy.title}</h3>
                      <p>{caseCopy.context}</p>
                    </div>
                  </Reveal>

                  <div className="career-case-grid">
                    <Reveal className="career-case-visual">
                      <figure>
                        <Image
                          src={media.src}
                          alt={media.alt[locale]}
                          width={1280}
                          height={720}
                          sizes="(max-width: 900px) 100vw, 46vw"
                        />
                        <figcaption>
                          <span className="media-role-tag">
                            {media.role === "proof" ? copy.proofSurface : copy.careerContext}
                          </span>
                          <dl className="career-media-evidence">
                            <div>
                              <dt>{copy.source}</dt>
                              <dd>{media.source[locale]}</dd>
                            </div>
                            <div>
                              <dt>{copy.captured}</dt>
                              <dd>{media.capturedAt === "undated" ? copy.capturedUndated : media.capturedAt}</dd>
                            </div>
                            <div>
                              <dt>{copy.mediaClaim}</dt>
                              <dd>{media.claim[locale]}</dd>
                            </div>
                            <div>
                              <dt>{copy.mediaBoundary}</dt>
                              <dd>{media.limitation[locale]}</dd>
                            </div>
                          </dl>
                        </figcaption>
                      </figure>

                      {careerCase.metrics.length > 0 ? (
                        <div className="career-case-metrics" aria-label={`${caseCopy.title} metrics`}>
                          {careerCase.metrics.map((metric) => {
                            const metricCopy = metric.copy[locale];

                            return (
                              <div className="career-case-metric" key={`${careerCase.id}-${metric.value}`}>
                                <div>
                                  <strong>{metric.value}</strong>
                                  <span className={`provenance-tag is-${metric.provenance}`}>
                                    {provenance[metric.provenance]}
                                  </span>
                                </div>
                                <h4>{metricCopy.label}</h4>
                                <p>{metricCopy.context}</p>
                                <dl>
                                  <div>
                                    <dt>{copy.metricSource}</dt>
                                    <dd>{metricCopy.source}</dd>
                                  </div>
                                  <div>
                                    <dt>{copy.metricBoundary}</dt>
                                    <dd>{metricCopy.limitation}</dd>
                                  </div>
                                </dl>
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </Reveal>

                    <Reveal className="career-case-narrative" delay={0.05}>
                      <dl className="career-case-details">
                        <div>
                          <dt>{copy.objective}</dt>
                          <dd>{caseCopy.objective}</dd>
                        </div>
                        <div>
                          <dt>{copy.roleLabel}</dt>
                          <dd>{caseCopy.role}</dd>
                        </div>
                        <div>
                          <dt>{copy.system}</dt>
                          <dd>{caseCopy.system}</dd>
                        </div>
                        <div>
                          <dt>{copy.result}</dt>
                          <dd>{caseCopy.result}</dd>
                        </div>
                        <div>
                          <dt>{copy.constraint}</dt>
                          <dd>{caseCopy.constraint}</dd>
                        </div>
                        <div>
                          <dt>{copy.proof}</dt>
                          <dd>{caseCopy.proof}</dd>
                        </div>
                        <div className="career-case-limitation">
                          <dt>{copy.limitation}</dt>
                          <dd>{caseCopy.limitation}</dd>
                        </div>
                      </dl>

                      <div className="career-channel-list" aria-label={copy.channels}>
                        <span>{copy.channels}</span>
                        <ul>
                          {caseCopy.channels.map((channel) => (
                            <li key={channel}>{channel}</li>
                          ))}
                        </ul>
                      </div>
                    </Reveal>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="career-contact" id="contact" aria-labelledby="career-contact-title">
          <Reveal className="career-contact-heading">
            <p className="section-eyebrow">{copy.contactEyebrow}</p>
            <h2 id="career-contact-title">{copy.contactTitle}</h2>
            <p>{copy.contactBody}</p>
          </Reveal>

          <address className="career-contact-list">
            {contactLinks.map((contact) => {
              const isExternal = contact.href.startsWith("http");

              return (
                <a
                  href={contact.href}
                  key={contact.label}
                  {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <span>{contact.label}</span>
                  <strong>{contact.handle}</strong>
                </a>
              );
            })}
          </address>
        </section>
      </main>

      <SiteFooter locale={locale} note={content.footer.tagline} />
    </div>
  );
}
