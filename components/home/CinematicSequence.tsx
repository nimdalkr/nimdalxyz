"use client";

import { ArrowDown, ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import {
  motion,
  type MotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { LocaleSwitch } from "@/components/site/LocaleSwitch";
import type { Locale } from "@/lib/content";

export interface PersonalProject {
  slug: string;
  title: string;
  category: "NFT" | "RESEARCH" | "GAME";
  status: string;
  src: string;
  alt: string;
}

export interface CareerEngagement {
  period: string;
  organization: string;
  relationship: string;
  focus: string;
}

export interface CareerBrand {
  period: string;
  name: string;
  focus: string;
}

export interface CareerSignal {
  value: string;
  label: string;
}

export interface BlogPreview {
  slug: string;
  publishedAt: string;
  title: string;
  category: string;
  readingTime: string;
}

interface PersonalPortfolioHomeProps {
  locale: Locale;
  identity: {
    legalName: string;
    portraitAlt: string;
    avatarAlt: string;
  };
  projects: [PersonalProject, PersonalProject, PersonalProject];
  engagements: readonly CareerEngagement[];
  brands: readonly CareerBrand[];
  signals: readonly CareerSignal[];
  posts: readonly BlogPreview[];
  email: string;
}

const workWindows = [
  [0, 0.1, 0.31, 0.39],
  [0.33, 0.4, 0.62, 0.7],
  [0.64, 0.71, 0.92, 1]
] as const;

function sceneFromProgress(progress: number) {
  if (progress < 0.34) return 0;
  if (progress < 0.65) return 1;
  return 2;
}

function formatDate(date: string) {
  return date.replaceAll("-", ".");
}

function useHydrationSafeReducedMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(query.matches);

    updatePreference();
    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  return reduceMotion;
}

function Intro({ locale, avatarAlt }: Pick<PersonalPortfolioHomeProps, "locale"> & { avatarAlt: string }) {
  const introRef = useRef<HTMLElement>(null);
  const reduceMotion = useHydrationSafeReducedMotion();
  const { scrollYProgress } = useScroll({
    target: introRef,
    offset: ["start start", "end start"]
  });
  const titleY = useTransform(scrollYProgress, [0, 0.72, 1], ["0vh", "-5vh", "-18vh"]);
  const titleScale = useTransform(scrollYProgress, [0, 0.72, 1], [1, 1.02, 0.92]);
  const imageX = useTransform(scrollYProgress, [0, 0.72, 1], ["0vw", "-4vw", "-10vw"]);
  const imageY = useTransform(scrollYProgress, [0, 0.72, 1], ["0vh", "2vh", "18vh"]);
  const imageScale = useTransform(scrollYProgress, [0, 0.72, 1], [1, 1.18, 1.55]);
  const imageRotate = useTransform(scrollYProgress, [0, 0.72, 1], [0, -2, -7]);
  const detailOpacity = useTransform(scrollYProgress, [0, 0.48, 0.75], [1, 1, 0]);
  const veilOpacity = useTransform(scrollYProgress, [0.68, 1], [0, 1]);

  return (
    <section
      className="pp-intro-track"
      id="top"
      ref={introRef}
      data-portfolio-scene="00"
      aria-labelledby="pp-intro-title"
    >
      <div className="pp-intro-stage">
        <motion.div
          className="pp-intro-title-wrap"
          style={reduceMotion ? undefined : { y: titleY, scale: titleScale }}
        >
          <h1 id="pp-intro-title">NIMDAL</h1>
          <p className="pp-kicker">PERSONAL PORTFOLIO</p>
          <p className="pp-intro-meta">
            {locale === "ko" ? "탁찬우" : "TAK CHANWOO"} / SEOUL / {new Date().getFullYear()}
          </p>
        </motion.div>

        <motion.figure
          className="pp-identity-orbit"
          style={reduceMotion ? undefined : { x: imageX, y: imageY, scale: imageScale, rotate: imageRotate }}
        >
          <Image
            src="/media/identity-octopus.jpg"
            alt={avatarAlt}
            fill
            priority
            sizes="(max-width: 720px) 78vw, 44vw"
          />
        </motion.figure>

        <motion.div className="pp-intro-detail" style={reduceMotion ? undefined : { opacity: detailOpacity }}>
          <p>RESEARCH / PRODUCT / KR GTM</p>
          <p className="pp-scroll-cue">SCROLL TO BEGIN <span aria-hidden /></p>
        </motion.div>

        <motion.div className="pp-intro-veil" style={reduceMotion ? undefined : { opacity: veilOpacity }} aria-hidden />
      </div>
    </section>
  );
}

function About({ locale, identity }: Pick<PersonalPortfolioHomeProps, "locale" | "identity">) {
  const reduceMotion = useHydrationSafeReducedMotion();

  return (
    <motion.section
      className="pp-about pp-scene"
      id="about"
      data-portfolio-scene="01"
      aria-labelledby="pp-about-title"
      initial={reduceMotion ? false : { y: 28 }}
      animate={reduceMotion ? { y: 0 } : undefined}
      whileInView={reduceMotion ? undefined : { y: 0 }}
      viewport={{ amount: 0.28 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="pp-about-heading">
        <p className="pp-scene-number">01 / 06</p>
        <h2 id="pp-about-title"><span>ABOUT</span><strong>NIMDAL</strong></h2>
      </div>

      <figure className="pp-about-portrait">
        <Image
          src="/media/operator-portrait.png"
          alt={identity.portraitAlt}
          fill
          sizes="(max-width: 820px) 82vw, 31vw"
        />
      </figure>

      <div className="pp-about-profile">
        <p className="pp-about-name">{identity.legalName.toUpperCase()}</p>
        <p className="pp-about-alias">/ NIMDAL</p>
        <dl>
          <div><dt>MODE</dt><dd>RESEARCH / PRODUCT / KR GTM</dd></div>
          <div><dt>BASE</dt><dd>SEOUL / KST</dd></div>
          <div><dt>ACTIVE</dt><dd>SINCE 2012</dd></div>
        </dl>
        <Link className="pp-inline-link" href={`/${locale}/portfolio`}>
          {locale === "ko" ? "전체 경력 보기" : "FULL DOSSIER"}<ArrowRight aria-hidden weight="bold" />
        </Link>
      </div>
    </motion.section>
  );
}

interface WorkFrameProps {
  project: PersonalProject;
  index: number;
  activeIndex: number;
  progress: MotionValue<number>;
  locale: Locale;
}

function WorkFrame({ project, index, activeIndex, progress, locale }: WorkFrameProps) {
  const [enter, settle, hold, exit] = workWindows[index];
  const opacity = useTransform(progress, [enter, settle, hold, exit], [index === 0 ? 0.16 : 0, 1, 1, index === 2 ? 1 : 0]);
  const scale = useTransform(progress, [enter, settle, hold, exit], [1.08, 1, 1, index === 2 ? 1 : 0.94]);
  const y = useTransform(progress, [enter, settle, hold, exit], ["8vh", "0vh", "0vh", index === 2 ? "0vh" : "-7vh"]);
  const clipPath = useTransform(
    progress,
    [enter, settle, hold, exit],
    ["inset(9% 13% 9% 13%)", "inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)", index === 2 ? "inset(0% 0% 0% 0%)" : "inset(8% 8% 8% 8%)"]
  );
  const isActive = index === activeIndex;

  return (
    <motion.article
      className={`pp-work-frame${isActive ? " is-active" : ""}`}
      style={{ opacity, scale, y, clipPath }}
      aria-hidden={!isActive}
    >
      <div className="pp-work-frame-copy">
        <p>{String(index + 1).padStart(2, "0")} / 03</p>
        <strong>{project.category}</strong>
        <h3>{project.title}</h3>
        <span>{project.status}</span>
        <Link tabIndex={isActive ? 0 : -1} href={`/${locale}/projects/${project.slug}`}>
          {locale === "ko" ? "프로젝트 보기" : "VIEW PROJECT"}<ArrowUpRight aria-hidden weight="bold" />
        </Link>
      </div>
      <div className="pp-work-frame-media">
        <Image src={project.src} alt={project.alt} fill sizes="72vw" />
      </div>
    </motion.article>
  );
}

function CinematicWork({ locale, projects }: Pick<PersonalPortfolioHomeProps, "locale" | "projects">) {
  const trackRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"]
  });
  const titleOpacity = useTransform(scrollYProgress, [0, 0.035, 0.11], [1, 1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.11], ["0vh", "-9vh"]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const nextIndex = sceneFromProgress(latest);
    setActiveIndex((current) => current === nextIndex ? current : nextIndex);
  });

  return (
    <section
      className="cinema-track pp-work-reel"
      id="work"
      ref={trackRef}
      data-portfolio-scene="02"
      aria-labelledby="pp-work-title"
    >
      <div className="pp-work-stage">
        <motion.div className="pp-work-opening" style={{ opacity: titleOpacity, y: titleY }}>
          <p className="pp-scene-number">02 / 06</p>
          <h2 id="pp-work-title"><span>SELECTED</span><strong>WORK</strong></h2>
          <p>NFT / RESEARCH / GAME</p>
        </motion.div>

        <div className="pp-work-frames">
          {projects.map((project, index) => (
            <WorkFrame
              key={project.slug}
              project={project}
              index={index}
              activeIndex={activeIndex}
              progress={scrollYProgress}
              locale={locale}
            />
          ))}
        </div>

        <div className="pp-work-reel-ui" aria-hidden>
          <span>{String(activeIndex + 1).padStart(2, "0")} / 03</span>
          <span>NIMDAL / SELECTED WORK</span>
        </div>
        <p className="pp-screen-reader-status" aria-live="polite">
          {projects[activeIndex].category}: {projects[activeIndex].title}
        </p>
      </div>
    </section>
  );
}

