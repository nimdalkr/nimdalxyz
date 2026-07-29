import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/riso/Reveal";
import { RisoPlate } from "@/components/riso/RisoPlate";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getLocalizedBlogPosts } from "@/content/blog/posts";
import { getProject, siteContent, type Locale } from "@/lib/content";

/**
 * The readable portfolio.
 *
 * This is what the server sends and what search engines, screen readers, and
 * anyone without WebGL will read. The atlas mounts on top of it; it never
 * replaces it as the source of the content.
 */

const work = ["hyperalphaduo", "alphaduo", "mylol"] as const;

const record = {
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

const engagements = {
  ko: [
    { period: "2026.08-NOW", organization: "FIVE OVER TWO", role: "Co-Founder", focus: "벤처 / 그로스 시스템" },
    { period: "2026.04-2026.06", organization: "1six.tech / NEVADA", role: "Marketing Lead", focus: "SEO / KOL / 현지화" },
    { period: "2025.01-2025.09", organization: "071Labs", role: "GTM", focus: "콘텐츠 / 커뮤니티 운영" },
    { period: "2012.12-2024.09", organization: "MKR", role: "Founder", focus: "에이전시 / 캠페인 시스템" }
  ],
  en: [
    { period: "2026.08-NOW", organization: "FIVE OVER TWO", role: "Co-Founder", focus: "Venture / growth systems" },
    { period: "2026.04-2026.06", organization: "1six.tech / NEVADA", role: "Marketing Lead", focus: "SEO / KOL / localization" },
    { period: "2025.01-2025.09", organization: "071Labs", role: "GTM", focus: "Content / community ops" },
    { period: "2012.12-2024.09", organization: "MKR", role: "Founder", focus: "Agency / campaign systems" }
  ]
} as const;

const clients = [
  { name: "Leica", src: "/media/career/leica-logo.jpg" },
  { name: "H Animal Medical Center", src: "/media/career/h-animal-logo.jpg" },
  { name: "Joya Swiss", src: "/media/career/joya-logo.jpg" },
  { name: "Nevada", src: "/media/career/nevada-logo.jpg" }
] as const;

export async function ReadableHome({ locale }: { locale: Locale }) {
  const korean = locale === "ko";
  const content = siteContent[locale];
  const selected = work.map((slug) => {
    const project = getProject(slug);
    if (!project) throw new Error(`Missing ${slug}`);
    const media = project.media.find((item) => item.role === "proof") ?? project.media[0];
    return { project, media, copy: project.copy[locale] };
  });
  const [lead, ...rest] = selected;
  const posts = (await getLocalizedBlogPosts(locale)).slice(0, 3);

  return (
    <div className="page">
      <SiteHeader locale={locale} active="home" />

      <main id="main-content">
        <section className="cover" id="top" aria-labelledby="home-title">
          <div className="wrap cover-grid">
            <div>
              <p className="press-mark">{korean ? "마케터이자 빌더" : "Marketer and builder"}</p>
              <h1 id="home-title">
                {korean ? <>만드는 마케터,<br />님달입니다.</> : <>A marketer<br />who ships.</>}
              </h1>
              <p className="lede">
                {korean
                  ? "2012년부터 캠페인을 운영했고, 지금은 리서치 도구와 자동화 제품을 직접 만듭니다. 기획서보다 돌아가는 화면을 먼저 보여드립니다."
                  : "Running campaigns since 2012. Now building research tools and automation, with working screens before slide decks."}
              </p>
              <div className="actions">
                <Link className="btn btn-flo" href="#work">{korean ? "프로젝트 보기" : "See projects"}</Link>
                <Link className="btn" href={`/${locale}/about`}>{korean ? "소개" : "About"}</Link>
              </div>
            </div>
            <figure className="cover-portrait">
              <RisoPlate
                src="/media/operator-portrait.png"
                alt={content.home.identity.portraitAlt}
                priority
                offset={18}
                sizes="(max-width: 767px) 19rem, 38vw"
              />
              <figcaption>{korean ? "탁찬우 / 서울" : "Tak Chanwoo / Seoul"}</figcaption>
            </figure>
          </div>
        </section>

        <section className="band-alt band-tight" aria-label={korean ? "운영 기록" : "Operating record"}>
          <div className="wrap">
            <div className="record">
              {record[locale].map((item) => (
                <div key={item.value}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="band" id="work" aria-labelledby="work-title">
          <div className="wrap">
            <div className="head">
              <p className="press-mark">{korean ? "작업" : "Work"}</p>
              <h2 id="work-title">{korean ? "직접 만든 것들" : "Things I built"}</h2>
            </div>

            <Reveal>
              <Link className="work-link feature" href={`/${locale}/projects/${lead.project.slug}`}>
                <RisoPlate
                  className="feature-plate"
                  src={lead.media.src}
                  alt={lead.media.alt[locale]}
                  sizes="(max-width: 767px) 100vw, 55vw"
                />
                <div className="feature-body">
                  <p className="work-meta">
                    <i>{lead.copy.category}</i>
                    <span className={lead.project.status === "live" ? "is-live" : undefined}>
                      {lead.project.status === "live" ? "Live" : "Prototype"}
                    </span>
                  </p>
                  <h3>{lead.copy.title}</h3>
                  <p>{lead.copy.summary}</p>
                </div>
              </Link>
            </Reveal>

            <div className="pair">
              {rest.map((item, index) => (
                <Reveal key={item.project.slug} index={index}>
                  <Link className="work-link pair-item" href={`/${locale}/projects/${item.project.slug}`}>
                    <RisoPlate
                      className="pair-plate"
                      src={item.media.src}
                      alt={item.media.alt[locale]}
                      sizes="(max-width: 767px) 100vw, 28vw"
                    />
                    <div>
                      <p className="work-meta">
                        <i>{item.copy.category}</i>
                        <span className={item.project.status === "live" ? "is-live" : undefined}>
                          {item.project.status === "live" ? "Live" : "Prototype"}
                        </span>
                      </p>
                      <h3>{item.copy.title}</h3>
                      <p>{item.copy.summary}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="band band-tight" aria-labelledby="practice-title">
          <div className="wrap practice">
            <div className="practice-margin">
              <RisoPlate
                className="practice-plate"
                src="/media/identity-octopus.jpg"
                alt={content.home.identity.avatarAlt}
                quiet
                offset={10}
                sizes="(max-width: 767px) 10rem, 18vw"
              />
            </div>
            <div className="practice-body">
              <h2 id="practice-title">
                {korean ? "마케터의 눈, 빌더의 손" : "A marketer's eye, a builder's hands"}
              </h2>
              <p>
                {korean
                  ? "에이전시에서 브랜드와 로컬 비즈니스의 마케팅을 운영했습니다. 채널과 예산이 달라져도 판단은 늘 숫자와 현장에서 나왔습니다."
                  : "I ran marketing for brands and local businesses at an agency. Channels and budgets changed, but the decisions always came back to numbers and the field."}
              </p>
              <p>
                {korean
                  ? "이후 Web3 팀의 한국 시장 진출을 맡으면서 필요한 도구를 직접 만들기 시작했습니다. 지금은 반복되는 시장 조사와 운영을 도구로 바꾸는 일을 합니다."
                  : "Then I took Web3 teams into the Korean market and started building the tools I kept needing. Now I turn repeating market work into software."}
              </p>
            </div>
          </div>
        </section>

        <section className="band band-ink" id="career" aria-labelledby="career-title">
          <div className="wrap">
            <div className="head">
              <p className="press-mark">{korean ? "경력" : "Career"}</p>
              <h2 id="career-title">{korean ? "거쳐온 곳들" : "Where I have worked"}</h2>
            </div>
            <div className="ledger">
              {engagements[locale].map((row, index) => (
                <Reveal key={row.organization} className="ledger-row" index={index}>
                  <time>{row.period}</time>
                  <strong>{row.organization}</strong>
                  <span>{row.role} · {row.focus}</span>
                </Reveal>
              ))}
            </div>
            <ul className="client-wall" aria-label={korean ? "함께 일한 브랜드" : "Brands I have worked with"}>
              {clients.map((client) => (
                <li key={client.name}>
                  <Image src={client.src} alt={client.name} width={150} height={56} sizes="150px" />
                </li>
              ))}
            </ul>
            <div className="actions">
              <Link className="btn" href={`/${locale}/portfolio`}>
                {korean ? "경력 자세히" : "Full career"}
              </Link>
            </div>
          </div>
        </section>

        <section className="band" id="blog" aria-labelledby="notes-title">
          <div className="wrap">
            <div className="head">
              <h2 id="notes-title">{korean ? "만들면서 배운 것들" : "Notes from building"}</h2>
            </div>
            <div className="notes">
              {posts.map((post, index) => (
                <Reveal key={post.slug} index={index}>
                  <a className="note" href={post.canonicalUrl}>
                    <time dateTime={post.publishedAt}>
                      {post.publishedAt.replaceAll("-", ".")} {post.category}
                    </time>
                    <h3>{post.title}</h3>
                    <span className="note-arrow" aria-hidden>{"→"}</span>
                  </a>
                </Reveal>
              ))}
            </div>
            <div className="actions">
              <a className="rule-link" href={`https://blog.nimdal.xyz/${locale}`}>
                {korean ? "글 전체 보기" : "All posts"}
              </a>
            </div>
          </div>
        </section>

        <section className="band band-flo contact" id="contact" aria-labelledby="contact-title">
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
            <nav className="contact-links" aria-label={korean ? "외부 채널" : "Elsewhere"}>
              <a href="https://x.com/0xnimdal" target="_blank" rel="noreferrer">X</a>
              <a href="https://t.me/nimdal" target="_blank" rel="noreferrer">Telegram</a>
              <a href="https://linkedin.com/in/chanwoo-tak-132b281a4" target="_blank" rel="noreferrer">LinkedIn</a>
            </nav>
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} note={korean ? "마케터가 만들고, 개발자처럼 배포합니다" : "Made by a marketer, shipped like a dev"} />
    </div>
  );
}
