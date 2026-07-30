import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { InkAuthor } from "@/components/ink/InkAuthor";
import { InkBloom } from "@/components/ink/InkBloom";
import { InkSeal } from "@/components/ink/InkSeal";
import { InkStroke } from "@/components/ink/InkStroke";
import { SealCTA } from "@/components/ink/SealCTA";
import { LegacyHashBridge } from "@/components/compat/LegacyHashBridge";
import { StructuredData } from "@/components/seo/StructuredData";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { buildAtlas, buildCases } from "@/lib/atlas/world";
import { isLocale, siteContent } from "@/lib/content";
import { absoluteCanonicalUrl, metadataAlternates, openGraphLocaleByLocale } from "@/lib/seo";

/**
 * The Ink Records.
 *
 * The home is a scroll being written. Every word is server-rendered DOM text;
 * the strokes are calligraphy drawn around the content, scrubbed by the
 * visitor's own scrolling. See INK_RECORDS_PLAN.md for the contract.
 */

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

function pageLocale(value: string) {
  if (!isLocale(value)) notFound();
  return value;
}

/* Hand-authored brush paths. Confident curves; the roughen filter does the ink. */
const SWASH = "M30 170 C 240 60, 520 250, 780 130 S 1130 90, 1170 150";
const UNDERLINE = "M8 26 C 90 10, 210 34, 300 18";
const FRAME = "M10 12 C 140 6, 300 10, 392 8 L 394 120 C 396 190, 392 230, 390 246 L 8 250 C 6 180, 8 90, 10 12 Z";