function StaticWork({ locale, projects }: Pick<PersonalPortfolioHomeProps, "locale" | "projects">) {
  return (
    <section
      className="cinema-static-story pp-work-static pp-scene"
      id="work"
      data-portfolio-scene="02"
      aria-labelledby="pp-work-static-title"
    >
      <header className="pp-static-work-heading">
        <p className="pp-scene-number">02 / 06</p>
        <h2 id="pp-work-static-title"><span>SELECTED</span><strong>WORK</strong></h2>
      </header>
      <div className="pp-static-work-list">
        {projects.map((project, index) => (
          <article className="cinema-static-scene pp-static-project" key={project.slug}>
            <div className="pp-static-project-copy">
              <p>{String(index + 1).padStart(2, "0")} / 03</p>
              <strong>{project.category}</strong>
              <h3>{project.title}</h3>
              <span>{project.status}</span>
            </div>
            <Link href={`/${locale}/projects/${project.slug}`} aria-label={`${project.title} — ${locale === "ko" ? "프로젝트 보기" : "View project"}`}>
              <Image
                src={project.src}
                alt={project.alt}
                fill
                sizes="(max-width: 900px) calc(100vw - 2rem), 31vw"
              />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function Career({
  locale,
  engagements,
  brands,
  signals
}: Pick<PersonalPortfolioHomeProps, "locale" | "engagements" | "brands" | "signals">) {
  const reduceMotion = useHydrationSafeReducedMotion();

  return (
    <section className="pp-career pp-scene" id="career" data-portfolio-scene="03" aria-labelledby="pp-career-title">
      <header className="pp-career-heading">
        <div>
          <p className="pp-scene-number">03 / 06</p>
          <h2 id="pp-career-title">CAREER</h2>
        </div>
        <Link className="pp-inline-link" href={`/${locale}/portfolio`}>
          {locale === "ko" ? "전체 경력 보기" : "FULL DOSSIER"}<ArrowUpRight aria-hidden weight="bold" />
        </Link>
      </header>

      <div className="pp-career-grid">
        <aside className="pp-career-signals" aria-label={locale === "ko" ? "경력 수치" : "Career signals"}>
          {signals.map((signal) => (
            <div key={`${signal.value}-${signal.label}`}>
              <strong>{signal.value}</strong>
              <span>{signal.label}</span>
              <small>PORTFOLIO CLAIM</small>
            </div>
          ))}
        </aside>

        <div className="pp-career-timeline">
          <p className="pp-career-column-label">
            {locale === "ko" ? "주요 조직 · 프로젝트" : "ORGANIZATIONS · ENGAGEMENTS"}
          </p>
          {engagements.map((item, index) => (
            <motion.article
              key={`${item.period}-${item.organization}`}
              initial={reduceMotion ? false : { opacity: 0, x: 28 }}
              animate={reduceMotion ? { opacity: 1, x: 0 } : undefined}
              whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.55, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <time>{item.period}</time>
              <div>
                <h3>{item.organization}</h3>
                <p>{item.relationship}</p>
                <span>{item.focus}</span>
              </div>
            </motion.article>
          ))}
        </div>

        <figure className="pp-career-portrait" aria-hidden>
          <Image src="/media/operator-portrait.png" alt="" fill sizes="28vw" />
        </figure>
      </div>

      <div className="pp-brand-rail">
        <p>{locale === "ko" ? "주요 고객 · 브랜드 프로젝트" : "SELECTED CLIENT · BRAND WORK"}</p>
        <div>
          {brands.map((brand) => (
            <article key={`${brand.period}-${brand.name}`}>
              <time>{brand.period}</time>
              <strong>{brand.name}</strong>
              <span>{brand.focus}</span>
            </article>
          ))}
        </div>
      </div>
      <p className="pp-career-note">
        {locale === "ko"
          ? "회사, 고객사, 프로젝트는 관계가 다릅니다. 각 항목의 관계를 함께 표시했습니다."
          : "Organizations, clients, and projects are different relationships. Each entry is labeled accordingly."}
      </p>
    </section>
  );
}

function Blog({ locale, posts }: Pick<PersonalPortfolioHomeProps, "locale" | "posts">) {
  return (
    <section className="pp-blog pp-scene" id="blog" data-portfolio-scene="04" aria-labelledby="pp-blog-title">
      <header>
        <p className="pp-scene-number">04 / 06</p>
        <h2 id="pp-blog-title">BLOG</h2>
        <Link className="pp-inline-link" href={`/${locale}/blog`}>
          {locale === "ko" ? "모든 글 보기" : "READ BLOG"}<ArrowRight aria-hidden weight="bold" />
        </Link>
      </header>
      <div className="pp-blog-list">
        {posts.map((post) => (
          <Link key={post.slug} href={`/${locale}/posts/${post.slug}`}>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span>{post.category}</span>
            <strong>{post.title}</strong>
            <small>{post.readingTime}</small>
            <ArrowUpRight aria-hidden weight="bold" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function Contact({ locale, email }: Pick<PersonalPortfolioHomeProps, "locale" | "email">) {
  return (
    <section className="pp-contact pp-scene" id="contact" data-portfolio-scene="05" aria-labelledby="pp-contact-title">
      <div className="pp-contact-title">
        <p className="pp-scene-number">05 / 06</p>
        <h2 id="pp-contact-title">CONTACT</h2>
        <p>END CREDITS</p>
      </div>
      <div className="pp-contact-links">
        <a className="pp-contact-email" href={`mailto:${email}`}>
          <span>EMAIL</span><strong>{email}</strong><ArrowUpRight aria-hidden weight="bold" />
        </a>
        <div>
          <a href="https://x.com/0xnimdal" target="_blank" rel="noreferrer"><span>X</span><strong>@0xnimdal</strong></a>
          <a href="https://t.me/nimdal" target="_blank" rel="noreferrer"><span>TELEGRAM</span><strong>@0xnimdal</strong></a>
          <a href="https://linkedin.com/in/chanwoo-tak-132b281a4" target="_blank" rel="noreferrer"><span>LINKEDIN</span><strong>NIMDAL</strong></a>
          <a href="/media/career/tak-chanwoo-nimdal-portfolio-v2.pdf" download><span>PDF</span><strong>{locale === "ko" ? "영문 포트폴리오" : "ENGLISH PORTFOLIO"}</strong><ArrowDown aria-hidden weight="bold" /></a>
          <p><span>TIMEZONE</span><strong>SEOUL / KST</strong></p>
        </div>
      </div>
    </section>
  );
}

export function PersonalPortfolioHome({
  locale,
  identity,
  projects,
  engagements,
  brands,
  signals,
  posts,
  email
}: PersonalPortfolioHomeProps) {
  const [activeScene, setActiveScene] = useState("00");
  const [cinematicMode, setCinematicMode] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(
      "(min-width: 901px) and (min-height: 641px) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    );
    const updateMode = () => setCinematicMode(query.matches);
    updateMode();
    query.addEventListener("change", updateMode);
    return () => query.removeEventListener("change", updateMode);
  }, []);

  useEffect(() => {
    const scenes = Array.from(document.querySelectorAll<HTMLElement>("[data-portfolio-scene]"));
    let frame = 0;
    const updateScene = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const probe = window.innerHeight * 0.46;
        const current = scenes.find((scene) => {
          const rect = scene.getBoundingClientRect();
          return rect.top <= probe && rect.bottom > probe;
        });
        const next = current?.dataset.portfolioScene;
        if (next) setActiveScene((value) => value === next ? value : next);
      });
    };

    updateScene();
    window.addEventListener("scroll", updateScene, { passive: true });
    window.addEventListener("resize", updateScene);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateScene);
      window.removeEventListener("resize", updateScene);
    };
  }, [cinematicMode]);

  const nav = locale === "ko"
    ? [
        ["ABOUT", "#about"],
        ["WORK", "#work"],
        ["CAREER", "#career"],
        ["BLOG", "#blog"],
        ["CONTACT", "#contact"]
      ]
    : [
        ["ABOUT", "#about"],
        ["WORK", "#work"],
        ["CAREER", "#career"],
        ["BLOG", "#blog"],
        ["CONTACT", "#contact"]
      ];

  return (
    <div className="pp-home">
      <header className="pp-masthead">
        <Link className="pp-home-link" href={`/${locale}`} aria-label={locale === "ko" ? "Nimdal 홈" : "Nimdal home"}>
          <span>{activeScene}</span> / 06
        </Link>
        <nav aria-label={locale === "ko" ? "주요 메뉴" : "Primary navigation"}>
          {nav.map(([label, href]) => <Link key={href} href={`/${locale}${href}`}>{label}</Link>)}
          <LocaleSwitch locale={locale} compact />
        </nav>
      </header>

      <main id="main-content">
        <Intro locale={locale} avatarAlt={identity.avatarAlt} />
        <About locale={locale} identity={identity} />
        {cinematicMode
          ? <CinematicWork locale={locale} projects={projects} />
          : <StaticWork locale={locale} projects={projects} />}
        <Career locale={locale} engagements={engagements} brands={brands} signals={signals} />
        <Blog locale={locale} posts={posts} />
        <Contact locale={locale} email={email} />
      </main>

      <footer className="pp-footer">
        <span>SEOUL / {new Date().getFullYear()}</span>
        <span>© NIMDAL. ALL RIGHTS RESERVED.</span>
        <span>THE END</span>
      </footer>
    </div>
  );
}
