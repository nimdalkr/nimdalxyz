"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { profileContent, type BrandChapterId, type BrandVisualKind } from "@/data/profile";

const DROPBOX_EASE = [0.65, 0, 0.45, 1] as const;

const tileOffsets = [
  { x: -96, y: -128 },
  { x: 104, y: -120 },
  { x: -40, y: -88 },
  { x: 132, y: -20 },
  { x: -128, y: 42 },
  { x: 72, y: 108 },
  { x: -72, y: 132 },
  { x: 118, y: 118 }
];

export function EditorialHome() {
  const shouldReduceMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState<BrandChapterId>("framework");

  const featuredProjects = useMemo(() => {
    const featuredNames = new Set(["nomorenaver", "daltacks", "ethosalpha", "nimdalcraft"]);
    return profileContent.projects.filter((project) => featuredNames.has(project.name.toLowerCase()));
  }, []);

  useEffect(() => {
    const sectionNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-brand-section]"));
    let frame = 0;

    const updateActiveSection = () => {
      const marker = Math.min(window.innerHeight * 0.35, 260);
      const current = sectionNodes.find((node) => {
        const rect = node.getBoundingClientRect();
        return rect.top <= marker && rect.bottom > marker;
      });

      if (current) {
        setActiveSection(current.id as BrandChapterId);
      }
    };

    const onScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <main className="brand-system">
      <header className="brand-topbar">
        <a className="brand-wordmark" href="#top" aria-label="Nimdal home">
          <span>{profileContent.nameEn}</span>
          <span>{profileContent.nameKo}</span>
        </a>
        <nav className="brand-topbar__nav" aria-label="홈 섹션">
          {profileContent.brandTiles.map((tile) => (
            <a
              key={tile.id}
              href={`#${tile.chapterId}`}
              className={activeSection === tile.chapterId ? "is-active" : undefined}
            >
              {tile.label}
            </a>
          ))}
        </nav>
      </header>

      <section id="top" className="brand-hero" aria-labelledby="hero-heading">
        <motion.div
          className="brand-hero__copy"
          initial={shouldReduceMotion ? false : { y: 24 }}
          animate={{ y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease: DROPBOX_EASE }}
        >
          <p className="brand-quote">"{profileContent.brandIntro.quote}"</p>
          <h1 id="hero-heading">{profileContent.brandIntro.headline}</h1>
          <div className="brand-hero__thesis">
            <p>{profileContent.brandIntro.thesisKo}</p>
            <p>{profileContent.brandIntro.thesisEn}</p>
          </div>
          <dl className="brand-meta">
            <div>
              <dt>이름</dt>
              <dd>{profileContent.nameKo}</dd>
            </div>
            <div>
              <dt>위치</dt>
              <dd>{profileContent.location}</dd>
            </div>
            <div>
              <dt>지금</dt>
              <dd>{profileContent.brandIntro.status}</dd>
            </div>
          </dl>
        </motion.div>

        <div className="brand-tile-grid" aria-label="Nimdal 소개 섹션">
          {profileContent.brandTiles.map((tile, index) => {
            const offset = tileOffsets[index % tileOffsets.length];

            return (
              <motion.a
                key={tile.id}
                href={`#${tile.chapterId}`}
                className={`brand-tile brand-tile--${tile.color}`}
                initial={
                  shouldReduceMotion
                    ? false
                    : {
                        scale: 1.18,
                        x: offset.x,
                        y: offset.y,
                        rotate: index % 2 === 0 ? -2.5 : 2.5
                  }
                }
                animate={{ scale: 1, x: 0, y: 0, rotate: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.82,
                  delay: shouldReduceMotion ? 0 : index * 0.06,
                  ease: DROPBOX_EASE
                }}
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                        y: -8,
                        scale: 1.018,
                        transition: { duration: 0.35, ease: DROPBOX_EASE }
                      }
                }
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                <span className="brand-tile__index">{String(index + 1).padStart(2, "0")}</span>
                <TileVisual kind={tile.visualKind} />
                <span className="brand-tile__label">{tile.label}</span>
                <span className="brand-tile__summary">{tile.summary}</span>
              </motion.a>
            );
          })}
        </div>
      </section>

      <div className="brand-chapters">
        {profileContent.brandChapters.map((chapter, index) => (
          <motion.section
            key={chapter.id}
            id={chapter.id}
            data-brand-section
            className={`brand-chapter brand-chapter--${chapter.id}`}
            initial={shouldReduceMotion ? false : { y: 52, scale: 0.985 }}
            whileInView={{ y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.28 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.72,
              ease: DROPBOX_EASE,
              delay: shouldReduceMotion ? 0 : Math.min(index * 0.02, 0.1)
            }}
          >
            <div className="chapter-heading">
              <p>{chapter.eyebrow}</p>
              <h2>{chapter.title}</h2>
            </div>
            <div className="chapter-content">
              <div className="chapter-copy">
                {chapter.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div className="chapter-proof">
                <span>{chapter.proofLabel}</span>
                <ul>
                  {chapter.proof.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            {chapter.id === "work" ? <WorkShowcase projects={featuredProjects} /> : null}
            {chapter.id === "resume" ? <ResumeSnapshot /> : null}
            {chapter.id === "links" ? <ContactPanel /> : null}
          </motion.section>
        ))}
      </div>
    </main>
  );
}

