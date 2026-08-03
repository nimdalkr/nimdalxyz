import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { InkAuthor } from "@/components/ink/InkAuthor";
import { InkBloom } from "@/components/ink/InkBloom";
import { InkCount } from "@/components/ink/InkCount";
import { InkPad } from "@/components/ink/InkPad";
import { InkRoster } from "@/components/ink/InkRoster";
import { InkSeal } from "@/components/ink/InkSeal";
import { InkStroke } from "@/components/ink/InkStroke";
import { InkTimeline } from "@/components/ink/InkTimeline";
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
    { value: "14 yrs", label: "2012년부터 이어 온 일" },
    { value: "200+", label: "진행한 공공·상업 프로젝트" },
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

/* The eras along the one stroke. Condensed from the verified career record. */
const ERAS = {
  ko: [
    {
      year: "2012",
      org: "Makorang Lab",
      title: "시작은 CSR 플랫폼이었습니다",
      body: "부산경제진흥원 청년창업 지원사업에 선정되어 시작했습니다. 기업의 사회공헌 예산을 소상공인 홍보와 지역 비영리 프로젝트로 잇는 캠페인 구조를 만들었습니다.",
      signal: "청년창업 지원사업 선정"
    },
    {
      year: "2018",
      org: "MKR",
      title: "에이전시를 세워 6년 넘게 운영했습니다",
      body: "공기업과 지자체 지원사업부터 글로벌 브랜드, 의료, F&B, 모빌리티까지 200건 넘는 프로젝트를 집행했고, 3,000명 규모의 크리에이터 네트워크를 운영했습니다.",
      signal: "200+ 프로젝트 · 3,000+ 네트워크"
    },
    {
      year: "2025",
      org: "071Labs",
      title: "Web3에서 커뮤니티를 키웠습니다",
      body: "글로벌 Web3 프로젝트의 한국 커뮤니티를 맡아 활성 인원을 약 200명에서 3,000명 이상으로 키웠고, Korea Blockchain Week 2025 공식 사이드 이벤트를 공동 주최했습니다.",
      signal: "활성 커뮤니티 15배 성장 · KBW 2025"
    },
    {
      year: "2026",
      org: "1six.tech · NEVADA",
      title: "제품의 한국 진출을 맡았습니다",
      body: "마케팅 전략 기준 문서를 직접 세우고, SEO와 KOL 앰버서더 프로그램, 현지화, 대시보드까지 실행 체계를 만들었습니다.",
      signal: "전략 기준 문서 · KOL 앰버서더"
    },
    {
      year: "NOW",
      org: "FIVE OVER TWO",
      title: "지금은 일하는 방식을 제품으로 만들고 있습니다",
      body: "한국 진출을 돕는 GTM 하우스를 공동 창업했습니다. AI로 시장 반응을 분석하는 Korea Market Entry OS를 만들고 있고, 1억 원 규모의 시드 라운드를 유치했습니다.",
      signal: "Korea Market Entry OS · 시드 라운드"
    }
  ],
  en: [
    {
      year: "2012",
      org: "Makorang Lab",
      title: "Started with social value",
      body: "Selected for the Busan Economic Promotion Agency startup program, then built a CSR platform routing corporate giving into small-business promotion and local nonprofit projects.",
      signal: "Selected for a public startup program"
    },
    {
      year: "2018",
      org: "MKR",
      title: "Learned to scale execution",
      body: "Ran more than 200 projects across public programs, global brands, medical, food, and mobility, with a creator network 3,000 strong.",
      signal: "200+ projects · 3,000+ network"
    },
    {
      year: "2025",
      org: "071Labs",
      title: "Turned attention into belonging",
      body: "Grew an active Korean community from roughly 200 to more than 3,000 and co-hosted an official Korea Blockchain Week 2025 side event.",
      signal: "15x community growth and KBW 2025"
    },
    {
      year: "2026",
      org: "1six.tech · NEVADA",
      title: "Moved from campaigns into products",
      body: "Wrote the marketing strategy of record, then built the execution system around it: SEO, a KOL ambassador program, localization, and dashboards.",
      signal: "Strategy of record and a KOL program"
    },
    {
      year: "NOW",
      org: "FIVE OVER TWO",
      title: "Productizing the way of working",
      body: "Co-founded a GTM house for teams entering Korea. Building Korea Market Entry OS, an AI read on market response, and closed a KRW 100M seed round.",
      signal: "Korea Market Entry OS and a seed round"
    }
  ]
} as const;

