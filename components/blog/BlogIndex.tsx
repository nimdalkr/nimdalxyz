import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";

import { BlogCard } from "@/components/blog/BlogCard";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { PixelEffects } from "@/components/pixel/PixelEffects";
import type {
  LocalizedBlogPost,
  LocalizedBlogTag
} from "@/content/blog/posts";
import { siteContent, type Locale } from "@/lib/content";
import { blogCanonicalUrl } from "@/lib/seo";

import styles from "./BlogSurface.module.css";

type BlogIndexProps = {
  locale?: Locale;
  posts: readonly LocalizedBlogPost[];
  tags: readonly LocalizedBlogTag[];
  activeTag?: string;
  hubHref?: string;
  languagePath?: string;
  languageHref?: string;
};

const labels = {
  ko: {
    all: "전체",
    featured: "대표 글",
    latest: "최신 글",
    read: "글 읽기",
    emptyTitle: "아직 공개한 글이 없습니다",
    emptyBody: "선택한 분류에는 공개된 글이 없습니다."
  },
  en: {
    all: "All",
    featured: "Featured",
    latest: "Latest",
    read: "Read article",
    emptyTitle: "No published articles yet",
    emptyBody: "There are no published articles in this category."
  }
} as const;

const categoryFilters = {
  ko: [
    { label: "경력 기록", tagLabels: ["경력", "경력 기록"] },
    { label: "제작 기록", tagLabels: ["제작 기록"] },
    { label: "리서치", tagLabels: ["리서치"] }
  ],
  en: [
    { label: "Career Notes", tagLabels: ["Career", "Career Notes"] },
    { label: "Build Log", tagLabels: ["Build Log"] },
    { label: "Research", tagLabels: ["Research"] }
  ]
} as const;

function archiveDate(value: string) {
  return value.replaceAll("-", ".");
}

export function BlogIndex({
  locale = "en",
  posts,
  tags,
  activeTag,
  hubHref = blogCanonicalUrl(locale),
  languagePath = "/",
  languageHref
}: BlogIndexProps) {
  const featured = posts.find((post) => post.slug === "research-tools-should-make-markets-readable") ?? posts[0];
  const copy = siteContent[locale].blog;
  const ui = labels[locale];
  const filters = categoryFilters[locale].flatMap((filter) => {
    const tag = tags.find((item) => filter.tagLabels.some((label) => item.label === label));
    return tag ? [{ ...filter, href: tag.canonicalUrl }] : [];
  });

  return (
    <div className={`${styles.shell} blog-surface`}>
      <PixelEffects />
      <BlogHeader
        locale={locale}
        hubHref={hubHref}
        languagePath={languagePath}
        languageHref={languageHref}
      />

      <main className={styles.main} id="main-content">
        <h1 className={styles.pageTitle} id="blog-title">{copy.title}</h1>

        <nav className={styles.filters} aria-label={locale === "ko" ? "글 분류" : "Article categories"}>
          <Link
            className={`${styles.filterLink} ${!activeTag ? styles.filterLinkActive : ""}`}
            href={hubHref}
            aria-current={!activeTag ? "page" : undefined}
          >
            {ui.all}
          </Link>
          {filters.map((filter) => {
            const isActive = activeTag ? filter.tagLabels.some((label) => label === activeTag) : false;
            return (
              <Link
                key={filter.label}
                className={`${styles.filterLink} ${isActive ? styles.filterLinkActive : ""}`}
                href={filter.href}
                aria-current={isActive ? "page" : undefined}
              >
                {filter.label}
              </Link>
            );
          })}
        </nav>

        {featured ? (
          <section className={styles.section} aria-labelledby="featured-title">
            <h2 className={styles.sectionLabel} id="featured-title">{ui.featured}</h2>
            <article className={styles.featured}>
              <Link
                className={styles.featuredMedia}
                href={featured.canonicalUrl}
                aria-label={locale === "ko" ? `${featured.title} 글 읽기` : `Read ${featured.title}`}
              >
                <Image
                  src={featured.cover}
                  alt=""
                  fill
                  priority
                  loading="eager"
                  sizes="(max-width: 720px) calc(100vw - 40px), (max-width: 900px) 52vw, 520px"
                  className={styles.image}
                />
              </Link>
              <div className={styles.featuredCopy}>
                <div className={styles.featuredMeta}>
                  <time dateTime={featured.publishedAt}>{archiveDate(featured.publishedAt)}</time>
                  <span>{featured.category}</span>
                </div>
                <h3 className={styles.featuredTitle}>
                  <Link href={featured.canonicalUrl}>{featured.title}</Link>
                </h3>
                <Link className={styles.readLink} href={featured.canonicalUrl}>
                  {ui.read}
                  <ArrowRight size={22} weight="regular" aria-hidden="true" />
                </Link>
              </div>
            </article>
          </section>
        ) : (
          <section className={`${styles.section} ${styles.empty}`} aria-label={locale === "ko" ? "글 없음" : "No posts"}>
            <h2>{ui.emptyTitle}</h2>
            <p>{ui.emptyBody}</p>
          </section>
        )}

        {posts.length ? (
          <section className={styles.section} aria-labelledby="latest-title">
            <h2 className={styles.sectionLabel} id="latest-title">{ui.latest}</h2>
            <div className={styles.archiveList}>
              {posts.map((post, index) => (
                <BlogCard
                  key={post.slug}
                  post={post}
                  highlighted={index === 0}
                  eager={post.slug === featured?.slug}
                />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

export { BlogCard, BlogHeader };