function WorkShowcase({ projects }: { projects: typeof profileContent.projects }) {
  return (
    <div className="work-showcase">
      {projects.map((project, index) => (
        <a
          key={project.name}
          className="work-card"
          href={project.href ?? "#"}
          target={project.href ? "_blank" : undefined}
          rel={project.href ? "noreferrer" : undefined}
        >
          <span className="work-card__number">{String(index + 1).padStart(2, "0")}</span>
          <div>
            <p>{project.type} / {project.modified}</p>
            <h3>{project.name}</h3>
            <span>{project.description}</span>
          </div>
        </a>
      ))}
    </div>
  );
}

function ResumeSnapshot() {
  return (
    <div className="resume-grid">
      {profileContent.resumeSections.map((section, index) => (
        <details key={section.title} className="resume-panel" open={index < 2}>
          <summary>
            <span>{section.title}</span>
            <span>펼치기</span>
          </summary>
          <div className="resume-panel__lines">
            {section.lines.map((line, lineIndex) =>
              line ? (
                <p key={`${section.title}-${lineIndex}`}>{line}</p>
              ) : (
                <div key={`${section.title}-${lineIndex}`} className="resume-panel__space" />
              )
            )}
          </div>
        </details>
      ))}
    </div>
  );
}

function ContactPanel() {
  return (
    <div className="contact-panel">
      <div className="contact-panel__portrait">
        {profileContent.avatarSrc ? (
          <Image
            src={profileContent.avatarSrc}
            alt={`${profileContent.nameEn} portrait`}
            fill
            sizes="(max-width: 760px) 160px, 220px"
            className="contact-panel__image"
          />
        ) : (
          <span>{profileContent.avatarFallback}</span>
        )}
      </div>
      <div className="link-grid">
        {profileContent.links.map((link) => (
          <a
            key={link.id}
            className="link-tile"
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noreferrer" : undefined}
          >
            <span>{link.label}</span>
            <strong>{link.displayText}</strong>
          </a>
        ))}
      </div>
    </div>
  );
}

function TileVisual({ kind }: { kind: BrandVisualKind }) {
  switch (kind) {
    case "framework":
      return (
        <svg className="tile-visual tile-visual--framework" viewBox="0 0 160 120" aria-hidden="true">
          <path className="tile-visual__line" d="M18 94 C48 12 110 12 142 92" />
          <circle cx="18" cy="94" r="10" />
          <circle cx="80" cy="32" r="10" />
          <circle cx="142" cy="92" r="10" />
        </svg>
      );
    case "growth":
      return (
        <svg className="tile-visual tile-visual--growth" viewBox="0 0 160 120" aria-hidden="true">
          <rect x="22" y="68" width="20" height="34" />
          <rect x="62" y="48" width="20" height="54" />
          <rect x="102" y="24" width="20" height="78" />
          <path className="tile-visual__line" d="M24 42 L67 28 L110 14 L138 26" />
          <path d="M130 14 L138 26 L122 28" />
        </svg>
      );
    case "web3":
      return (
        <svg className="tile-visual tile-visual--web3" viewBox="0 0 160 120" aria-hidden="true">
          <path className="tile-visual__line" d="M36 62 L80 28 L126 62 L80 96 Z" />
          <circle cx="36" cy="62" r="12" />
          <circle cx="80" cy="28" r="12" />
          <circle cx="126" cy="62" r="12" />
          <circle cx="80" cy="96" r="12" />
        </svg>
      );
    case "automation":
      return (
        <svg className="tile-visual tile-visual--automation" viewBox="0 0 160 120" aria-hidden="true">
          <path className="tile-visual__line" d="M24 28 H72 V58 H124 V92" />
          <rect x="16" y="16" width="32" height="24" />
          <rect x="64" y="46" width="32" height="24" />
          <rect x="112" y="80" width="32" height="24" />
          <circle cx="124" cy="28" r="14" />
        </svg>
      );
    case "community":
      return (
        <svg className="tile-visual tile-visual--community" viewBox="0 0 160 120" aria-hidden="true">
          <circle className="tile-visual__line" cx="80" cy="60" r="42" />
          <circle cx="80" cy="60" r="16" />
          <circle cx="38" cy="60" r="10" />
          <circle cx="122" cy="60" r="10" />
          <circle cx="80" cy="18" r="10" />
          <circle cx="80" cy="102" r="10" />
        </svg>
      );
    case "work":
      return (
        <svg className="tile-visual tile-visual--work" viewBox="0 0 160 120" aria-hidden="true">
          <rect x="24" y="24" width="78" height="54" />
          <rect x="58" y="42" width="78" height="54" />
          <path className="tile-visual__line" d="M36 40 H88 M36 56 H74 M70 58 H124 M70 74 H112" />
        </svg>
      );
    case "resume":
      return (
        <svg className="tile-visual tile-visual--resume" viewBox="0 0 160 120" aria-hidden="true">
          <rect x="34" y="18" width="92" height="84" />
          <path className="tile-visual__line" d="M52 42 H108 M52 60 H112 M52 78 H92" />
          <circle cx="52" cy="30" r="6" />
        </svg>
      );
    case "links":
      return (
        <svg className="tile-visual tile-visual--links" viewBox="0 0 160 120" aria-hidden="true">
          <path className="tile-visual__line" d="M34 86 L80 34 L126 86" />
          <path d="M76 34 H80 V38" />
          <circle cx="34" cy="86" r="12" />
          <circle cx="80" cy="34" r="12" />
          <circle cx="126" cy="86" r="12" />
        </svg>
      );
  }
}
