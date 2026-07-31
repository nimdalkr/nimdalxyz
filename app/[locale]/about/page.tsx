import type { Metadata } from "next";
import { InkStroke } from "@/components/ink/InkStroke";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/riso/Reveal";
import { RisoPlate } from "@/components/riso/RisoPlate";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { isLocale, siteContent } from "@/lib/content";
import { absoluteCanonicalUrl, metadataAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: value } = await params;
  if (!isLocale(value)) return {};
  const korean = value === "ko";
  return {
    title: korean ? "소개" : "About",
    description: siteContent[value].seo.description,
    alternates: metadataAlternates(value, "/about"),
    openGraph: {
      url: absoluteCanonicalUrl(value, "/about"),
      images: [{ url: "/media/operator-portrait.png", width: 640, height: 853 }]
    }
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const locale = value;
  const korean = locale === "ko";
  const content = siteContent[locale];

  const principles = [
    {
      title: korean ? "숫자는 출처와 함께" : "Numbers travel with sources",
      body: korean
        ? "성과를 말할 때는 어디서 나온 숫자인지, 확인할 수 있는 범위를 함께 적습니다."
        : "Results come with their source and the boundary of what can actually be checked."
    },
    {
      title: korean ? "기획서보다 프로토타입" : "Prototypes over decks",
      body: korean
        ? "긴 설명보다 먼저 돌아가는 화면을 만듭니다. 화면이 생기면 대화도 빨라집니다."
        : "A working screen makes the next conversation faster than a longer deck."
    },
    {
      title: korean ? "혼자서도 한 사이클" : "A full working loop",
      body: korean
        ? "기획, 제작, 운영, 회고까지 직접 돌립니다. 반복되는 일은 자동화합니다."
        : "I plan, build, operate and review it myself, then automate the parts that repeat."
    }
  ];

  const journey = [
    ["2012-2016", "Makorang Lab", korean ? "CSR 플랫폼 / 파트너십" : "CSR platform / partnerships"],
    ["2018-2024", "MKR", korean ? "클라이언트 운영 / 캠페인 시스템" : "Client operations / campaign systems"],
    ["2025", "071Labs", korean ? "GTM / 콘텐츠 / 커뮤니티 운영" : "GTM / content / community operations"],
    ["2026", "1six.tech / NEVADA", korean ? "Marketing Lead / SEO / 현지화" : "Marketing Lead / SEO / localization"],
    ["2026.08-NOW", "FIVE OVER TWO", korean ? "Co-Founder / 그로스 시스템" : "Co-Founder / growth systems"]
  ] as const;

  const chips = korean
    ? ["서울", "2012년부터", "Web3 GTM", "지금은 제작 중"]
    : ["Seoul", "Since 2012", "Web3 GTM", "Now building"];

  return (
    <div className="page">
      <SiteHeader locale={locale} active="about" />
      <main id="main-content">
        {/* 1. Split: the portrait plate against the introduction. */}
        <section className="page-head" aria-labelledby="about-title">
          <div className="wrap split">
            <RisoPlate
              className="portrait-plate"
              src="/media/operator-portrait.png"
              alt={content.home.identity.portraitAlt}
              priority
              offset={18}
              sizes="(max-width: 767px) 100vw, 34vw"
            />
            <div>
              <p className="press-mark">{korean ? "소개" : "About"}</p>
              <h1 id="about-title">
                {korean ? "안녕하세요, 탁찬우입니다." : "Hi, I am Tak Chanwoo."}
              </h1>
              <InkStroke className="ink-underline" d="M8 26 C 90 10, 210 34, 300 18" viewBox="0 0 310 44" strokeWidth={9} />
              <p className="lede">
                {korean
                  ? "마케팅 에이전시에서 브랜드와 로컬 비즈니스의 캠페인을 운영했습니다. 채널과 예산이 달라도 결국 판단은 숫자와 현장에서 나왔습니다."
                  : "I ran campaigns for brands and local businesses at a marketing agency, where the work always came back to numbers and the field."}
              </p>
              <p className="lede">
                {korean
                  ? "이후 Web3 팀의 한국 시장 진출을 함께했고, 필요한 도구를 직접 만들기 시작했습니다. 지금은 마케팅과 제작 사이에서 일합니다."
                  : "Then I worked on Korean GTM for Web3 teams and started building the tools I kept needing. I now work between marketing and making."}
              </p>
              <ul className="chip-row">
                {chips.map((chip) => <li key={chip}>{chip}</li>)}
              </ul>
            </div>
          </div>
        </section>

        {/* 2. Principles: ruled blocks, no card containers. */}
        <section className="band band-tight" aria-labelledby="principles-title">
          <div className="wrap">
            <div className="head">
              <h2 id="principles-title">{korean ? "일하는 방식" : "How I work"}</h2>
            </div>
            <div className="principles">
              {principles.map((item, index) => (
                <Reveal key={item.title} as="article" index={index}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Journey: the same ledger rows used across the site, flooded in ink. */}
        <section className="band band-ink" aria-labelledby="journey-title">
          <div className="wrap">
            <div className="head">
              <p className="press-mark">{korean ? "여정" : "Journey"}</p>
              <h2 id="journey-title">{korean ? "지나온 길" : "The road so far"}</h2>
            </div>
            <div className="ledger">
              {journey.map(([period, title, description], index) => (
                <Reveal key={period} className="ledger-row" index={index}>
                  <time>{period}</time>
                  <strong>{title}</strong>
                  <span>{description}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Contact: accent flood carrying ink type. */}
        <section className="band band-tight band-flo contact" aria-labelledby="about-contact-title">
          <div className="wrap">
            <h2 id="about-contact-title">
              {korean ? "같이 고민해 볼 문제가 있다면 보내주세요." : "Send over the problem worth talking about."}
            </h2>
            <a className="contact-mail" href="mailto:admin@fiveovertwo.xyz">admin@fiveovertwo.xyz</a>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} note={korean ? "마케터가 만들고, 개발자처럼 배포합니다" : "Made by a marketer, shipped like a dev"} />
    </div>
  );
}