/* The circled tools. Every entry appears somewhere in the verified record. */
const KIT = {
  ko: [
    "캠페인 운영",
    "Korea GTM",
    "SEO",
    "KOL 파이프라인",
    "커뮤니티 운영",
    "파트너십",
    "리서치 도구",
    "자동화 파이프라인",
    "대시보드",
    "QA · 베타 운영",
    "Next.js 개발",
    "AI 워크플로",
    "공공 지원사업 수행",
    "IR · 파이낸셜 모델"
  ],
  en: [
    "Campaign ops",
    "Korea GTM",
    "SEO",
    "KOL pipelines",
    "Community ops",
    "Partnerships",
    "Research tools",
    "Automation pipelines",
    "Dashboards",
    "QA and beta ops",
    "Building with Next.js",
    "AI workflows",
    "Public programs",
    "IR and financial models"
  ]
} as const;

/* The roster. A selection from the career portfolio, not the whole ledger,
   grouped as the work came: public programs, brands, then the Web3 clients.
   Logos are attached where a file exists; the rest take a letter seal. */
const ROSTER = {
  ko: [
    {
      id: "public",
      label: "공공 · 기관",
      names: [
        { name: "한국정보통신기술협회 TTA", logo: "/media/partners/tta.png" },
        "부산 콘텐츠 코리아랩",
        "부산경제진흥원 청년창업 지원사업",
        { name: "소상공인 라이브커머스 지원사업", logo: "/media/partners/semas.png" },
        { name: "자사몰 신규 구축 지원사업", logo: "/media/partners/semas.png" },
        { name: "MICE · 여행업 디지털 전환 지원사업", logo: "/media/partners/kto.png" },
        "수출 마케팅 바우처",
        "바보클럽",
        "부산마약퇴치운동본부"
      ]
    },
    {
      id: "brand",
      label: "글로벌 · 리테일",
      names: [
        { name: "라이카 카메라 코리아", logo: "/media/partners/leica.png" },
        { name: "스위스제이 · 조야 슈즈", logo: "/media/partners/joya.png" },
        { name: "압구정 직영 1호점", logo: "/media/partners/joya.png" },
        { name: "대치 직영 2호점", logo: "/media/partners/joya.png" },
        { name: "부천 직영 3호점", logo: "/media/partners/joya.png" }
      ]
    },
    {
      id: "care",
      label: "의료 · 헬스케어",
      names: [
        { name: "부산 H 동물의료센터", logo: "/media/partners/h-animal.png" },
        "김해 드림플란트 치과"
      ]
    },
    {
      id: "food",
      label: "F&B · 프랜차이즈",
      names: [
        "와와샤브 대신점 · 대연점",
        "구스토파파",
        "까치횟집",
        "서가네오리",
        "김해집",
        "농장갈비",
        "김순분 할매회국수",
        "제임스시카고피자",
        "마당쇠왕소금구이",
        "지리산 식육식당"
      ]
    },
    {
      id: "city",
      label: "모빌리티 · 건설 · 교육",
      names: [
        "봉카 · 띵카 · 미쓰봉카",
        "굿타임 렌트카",
        { name: "사하 힐스테이트", logo: "/media/partners/hillstate.png" },
        { name: "센텀 계룡리슈빌", logo: "/media/partners/leesuville.png" },
        "코섹 테솔교육원",
        "도트커피 바리스타학원",
        "모카클래스",
        "원룸24"
      ]
    },
    {
      id: "web3",
      label: "Web3",
      names: [
        "NEVADA DEX",
        { name: "UXLINK", logo: "/media/partners/uxlink.png" },
        { name: "SaharaAI", logo: "/media/partners/sahara.png" },
        { name: "edgeX", logo: "/media/partners/edgex.png" },
        { name: "Theoriq", logo: "/media/partners/theoriq.png" },
        { name: "BLESS", logo: "/media/partners/bless.png" },
        { name: "Dolomite", logo: "/media/partners/dolomite.png" },
        { name: "MVL", logo: "/media/partners/mvl.png" }
      ]
    }
  ],
  en: [
    {
      id: "public",
      label: "Public bodies",
      names: [
        { name: "TTA, Telecommunications Technology Association", logo: "/media/partners/tta.png" },
        "Busan Content Korea Lab",
        "Busan Economic Promotion Agency startup program",
        { name: "Small-business live commerce program", logo: "/media/partners/semas.png" },
        { name: "Own-mall build program", logo: "/media/partners/semas.png" },
        { name: "MICE and travel digital transition program", logo: "/media/partners/kto.png" },
        "Export marketing voucher",
        "Babo Club",
        "Korea Association Against Drug Abuse, Busan"
      ]
    },
    {
      id: "brand",
      label: "Global and retail",
      names: [
        { name: "Leica Camera Korea", logo: "/media/partners/leica.png" },
        { name: "Swiss J and Joya Shoes", logo: "/media/partners/joya.png" },
        { name: "Apgujeong flagship store", logo: "/media/partners/joya.png" },
        { name: "Daechi second store", logo: "/media/partners/joya.png" },
        { name: "Bucheon third store", logo: "/media/partners/joya.png" }
      ]
    },
    {
      id: "care",
      label: "Medical and care",
      names: [
        { name: "Busan H Animal Medical Center", logo: "/media/partners/h-animal.png" },
        "Gimhae Dream Plant Dental"
      ]
    },
    {
      id: "food",
      label: "Food and franchise",
      names: [
        "Wawa Shabu, two branches",
        "Gusto Papa",
        "Kkachi Hoetjip",
        "Seoganae Ori",
        "Gimhaejip",
        "Nongjang Galbi",
        "Kim Sunbun Halmae Hoe Guksu",
        "James Chicago Pizza",
        "Madangsoe Wang Sogeum Gui",
        "Jirisan Meat Restaurant"
      ]
    },
    {
      id: "city",
      label: "Mobility, housing, education",
      names: [
        "Bongka, Ddingka, Missbongka",
        "Goodtime Rent-a-car",
        { name: "Saha Hillstate", logo: "/media/partners/hillstate.png" },
        { name: "Centum Gyeryong Leesuville", logo: "/media/partners/leesuville.png" },
        "Cosec TESOL",
        "Dot Coffee barista school",
        "Mocha Class",
        "Oneroom24"
      ]
    },
    {
      id: "web3",
      label: "Web3",
      names: [
        "NEVADA DEX",
        { name: "UXLINK", logo: "/media/partners/uxlink.png" },
        { name: "SaharaAI", logo: "/media/partners/sahara.png" },
        { name: "edgeX", logo: "/media/partners/edgex.png" },
        { name: "Theoriq", logo: "/media/partners/theoriq.png" },
        { name: "BLESS", logo: "/media/partners/bless.png" },
        { name: "Dolomite", logo: "/media/partners/dolomite.png" },
        { name: "MVL", logo: "/media/partners/mvl.png" }
      ]
    }
  ]
} as const;

