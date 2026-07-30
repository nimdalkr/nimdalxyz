import type { Metadata } from "next";
import { InkStroke } from "@/components/ink/InkStroke";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/riso/Reveal";
import { RisoPlate } from "@/components/riso/RisoPlate";
import { StructuredData } from "@/components/seo/StructuredData";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { careerCases, isLocale, locales } from "@/lib/content";
import { absoluteCanonicalUrl, metadataAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

const workHistory = [
  { period: "2026.08-NOW", company: "FIVE OVER TWO", role: "Co-Founder", focus: "Venture / growth systems" },
  { period: "2026.04-2026.06", company: "1six.tech / NEVADA", role: "Marketing Lead", focus: "SEO / KOL / localization" },
  { period: "2025.01-2025.09", company: "071Labs", role: "Community and GTM", focus: "Content / community ops" },
  { period: "2018.06-2024.11", company: "MKR", role: "Founder", focus: "Agency / campaign systems" },
  { period: "2012-2016", company: "Makorang Lab", role: "Founder", focus: "CSR / platform / partnerships" }
] as const;

const careerChapters = {
  ko: [
    { period: "2012-2016", title: "사회적 가치에서 시작했어요.", body: "기업, 비영리단체, 소비자를 참여형 캠페인으로 연결하는 CSR 디지털 플랫폼을 만들고 운영했어요.", signal: "CSR / 플랫폼 / 파트너십" },
    { period: "2018-2024", title: "실행을 확장하는 법을 배웠어요.", body: "마케팅 에이전시 MKR을 설립하고 200건 이상의 공공, 상업 프로젝트와 3,000명 이상의 크리에이터 네트워크를 운영했어요.", signal: "200+ 프로젝트 / 3,000+ 네트워크" },
    { period: "2025", title: "관심을 관계로 전환했어요.", body: "글로벌 Web3 프로젝트와 한국 사용자를 연결하며 활성 커뮤니티를 약 200명에서 3,000명 이상으로 성장시켰어요.", signal: "활성 커뮤니티 15배 성장" },
    { period: "2025-2026", title: "캠페인에서 제품으로 이동했어요.", body: "웹, 앱, 게임, Web3 제품의 QA, 비공개 베타, SEO, KOL 파이프라인, 대시보드와 시장 진입을 함께 운영했어요.", signal: "QA / 베타 / GTM / 애널리틱스" },
    { period: "2026-NOW", title: "운영 방식을 제품으로 만들고 있어요.", body: "한국 진출과 Growth Ops 서비스를 설계하고, 반복 가능한 컨설팅 워크플로를 SaaS와 MVP로 전환하고 있어요.", signal: "서비스에서 시스템, 그리고 제품으로" }
  ],
  en: [
    { period: "2012-2016", title: "Started with social value.", body: "Built and operated a CSR platform connecting companies, nonprofits, and consumers through participation-led campaigns.", signal: "CSR / platform / partnerships" },
    { period: "2018-2024", title: "Learned to scale execution.", body: "Founded MKR, led more than 200 public and commercial projects, and operated a network of over 3,000 creators.", signal: "200+ projects / 3,000+ network" },
    { period: "2025", title: "Turned attention into belonging.", body: "Connected global Web3 projects with Korean users and grew an active community from roughly 200 to more than 3,000.", signal: "15x active community growth" },
    { period: "2025-2026", title: "Moved from campaigns into products.", body: "Operated QA, private betas, SEO, KOL pipelines, dashboards, and market entry across web, app, game, and Web3 products.", signal: "QA / beta / GTM / analytics" },
    { period: "2026-NOW", title: "Productizing the operating system.", body: "Designing Korea launch and Growth Ops services while turning repeatable consulting workflows into SaaS and MVP products.", signal: "Services into systems into products" }
  ]
} as const;

const signals = {
  ko: [
    { value: "14 yrs", label: "2012년부터 이어진 운영" },
    { value: "200+", label: "공공 및 상업 프로젝트" },
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
  en: { objective: "Objective", role: "Ownership", result: "Outcome", channels: "Channels" }
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
      ? "탁찬우 / Nimdal의 2012년부터 현재까지 이어진 창업, 마케팅 운영, 커뮤니티 GTM, 제품 운영 경력입니다."
      : "Tak Chanwoo / Nimdal's evidence-backed career across venture building, marketing operations, community GTM, and product operations.",
    alternates: metadataAlternates(value, "/portfolio"),
    openGraph: {
      url: absoluteCanonicalUrl(value, "/portfolio"),
      images: [{ url: "/media/operator-portrait.png", width: 640, height: 853 }]
    }
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
    mainEntity: {
      "@type": "Person",
      name: korean ? "탁찬우" : "Tak Chanwoo",
      alternateName: "Nimdal",
      jobTitle: "Founder / Growth Operator / Product Builder"
    }
  };

  return (
    <div className="page">
      <StructuredData data={schema} />
      <SiteHeader locale={locale} active="career" />
      <main id="main-content">
        {/* 1. Split hero with the portrait plate. */}
        <section className="page-head" aria-labelledby="career-title">
          <div className="wrap split-flip">
            <div>
              <h1 id="career-title">
                {korean ? "성장을 만드는 시스템을 설계해요." : "I build the system behind the growth."}
              </h1>
              <InkStroke className="ink-underline" d="M8 26 C 90 10, 210 34, 300 18" viewBox="0 0 310 44" strokeWidth={9} />
              <p className="lede">
                {korean
                  ? "캠페인만 운영하지 않았어요. 플랫폼을 시작하고, 에이전시를 키우고, 커뮤니티와 제품을 움직이며 반복 가능한 운영 방식으로 만들었어요."
                  : "I have built platforms, scaled an agency, moved communities, and operated products, turning each lesson into a repeatable way of working."}
              </p>
              <ul className="chip-row">
                <li>{korean ? "벤처 빌딩" : "Venture building"}</li>
                <li>{korean ? "그로스 시스템" : "Growth systems"}</li>
                <li>Korea GTM</li>
                <li>Product ops</li>
              </ul>
            </div>
            <RisoPlate
              className="portrait-plate"
              src="/media/operator-portrait.png"
              alt={korean ? "탁찬우 프로필 사진" : "Portrait of Tak Chanwoo"}
              priority
              offset={18}
              sizes="(max-width: 767px) 100vw, 32vw"
            />
          </div>
        </section>

        {/* 2. Record: the numbers on a second stock tint. */}
        <section className="band-alt band-tight" aria-label={korean ? "운영 기록" : "Operating record"}>
          <div className="wrap">
            <div className="record">
              {signals[locale].map((signal) => (
                <div key={signal.value}>
                  <strong>{signal.value}</strong>
                  <span>{signal.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Arc: five chapters, the current one inked. */}
        <section className="band" aria-labelledby="arc-title">
          <div className="wrap">
            <div className="head">
              <p className="press-mark">{korean ? "경력의 흐름" : "Career arc"}</p>
              <h2 id="arc-title">
                {korean ? "하나의 경력, 다섯 개의 운영 시스템" : "One career. Five operating systems."}
              </h2>
            </div>
            <p className="lede" style={{ marginBottom: "clamp(2rem, 4vw, 3rem)" }}>
              {korean
                ? "산업은 달라졌지만 일의 핵심은 누적됐어요. 사람을 연결하고, 운영 모델을 명확히 하고, 피드백 루프를 만든 뒤, 검증된 방식을 반복 가능한 시스템으로 바꾸는 일이에요."
                : "The industries changed, but the work kept compounding: connect people, clarify the operating model, build the feedback loop, and turn what works into a repeatable system."}
            </p>
            <div className="arc">
              {chapters.map((chapter, index) => (
                <Reveal
                  key={chapter.period}
                  as="article"
                  index={index}
                  className={index === chapters.length - 1 ? "is-current" : undefined}
                >
                  <time>{chapter.period}</time>
                  <div>
                    <h3>{chapter.title}</h3>
                    <p>{chapter.body}</p>
                  </div>
                  <p className="arc-signal">{chapter.signal}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Positions: ledger rows, flooded in ink. */}
        <section className="band band-ink" aria-labelledby="positions-title">
          <div className="wrap">
            <div className="head">
              <h2 id="positions-title">{korean ? "역할의 변화" : "Roles along the way"}</h2>
            </div>
            <div className="ledger">
              {workHistory.map((entry, index) => (
                <Reveal key={entry.company} className="ledger-row" index={index}>
                  <time>{entry.period}</time>
                  <strong>{entry.company}</strong>
                  <span>{entry.role} · {entry.focus}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Cases: alternating plate and evidence table. */}
        <section className="band" aria-labelledby="cases-title">
          <div className="wrap">
            <div className="head">
              <p className="press-mark">{korean ? "대표 사례" : "Selected cases"}</p>
              <h2 id="cases-title">
                {korean ? "운영 방식이 드러나는 사례" : "Selected systems in operation"}
              </h2>
            </div>
            <div className="cases">
              {careerCases.map((item, index) => {
                const itemCopy = item.copy[locale];
                return (
                  <Reveal key={item.id} as="article" className="case" index={index}>
                    <RisoPlate
                      className="case-plate"
                      src={item.media.src}
                      alt={item.media.alt[locale]}
                      sizes="(max-width: 767px) 100vw, 40vw"
                    />
                    <div>
                      <time>{item.period}</time>
                      <h3>{itemCopy.title}</h3>
                      <p>{itemCopy.context}</p>
                      <dl>
                        <div><dt>{copy.objective}</dt><dd>{itemCopy.objective}</dd></div>
                        <div><dt>{copy.role}</dt><dd>{itemCopy.role}</dd></div>
                        <div className="is-outcome"><dt>{copy.result}</dt><dd>{itemCopy.result}</dd></div>
                        <div><dt>{copy.channels}</dt><dd>{itemCopy.channels.join(", ")}</dd></div>
                      </dl>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. Contact and PDF. */}
        <section className="band band-tight band-flo contact" aria-labelledby="career-contact-title">
          <div className="wrap">
            <h2 id="career-contact-title">
              {korean ? "함께 만들 일을 이야기해요." : "Let us talk about what needs building."}
            </h2>
            <a className="contact-mail" href="mailto:0xnimdal@gmail.com">0xnimdal@gmail.com</a>
            <div className="actions">
              <a className="btn" href="/media/career/tak-chanwoo-nimdal-portfolio-v2.pdf" download>
                {korean ? "PDF 내려받기" : "Download PDF"}
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} note={korean ? "마케터가 만들고, 개발자처럼 배포합니다" : "Made by a marketer, shipped like a dev"} />
    </div>
  );
}
