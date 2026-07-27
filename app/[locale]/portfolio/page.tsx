import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { PixelEffects } from "@/components/pixel/PixelEffects";
import { StructuredData } from "@/components/seo/StructuredData";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { careerCases, isLocale, locales } from "@/lib/content";
import { absoluteCanonicalUrl, metadataAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

const workHistory = [
  { period: "2026.08-Now", company: "FIVE OVER TWO", role: "Co-Founder", focus: "VENTURE / GROWTH SYSTEMS" },
  { period: "2026.04-2026.06", company: "1six.tech Inc. / NEVADA", role: "Marketing Lead", focus: "SEO / KOL / LOCALIZATION" },
  { period: "2025.01-2025.09", company: "071Labs", role: "Community & GTM", focus: "CONTENT / COMMUNITY OPS" },
  { period: "2018.06-2024.11", company: "MKR", role: "Founder", focus: "AGENCY / CAMPAIGN SYSTEMS" },
  { period: "2012-2016", company: "Makorang Lab", role: "Founder", focus: "CSR / PLATFORM / PARTNERSHIPS" }
] as const;

const careerChapters = {
  ko: [
    { index: "01", period: "2012-2016", phase: "PLATFORM", title: "사회적 가치에서 시작했어요.", body: "기업, 비영리단체, 소비자를 참여형 캠페인으로 연결하는 CSR 디지털 플랫폼을 만들고 운영했어요.", signal: "CSR / 플랫폼 / 파트너십" },
    { index: "02", period: "2018-2024", phase: "AGENCY", title: "실행을 확장하는 법을 배웠어요.", body: "마케팅 에이전시 MKR을 설립하고 200건 이상의 공공·상업 프로젝트와 3,000명 이상의 크리에이터 네트워크를 운영했어요.", signal: "200+ 프로젝트 / 3,000+ 네트워크" },
    { index: "03", period: "2025", phase: "COMMUNITY", title: "관심을 관계로 전환했어요.", body: "글로벌 Web3 프로젝트와 한국 사용자를 연결하며 활성 커뮤니티를 약 200명에서 3,000명 이상으로 성장시켰어요.", signal: "활성 커뮤니티 15배 성장" },
    { index: "04", period: "2025-2026", phase: "PRODUCT OPS", title: "캠페인에서 제품으로 이동했어요.", body: "웹, 앱, 게임, Web3 제품의 QA, 비공개 베타, SEO, KOL 파이프라인, 대시보드와 시장 진입을 함께 운영했어요.", signal: "QA / BETA / GTM / ANALYTICS" },
    { index: "05", period: "2026-NOW", phase: "VENTURE", title: "운영 방식을 제품으로 만들고 있어요.", body: "한국 진출과 Growth Ops 서비스를 설계하고, 반복 가능한 컨설팅 워크플로를 SaaS와 MVP로 전환하고 있어요.", signal: "SERVICES -> SYSTEMS -> PRODUCTS" }
  ],
  en: [
    { index: "01", period: "2012-2016", phase: "PLATFORM", title: "Started with social value.", body: "Built and operated a CSR platform connecting companies, nonprofits, and consumers through participation-led campaigns.", signal: "CSR / PLATFORM / PARTNERSHIPS" },
    { index: "02", period: "2018-2024", phase: "AGENCY", title: "Learned to scale execution.", body: "Founded MKR, led more than 200 public and commercial projects, and operated a network of over 3,000 creators.", signal: "200+ PROJECTS / 3,000+ NETWORK" },
    { index: "03", period: "2025", phase: "COMMUNITY", title: "Turned attention into belonging.", body: "Connected global Web3 projects with Korean users and grew an active community from roughly 200 to more than 3,000.", signal: "15X ACTIVE COMMUNITY GROWTH" },
    { index: "04", period: "2025-2026", phase: "PRODUCT OPS", title: "Moved from campaigns into products.", body: "Operated QA, private betas, SEO, KOL pipelines, dashboards, and market entry across web, app, game, and Web3 products.", signal: "QA / BETA / GTM / ANALYTICS" },
    { index: "05", period: "2026-NOW", phase: "VENTURE", title: "Productizing the operating system.", body: "Designing Korea launch and Growth Ops services while turning repeatable consulting workflows into SaaS and MVP products.", signal: "SERVICES -> SYSTEMS -> PRODUCTS" }
  ]
} as const;

const signals = {
  ko: [
    { value: "14 yrs", label: "2012년부터 이어진 운영 경력" },
    { value: "200+", label: "공공·상업 프로젝트" },
    { value: "3,000+", label: "크리에이터 네트워크" },
    { value: "15x", label: "활성 커뮤니티 성장" }
  ],
  en: [
    { value: "14 yrs", label: "Operating since 2012" },
    { value: "200+", label: "Public and commercial projects" },
    { value: "3,000+", label: "Creator network" },
    { value: "15x", label: "Active community growth" }
  ]
} as const;

const labels = {
  ko: { objective: "목표", role: "담당", result: "결과", channels: "채널" },
  en: { objective: "OBJECTIVE", role: "OWNERSHIP", result: "OUTCOME", channels: "CHANNELS" }
} as const;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: value } = await params;
  if (!isLocale(value)) return {};
  const korean = value === "ko";
  return {
    title: korean ? "경력" : "Career",
    description: korean
      ? "탁찬우/Nimdal의 2012년부터 현재까지 이어진 창업, 마케팅 운영, 커뮤니티 GTM, 제품 운영 경력입니다."
      : "Tak Chanwoo / Nimdal's evidence-backed career across venture building, marketing operations, community GTM, and product operations.",
    alternates: metadataAlternates(value, "/portfolio"),
    openGraph: { url: absoluteCanonicalUrl(value, "/portfolio"), images: [{ url: "/media/operator-portrait.png", width: 640, height: 853 }] }
  };
}

