import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { PixelEffects } from "@/components/pixel/PixelEffects";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { isLocale, siteContent } from "@/lib/content";
import { absoluteCanonicalUrl, metadataAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: value } = await params;
  if (!isLocale(value)) return {};
  const korean = value === "ko";
  return { title: korean ? "소개" : "About", description: siteContent[value].seo.description, alternates: metadataAlternates(value, "/about"), openGraph: { url: absoluteCanonicalUrl(value, "/about"), images: [{ url: "/media/operator-portrait.png", width: 640, height: 853 }] } };
}

export default async function AboutPage({ params }: Props) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const locale = value;
  const korean = locale === "ko";
  const content = siteContent[locale];
  const values = [
    ["EVIDENCE", korean ? "숫자는 출처와 함께" : "Numbers travel with sources", korean ? "성과를 말할 때는 어디서 나온 숫자인지, 확인할 수 있는 범위를 함께 적습니다." : "Results come with their source and the boundary of what can actually be checked."],
    ["PROTOTYPE", korean ? "기획서보다 프로토타입" : "Prototypes over decks", korean ? "긴 설명보다 먼저 돌아가는 화면을 만듭니다. 화면이 생기면 대화도 빨라집니다." : "A working screen makes the next conversation faster than a longer deck."],
    ["SOLO OPS", korean ? "혼자서도 한 사이클" : "A full working loop", korean ? "기획, 제작, 운영, 회고까지 직접 돌립니다. 반복되는 일은 자동화합니다." : "I plan, build, operate, review — and automate the parts that repeat."]
  ] as const;
  const journey = [
    ["2012–2024", "MKR", korean ? "클라이언트 운영 · 캠페인 시스템" : "Client operations · campaign systems"],
    ["2025", "071Labs", korean ? "GTM · 콘텐츠 · 커뮤니티 운영" : "GTM · content · community operations"],
    ["2026", "1six.tech / NEVADA", korean ? "Marketing Lead · SEO · KOL · 현지화" : "Marketing Lead · SEO · KOL · localization"],
    ["NOW", "NIMDAL", korean ? "리서치 도구와 자동화 제품을 만들고 운영합니다." : "Building and operating research tools and automation."]
  ] as const;

  return <div className="pixel-surface pixel-page"><PixelEffects /><SiteHeader locale={locale} active="about" />
    <main id="main-content">
      <section className="pixel-page-hero"><div className="pixel-wrap pixel-about-hero">
        <div className="pixel-profile-stack"><Image className="pixel-profile-photo" src="/media/operator-portrait.png" alt={content.home.identity.portraitAlt} width={250} height={333} priority /><Image className="pixel-profile-mark" src="/media/identity-octopus.jpg" alt="" width={76} height={76} /></div>
        <div><p className="pixel-kicker">ABOUT — TAK CHANWOO</p><h1>{korean ? "안녕하세요, 탁찬우입니다." : "Hi, I’m Tak Chanwoo."}</h1><p className="pixel-lead">{korean ? "마케팅 에이전시에서 브랜드와 로컬 비즈니스의 캠페인을 운영했습니다. 채널과 예산이 달라도, 결국 판단은 숫자와 현장에서 나왔습니다." : "I ran campaigns across brands and local businesses at a marketing agency, where the work always returned to numbers and the field."}</p><p className="pixel-lead">{korean ? "이후 Web3 프로젝트의 한국 시장 진출을 함께했고, 필요한 도구를 직접 만들기 시작했습니다. 지금은 마케팅과 제작 사이에서 일합니다." : "Then I worked on Korean GTM for Web3 teams and started building the tools I kept needing."}</p><p className="pixel-chip-row"><span>SEOUL</span><span>SINCE 2012</span><span>WEB3 GTM</span><span>NOW BUILDING</span></p></div>
      </div></section>
      <section className="pixel-section"><div className="pixel-wrap pixel-value-grid">{values.map(([tag, title, body]) => <article data-pixel-reveal key={tag}><p>{tag}</p><h2>{title}</h2><span>{body}</span></article>)}</div></section>
      <section className="pixel-career-band"><div className="pixel-wrap"><div className="pixel-section-title is-dark" data-pixel-reveal><span>JOURNEY</span><h2>{korean ? "지나온 길" : "The road so far"}</h2></div><div className="pixel-journey" data-pixel-reveal>{journey.map(([period, title, description]) => <div key={period}><time>{period}</time><span><strong>{title}</strong><small>{description}</small></span></div>)}</div></div></section>
      <section className="pixel-contact pixel-contact-small"><div className="pixel-wrap"><div className="pixel-inline-contact" data-pixel-reveal><span><i>CONTACT</i><strong>{korean ? "이야기 나눌 문제를 보내주세요." : "Send over the problem worth talking about."}</strong></span><a data-mag className="pixel-button is-pink" href="mailto:0xnimdal@gmail.com">0xnimdal@gmail.com</a></div></div></section>
    </main><SiteFooter locale={locale} note="MADE BY A MARKETER, SHIPPED LIKE A DEV" /></div>;
}