/* Off the record: the volunteering and civic work that never bills a client. */
const MARGIN = {
  ko: [
    ["2008-2024", "바보클럽 자원봉사단", "누적 2,000시간 이상 봉사, 사단법인 설립 추진"],
    ["2021-2024", "북부산 청년회의소 JCI", "홍보분과위원장 · 총무이사 · 지역교류분과 위원장"],
    ["2023", "부산광역시의회의장 표창", "지역 사회 활동으로 받은 표창입니다"]
  ],
  en: [
    ["2008-2024", "Babo Club volunteer corps", "Over 2,000 recorded hours, and work toward incorporation"],
    ["2021-2024", "JCI North Busan", "PR chair, treasurer, and regional exchange chair"],
    ["2023", "Busan Metropolitan Council Chair commendation", "Awarded for the community work"]
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
      title: korean ? "글로벌과 한국 사이를 이었습니다" : "Became the bridge into Korea",
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
    email: "mailto:admin@fiveovertwo.xyz",
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
                  ? "2012년부터 캠페인을 운영했고, 지금은 리서치 도구와 자동화 제품을 직접 만듭니다. 아래로 내려가면 문어가 잉크로 적어 둔 14년의 기록이 펼쳐집니다."
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
              <h2 id="ledger-title">{korean ? "말보다 숫자가 먼저입니다" : "The numbers arrive first"}</h2>
              <InkStroke className="ink-underline" d={UNDERLINE} viewBox="0 0 310 44" strokeWidth={9} />
            </div>
            <div className="record">
              {RECORD[locale].map((item) => (
                <div key={item.value}>
                  <strong><InkCount value={item.value} /></strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 연표: 열네 해가 한 획으로 */}
        <section className="chapter band" id="timeline" aria-labelledby="timeline-title">
          <div className="wrap">
            <div className="head">
              <p className="press-mark">{korean ? "연표" : "The timeline"}</p>
              <h2 id="timeline-title">{korean ? "14년을 한 획으로" : "Fourteen years, one stroke"}</h2>
              <InkStroke className="ink-underline" d={UNDERLINE} viewBox="0 0 310 44" strokeWidth={9} />
            </div>
            <InkTimeline
              eras={ERAS[locale]}
              label={korean ? "잉크 방울을 눌러 시기별 기록 보기" : "Pick an era to read its record"}
            />
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

        {/* 명부: 14년 동안 이름을 적어 둔 곳들 */}
        <section className="chapter band" id="roster" aria-labelledby="roster-title">
          <div className="wrap">
            <div className="head">
              <p className="press-mark">{korean ? "명부" : "The roster"}</p>
              <h2 id="roster-title">{korean ? "함께한 주요 파트너" : "Selected partners"}</h2>
              <InkStroke className="ink-underline" d={UNDERLINE} viewBox="0 0 310 44" strokeWidth={9} />
            </div>
            <p className="lede">
              {korean
                ? "200건이 넘는 프로젝트 가운데 일부만 옮겨 적었습니다. 공기업과 지자체 지원사업부터 글로벌 브랜드, 동네 가게, Web3 프로젝트까지. 분야를 눌러 그 장을 펼쳐 보세요."
                : "A selection from more than two hundred projects. Public programs, global brands, neighbourhood shops, Web3 teams. Press a category to open that page."}
            </p>
            <InkRoster
              groups={ROSTER[locale]}
              countTemplate={korean ? "이 장에 옮겨 적은 {n}곳" : "{n} of them on this page"}
            />
            <p className="ink-roster-note">
              {korean
                ? "전체 목록이 아니라 기존 커리어 포트폴리오에서 발췌한 일부이며, 계약 형태와 참여 범위는 건마다 다릅니다."
                : "An excerpt from the career portfolio rather than the full list. Contract type and depth of involvement vary by engagement."}
            </p>
          </div>
        </section>

        {/* 도구함: 여백에 동그라미 쳐 둔 것들 */}
        <section className="chapter band" id="toolkit" aria-labelledby="toolkit-title">
          <div className="wrap">
            <div className="head">
              <p className="press-mark">{korean ? "도구함" : "The toolkit"}</p>
              <h2 id="toolkit-title">{korean ? "손에 익은 것들" : "What the hands know"}</h2>
              <InkStroke className="ink-underline" d={UNDERLINE} viewBox="0 0 310 44" strokeWidth={9} />
            </div>
            <ul className="ink-kit">
              {KIT[locale].map((item) => (
                <li key={item}>
                  <span className="ink-kit-chip">
                    <svg className="ink-kit-ring" viewBox="0 0 120 44" preserveAspectRatio="none" aria-hidden>
                      <path
                        d="M62 4 C 100 2, 117 11, 116 22 C 115 35, 90 41, 58 40 C 24 39, 4 32, 5 20 C 6 9, 34 3, 88 5"
                        pathLength={100}
                      />
                    </svg>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

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

        {/* 여백의 기록: 청구서가 나가지 않은 일들 */}
        <section className="chapter band band-alt" id="margin" aria-labelledby="margin-title">
          <div className="wrap">
            <div className="head">
              <p className="press-mark">{korean ? "여백의 기록" : "In the margin"}</p>
              <h2 id="margin-title">{korean ? "청구서가 없는 일들" : "The work no one was billed for"}</h2>
              <InkStroke className="ink-underline" d={UNDERLINE} viewBox="0 0 310 44" strokeWidth={9} />
            </div>
            <div className="ledger">
              {MARGIN[locale].map(([period, title, description]) => (
                <div className="ledger-row" key={period}>
                  <time>{period}</time>
                  <strong>{title}</strong>
                  <span>{description}</span>
                </div>
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
                ? "만들고 있는 제품, 들어가려는 시장, 지금 막힌 지점. 무엇이든 편하게 보내주세요."
                : "Send the product, the market, and the point where it is stuck."}
            </p>
            <a className="contact-mail" href="mailto:admin@fiveovertwo.xyz">admin@fiveovertwo.xyz</a>
            <div className="seal-line">
              <InkSeal>님달</InkSeal>
              <p>{korean ? "서명 · 2026" : "Signed · 2026"}</p>
            </div>
            <SealCTA
              holdLabel={korean ? "꾹 눌러 방문 도장 찍기" : "Press and hold to leave your seal"}
              doneLabel={korean ? "다녀가셨습니다" : "You were here"}
            />
            <InkPad
              title={korean ? "붓 가는 대로 낙서 하나 남겨보세요" : "Pick up the brush, leave a mark"}
              hint={korean ? "낙서는 이번 방문 동안 남아 있습니다" : "The paper remembers for this visit"}
              clearLabel={korean ? "지우기" : "Clear"}
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