export default async function CareerPage({ params }: Props) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const locale = value;
  const korean = locale === "ko";
  const chapters = careerChapters[locale];
  const copy = labels[locale];
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absoluteCanonicalUrl(locale, "/portfolio"),
    mainEntity: { "@type": "Person", name: korean ? "탁찬우" : "Tak Chanwoo", alternateName: "Nimdal", jobTitle: "Founder / Growth Operator / Product Builder" }
  };

  return (
    <div className="pixel-surface pixel-page">
      <PixelEffects />
      <StructuredData data={schema} />
      <SiteHeader locale={locale} active="career" />
      <main id="main-content">
        <section className="pixel-page-hero pixel-career-hero">
          <div className="pixel-wrap">
            <div className="pixel-career-hero-layout">
              <div>
                <p className="pixel-kicker">FOUNDER / OPERATOR / PRODUCT BUILDER</p>
                <h1>{korean ? "성장을 만드는 시스템을 설계해요." : "I build the system behind the growth."}</h1>
                <p className="pixel-lead">
                  {korean
                    ? "캠페인만 운영하지 않았어요. 플랫폼을 시작하고, 에이전시를 키우고, 커뮤니티와 제품을 움직이며 반복 가능한 운영 방식으로 만들었어요."
                    : "I have built platforms, scaled an agency, moved communities, and operated products — turning each lesson into a repeatable way of working."}
                </p>
                <div className="pixel-career-tags" aria-label={korean ? "핵심 역량" : "Core disciplines"}>
                  <span>VENTURE BUILDING</span><span>GROWTH SYSTEMS</span><span>KOREA GTM</span><span>PRODUCT OPS</span>
                </div>
              </div>
              <div className="pixel-career-portrait" data-pixel-reveal>
                <div className="pixel-career-photo"><Image src="/media/operator-portrait.png" alt={korean ? "탁찬우 프로필 사진" : "Portrait of Tak Chanwoo"} fill priority sizes="(max-width: 680px) 70vw, 300px" /></div>
                <Image className="pixel-career-mark" src="/media/identity-octopus.jpg" alt="Nimdal" width={74} height={74} />
                <span>TAK CHANWOO<br />AKA NIMDAL</span>
              </div>
            </div>
            <div className="pixel-career-stats">
              {signals[locale].map((signal) => <span key={signal.value}><strong>{signal.value}</strong><small>{signal.label}</small></span>)}
            </div>
          </div>
        </section>

        <section className="pixel-section pixel-career-arc">
          <div className="pixel-wrap">
            <div className="pixel-section-title" data-pixel-reveal><span>CAREER ARC</span><h2>{korean ? "하나의 경력, 다섯 개의 운영 시스템" : "One career. Five operating systems."}</h2></div>
            <p className="pixel-career-thesis" data-pixel-reveal>
              {korean
                ? "산업은 달라졌지만 일의 핵심은 누적됐어요. 사람을 연결하고, 운영 모델을 명확히 하고, 피드백 루프를 만든 뒤, 검증된 방식을 반복 가능한 시스템으로 바꾸는 일이에요."
                : "The industries changed, but the work kept compounding: connect people, clarify the operating model, build the feedback loop, and turn what works into a repeatable system."}
            </p>
            <div className="pixel-career-arc-grid">
              {chapters.map((chapter, index) => (
                <article key={chapter.index} className={index === chapters.length - 1 ? "is-current" : undefined} data-pixel-reveal>
                  <header><span>{chapter.index}</span><time>{chapter.period}</time><i>{chapter.phase}</i></header>
                  <h3>{chapter.title}</h3><p>{chapter.body}</p><strong>{chapter.signal}</strong>
                </article>
              ))}
            </div>
            <div className="pixel-evidence-index" data-pixel-reveal>
              <span>EVIDENCE INDEX / 2026</span>
              <strong>152</strong><p>{korean ? "프로젝트 매핑" : "projects mapped"}</p>
              <strong>117</strong><p>{korean ? "직접 실행 기록 확인" : "backed by direct execution records"}</p>
            </div>
          </div>
        </section>

        <section className="pixel-career-band">
          <div className="pixel-wrap">
            <div className="pixel-section-title is-dark" data-pixel-reveal><span>POSITIONS</span><h2>{korean ? "역할의 변화" : "Roles along the way"}</h2></div>
            <div className="pixel-career-list" data-pixel-reveal>{workHistory.map((entry) => <div key={entry.company}><time>{entry.period}</time><strong>{entry.company}</strong><span>{entry.role} · {entry.focus}</span></div>)}</div>
          </div>
        </section>

        <section className="pixel-section pixel-career-cases">
          <div className="pixel-wrap">
            <div className="pixel-section-title" data-pixel-reveal><span>SELECTED CASES</span><h2>{korean ? "운영 방식이 드러나는 대표 사례" : "Selected systems in operation"}</h2></div>
            <div className="pixel-case-grid">
              {careerCases.map((item, index) => {
                const itemCopy = item.copy[locale];
                return (
                  <article data-pixel-reveal className="pixel-case is-expanded" key={item.id}>
                    <div className="pixel-case-media"><Image src={item.media.src} alt={item.media.alt[locale]} fill sizes="(max-width: 680px) calc(100vw - 48px), 44vw" /></div>
                    <div className="pixel-case-body">
                      <p>{String(index + 1).padStart(2, "0")} — {item.period}</p><h2>{itemCopy.title}</h2><span>{itemCopy.context}</span>
                      <dl>
                        <div><dt>{copy.objective}</dt><dd>{itemCopy.objective}</dd></div>
                        <div><dt>{copy.role}</dt><dd>{itemCopy.role}</dd></div>
                        <div className="is-outcome"><dt>{copy.result}</dt><dd>{itemCopy.result}</dd></div>
                      </dl>
                      <div className="pixel-case-channels"><b>{copy.channels}</b><ul>{itemCopy.channels.map((channel) => <li key={channel}>{channel}</li>)}</ul></div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="pixel-contact pixel-contact-small"><div className="pixel-wrap"><div className="pixel-inline-contact" data-pixel-reveal><span><i>CONTACT / PDF</i><strong>{korean ? "함께 만들 일을 이야기해요." : "Let us talk about what needs building."}</strong><a className="pixel-career-email" href="mailto:0xnimdal@gmail.com">0xnimdal@gmail.com</a></span><a data-mag className="pixel-button is-pink" href="/media/career/tak-chanwoo-nimdal-portfolio-v2.pdf" download>{korean ? "PDF 다운로드" : "DOWNLOAD PDF"}</a></div></div></section>
      </main>
      <SiteFooter locale={locale} note="MADE BY A MARKETER, SHIPPED LIKE A DEV" />
    </div>
  );
}