const RECORD = {
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

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const locale = pageLocale((await params).locale);
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
      images: [{
        url: "/media/og-dive.png",
        width: 1200,
        height: 630,
        alt: locale === "ko" ? "님달의 기록: 잉크로 쓰인 포트폴리오" : "The Ink Records of Nimdal"
      }]
    },
    twitter: {
      card: "summary_large_image",
      title: content.seo.title,
      description: content.seo.description,
      images: ["/media/og-dive.png"]
    }
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const locale = pageLocale((await params).locale);
  const korean = locale === "ko";
  const content = siteContent[locale];
  const works = buildAtlas(locale);
  const cases = buildCases(locale);
  const caseLabels = korean
    ? { objective: "목표", role: "담당", result: "결과", channels: "채널" }
    : { objective: "Objective", role: "Ownership", result: "Outcome", channels: "Channels" };

  const records = [
    {
      numeral: "二",
      id: "agency",
      mark: korean ? "기록 二 · 에이전시" : "Record II · The agency years",
      title: korean ? "에이전시를 세우고 키웠습니다" : "Built and ran an agency",
      body: korean
        ? "MKR을 설립해 200건이 넘는 공공·상업 프로젝트와 3,000명 규모의 크리에이터 네트워크를 운영했습니다."
        : "Founded MKR, led more than two hundred public and commercial projects, and ran a creator network three thousand strong.",
      caseRoom: cases["mkr-agency-operating-system"]
    },
    {
      numeral: "三",
      id: "brands",
      mark: korean ? "기록 三 · 브랜드" : "Record III · The brand work",
      title: korean ? "브랜드의 성장을 맡았습니다" : "Grew other people's brands",
      body: korean
        ? "라이카부터 스위스 기능성 신발, 동물병원까지. 채널과 예산이 달라도 판단은 늘 숫자와 현장에서 나왔습니다."
        : "Leica, Swiss functional footwear, an animal hospital. Channels and budgets changed; the decisions always came from numbers and the field.",
      caseRoom: cases["leica-online-acquisition"]
    },
    {
      numeral: "四",
      id: "web3",
      mark: korean ? "기록 四 · 전환" : "Record IV · The crossing",
      title: korean ? "한국 시장의 다리가 되었습니다" : "Became the bridge into Korea",
      body: korean
        ? "글로벌 프로젝트의 한국 GTM을 이끌며 활성 커뮤니티를 15배로 키웠고, NEVADA의 마케팅 리드를 맡았습니다."
        : "Led Korean GTM for global projects, grew an active community fifteenfold, and ran marketing for NEVADA.",
      caseRoom: cases["nevada-korea-marketing-lead"]
    }
  ];

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
    <div className="page ink-doc">
      <LegacyHashBridge locale={locale} />
      <StructuredData data={schema} />
      <SiteHeader locale={locale} active="home" />

      <main id="main-content">
        {/* 표지: the first mark on the paper is the arrival. */}
        <section className="chapter cover-ink" id="top" aria-labelledby="home-title">
          <div className="wrap split split-flip">
            <div>
              <p className="press-mark">TAK CHANWOO / NIMDAL</p>
              <h1 id="home-title">
                {korean ? <>님달의 기록</> : <>The Records<br />of Nimdal</>}
              </h1>
              <InkStroke
                className="ink-swash"
                d={SWASH}
                viewBox="0 0 1200 260"
                strokeWidth={22}
                mode="load"
                duration={1.4}
                delay={0.2}
              />
              <p className="lede">
                {korean
                  ? "2012년부터 캠페인을 운영했고, 지금은 리서치 도구와 자동화 제품을 직접 만듭니다. 문어가 잉크로 남긴 14년의 기록을 아래로 풀어 보세요."
                  : "Running campaigns since 2012, now building research tools and automation. Fourteen years of records, written in ink. Unroll them below."}
              </p>
              <div className="actions">
                <a className="btn btn-flo" href="#records">{korean ? "기록 읽기" : "Read the records"}</a>
                <Link className="btn" href={`/${locale}/about`}>{korean ? "소개" : "About"}</Link>
              </div>
            </div>
            <figure className="ink-portrait">
              <InkStroke
                className="ink-frame"
                d={FRAME}
                viewBox="0 0 400 258"
                strokeWidth={7}
                preserve="none"
                mode="load"
                duration={1.2}
                delay={0.5}
              />
              <Image
                src="/media/operator-portrait.png"
                alt={content.home.identity.portraitAlt}
                width={640}
                height={853}
                priority
                sizes="(max-width: 767px) 100vw, 30vw"
              />
              <figcaption>{korean ? "탁찬우 / 서울" : "Tak Chanwoo / Seoul"}</figcaption>
            </figure>
          </div>
        </section>

        {/* The sea lives inside the ink: the first bloom opens the records. */}
        <InkBloom height={220} />

        {/* 기록 一 · 장부 */}
        <section className="chapter band" id="records" aria-labelledby="ledger-title">
          <div className="wrap">
            <div className="head">
              <p className="press-mark">{korean ? "기록 一 · 장부" : "Record I · The ledger"}</p>
              <h2 id="ledger-title">{korean ? "숫자가 먼저 도착합니다" : "The numbers arrive first"}</h2>
              <InkStroke className="ink-underline" d={UNDERLINE} viewBox="0 0 310 44" strokeWidth={9} />
            </div>
            <div className="record">
              {RECORD[locale].map((item) => (
                <div key={item.value}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 기록 二·三·四 */}
        {records.map((record) => (
          <section className="chapter band" id={record.id} key={record.id} aria-labelledby={`${record.id}-title`}>
            <div className="wrap">
              <div className="head">
                <p className="press-mark">{record.mark}</p>
                <h2 id={`${record.id}-title`}>{record.title}</h2>
                <InkStroke className="ink-underline" d={UNDERLINE} viewBox="0 0 310 44" strokeWidth={9} />
              </div>
              <p className="lede">{record.body}</p>
              {record.caseRoom ? (
                <div className="case-sheet" style={{ marginTop: "clamp(2rem, 4vw, 3rem)" }}>
                  <div className="case-side">
                    {record.caseRoom.media[0] ? (
                      <span className="case-logo">
                        <Image
                          src={record.caseRoom.media[0].src}
                          alt={record.caseRoom.media[0].alt}
                          width={280}
                          height={160}
                        />
                      </span>
                    ) : null}
                    <div className="seal-line">
                      <InkSeal>{record.numeral}</InkSeal>
                      <p>{record.caseRoom.period}</p>
                    </div>
                  </div>
                  <div className="case">
                    <div>
                      <h3 style={{ margin: 0, fontSize: "clamp(1.3rem, 2.2vw, 1.7rem)" }}>
                        {record.caseRoom.title}
                      </h3>
                      <dl>
                        <div><dt>{caseLabels.objective}</dt><dd>{record.caseRoom.objective}</dd></div>
                        <div><dt>{caseLabels.role}</dt><dd>{record.caseRoom.role}</dd></div>
                        <div className="is-outcome"><dt>{caseLabels.result}</dt><dd>{record.caseRoom.result}</dd></div>
                        <div><dt>{caseLabels.channels}</dt><dd>{record.caseRoom.channels.join(" · ")}</dd></div>
                      </dl>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        ))}

        {/* 작품 三点 */}
        <section className="chapter band" id="work" aria-labelledby="work-title">
          <div className="wrap">
            <div className="head">
              <p className="press-mark">{korean ? "작품 三点" : "Three works"}</p>
              <h2 id="work-title">{korean ? "직접 만든 것들" : "Things I built"}</h2>
              <InkStroke className="ink-underline" d={UNDERLINE} viewBox="0 0 310 44" strokeWidth={9} />
            </div>
            <div className="lab-grid">
              {works.map((work) => (
                <article className="lab-item" key={work.slug}>
                  <Link className="ink-photo" href={work.href} aria-label={work.title}>
                    <InkStroke
                      className="ink-frame"
                      d={FRAME}
                      viewBox="0 0 400 258"
                      strokeWidth={9}
                      preserve="none"
                    />
                    <Image
                      src={work.image}
                      alt={work.imageAlt}
                      width={800}
                      height={500}
                      sizes="(max-width: 767px) 100vw, 30vw"
                    />
                  </Link>
                  <div>
                    <p className="work-meta">
                      <i>{work.category}</i>
                      <span className={work.status === "live" ? "is-live" : undefined}>
                        {work.status === "live" ? "Live" : "Prototype"}
                      </span>
                    </p>
                    <h3><Link href={work.href}>{work.title}</Link></h3>
                    <p>{work.summary}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* The second bloom closes the works and carries the reader down. */}
        <InkBloom height={200} />

        {/* 서명 */}
        <section className="chapter band band-ink contact" id="contact" aria-labelledby="contact-title">
          <div className="wrap">
            <h2 id="contact-title">
              {korean ? "재미있는 문제를 찾고 있습니다." : "Looking for interesting problems."}
            </h2>
            <p className="lede">
              {korean
                ? "제품, 시장, 지금 막힌 지점을 보내주세요."
                : "Send the product, the market, and the point where it is stuck."}
            </p>
            <a className="contact-mail" href="mailto:0xnimdal@gmail.com">0xnimdal@gmail.com</a>
            <div className="seal-line">
              <InkSeal>님달</InkSeal>
              <p>{korean ? "서명 · 2026" : "Signed · 2026"}</p>
            </div>
            <SealCTA
              holdLabel={korean ? "꾹 눌러 방문 도장 찍기" : "Press and hold to leave your seal"}
              doneLabel={korean ? "다녀가셨습니다" : "You were here"}
            />
            <nav className="contact-links" aria-label={korean ? "외부 채널" : "Elsewhere"}>
              <a href="https://x.com/0xnimdal" target="_blank" rel="noreferrer">X</a>
              <a href="https://t.me/nimdal" target="_blank" rel="noreferrer">Telegram</a>
              <a href="https://linkedin.com/in/chanwoo-tak-132b281a4" target="_blank" rel="noreferrer">LinkedIn</a>
            </nav>
          </div>
        </section>
      </main>

      <InkAuthor
        label={korean ? "저자 문어. 누르면 잉크를 뿌립니다" : "The author octopus. Press to spray ink"}
        soundOnLabel={korean ? "소리: 켜짐" : "SOUND: ON"}
        soundOffLabel={korean ? "소리: 꺼짐" : "SOUND: OFF"}
      />
      <SiteFooter locale={locale} note={korean ? "문어가 잉크로 남긴 기록" : "Records left in octopus ink"} />
    </div>
  );
}
