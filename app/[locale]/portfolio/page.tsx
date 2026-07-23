import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { PixelEffects } from "@/components/pixel/PixelEffects";
import { StructuredData } from "@/components/seo/StructuredData";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { careerCases, isLocale, locales, siteContent } from "@/lib/content";
import { absoluteCanonicalUrl, metadataAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

const workHistory = [
  ["2026.04–2026.06", "1six.tech Inc. / NEVADA", "Marketing Lead", "SEO / KOL / LOCALIZATION"],
  ["2025.01–2025.09", "071Labs", "GTM", "CONTENT / COMMUNITY OPS"],
  ["2012.12–2024.09", "MKR", "MARKETING AGENCY", "CLIENT OPS / CAMPAIGN SYSTEM"]
] as const;

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: value } = await params;
  if (!isLocale(value)) return {};
  const korean = value === "ko";
  return { title: korean ? "경력" : "Career", description: siteContent[value].career.description, alternates: metadataAlternates(value, "/portfolio"), openGraph: { url: absoluteCanonicalUrl(value, "/portfolio"), images: [{ url: "/media/operator-portrait.png", width: 640, height: 853 }] } };
}

export default async function CareerPage({ params }: Props) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const locale = value;
  const korean = locale === "ko";
  const content = siteContent[locale];
  const schema = { "@context": "https://schema.org", "@type": "ProfilePage", url: absoluteCanonicalUrl(locale, "/portfolio"), mainEntity: { "@type": "Person", name: korean ? "탁찬우" : "Tak Chanwoo", alternateName: "Nimdal", jobTitle: "Marketing Lead / Builder" } };

  return <div className="pixel-surface pixel-page"><PixelEffects /><StructuredData data={schema} /><SiteHeader locale={locale} active="career" />
    <main id="main-content">
      <section className="pixel-page-hero pixel-career-hero"><div className="pixel-wrap">
        <p className="pixel-kicker">CAREER — OPERATOR DOSSIER</p><h1>{korean ? "숫자만 말하지 않습니다." : "Numbers, with receipts."}</h1>
        <p className="pixel-lead">{korean ? "브랜드 캠페인, 한국 GTM, 제품 제작까지. 직접 맡아 운영한 일과 만든 화면을 한 곳에 모았습니다." : "Brand campaigns, Korean GTM, and product building — collected from the work I have actually operated."}</p>
        <div className="pixel-career-stats">{content.career.signals.slice(0, 4).map((signal) => <span key={signal.value}><strong>{signal.value}</strong><small>{signal.label}</small></span>)}</div>
      </div></section>
      <section className="pixel-career-band"><div className="pixel-wrap"><div className="pixel-section-title is-dark" data-pixel-reveal><span>POSITIONS</span><h2>{korean ? "함께한 팀" : "Teams I worked with"}</h2></div><div className="pixel-career-list" data-pixel-reveal>{workHistory.map(([period, company, role, focus]) => <div key={company}><time>{period}</time><strong>{company}</strong><span>{role} · {focus}</span></div>)}</div></div></section>
      <section className="pixel-section"><div className="pixel-wrap"><div className="pixel-section-title" data-pixel-reveal><span>SELECTED CASES</span><h2>{korean ? "대표 운영 사례" : "Selected operations"}</h2></div><div className="pixel-case-grid">{careerCases.map((item, index) => { const copy = item.copy[locale]; return <article data-pixel-reveal className="pixel-case" key={item.id}><div className="pixel-case-media"><Image src={item.media.src} alt={item.media.alt[locale]} fill sizes="(max-width: 680px) calc(100vw - 48px), 31vw" /></div><div><p>{String(index + 1).padStart(2, "0")} — {item.period}</p><h2>{copy.title}</h2><span>{copy.context}</span><ul>{copy.channels.map((channel) => <li key={channel}>{channel}</li>)}</ul></div></article>; })}</div></div></section>
      <section className="pixel-contact pixel-contact-small"><div className="pixel-wrap"><div className="pixel-inline-contact" data-pixel-reveal><span><i>CONTACT / PDF</i><strong>{korean ? "이야기 나눌 일과 이력을 함께 보내드립니다." : "For a conversation or the full English portfolio."}</strong><a className="pixel-career-email" href="mailto:0xnimdal@gmail.com">0xnimdal@gmail.com</a></span><a data-mag className="pixel-button is-pink" href="/media/career/tak-chanwoo-nimdal-portfolio-v2.pdf" download>{korean ? "PDF 다운로드" : "DOWNLOAD PDF"}</a></div></div></section>
    </main><SiteFooter locale={locale} note="MADE BY A MARKETER, SHIPPED LIKE A DEV" /></div>;
}
