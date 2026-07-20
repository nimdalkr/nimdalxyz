import Image from "next/image";
import Link from "next/link";

import { BlogCard } from "@/components/blog/BlogCard";
import { BlogHeader } from "@/components/blog/BlogHeader";
import type {
  LocalizedBlogPost,
  LocalizedBlogTag
} from "@/content/blog/posts";
import { formatPostDate } from "@/content/blog/posts";
import { siteContent, type Locale } from "@/lib/content";
import { blogCanonicalUrl } from "@/lib/seo";

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
    personal: "개인 기록",
    tagged: "태그별 글",
    all: "전체",
    featured: "대표 글",
    latest: "최근 글",
    read: "본문 읽기",
    emptyTitle: "아직 공개한 글이 없습니다.",
    emptyBody: "이 태그로 쓴 글이 없습니다."
  },
  en: {
    personal: "Personal blog",
    tagged: "Tagged notes",
    all: "All",
    featured: "Featured post",
    latest: "Latest posts",
    read: "Read note",
    emptyTitle: "No published notes yet.",
    emptyBody: "There are no published notes for this tag."
  }
} as const;

export function BlogIndex({
  locale = "en",
  posts,
  tags,
  activeTag,
  hubHref = blogCanonicalUrl(locale),
  languagePath = "/",
  languageHref
}: BlogIndexProps) {
  const [featured, ...rest] = posts;
  const copy = siteContent[locale].blog;
  const ui = labels[locale];

  return (
    <div className="blog-shell">
      <BlogHeader
        locale={locale}
        hubHref={hubHref}
        languagePath={languagePath}
        languageHref={languageHref}
      />

      <main className="blog-main" id="main-content">
        <section className="blog-hero" aria-labelledby="blog-title">
          <div>
            <p className="blog-kicker">{activeTag ? ui.tagged : copy.eyebrow}</p>
            <h1 id="blog-title">{activeTag ?? copy.title}</h1>
          </div>
          <p>{copy.description}</p>
        </section>

        <nav className="blog-tag-row" aria-label={locale === "ko" ? "태그" : "Blog tags"}>
          <Link className={!activeTag ? "is-active" : undefined} href={hubHref}>
            {ui.all}
          </Link>
          {tags.map((tag) => (
            <Link
              key={tag.slug}
              className={activeTag === tag.label ? "is-active" : undefined}
              href={tag.canonicalUrl}
            >
              {tag.label}
              <span aria-label={locale === "ko" ? `글 ${tag.count}개` : `${tag.count} posts`}>
                {tag.count}
              </span>
            </Link>
          ))}
        </nav>

        {featured ? (
          <section className="blog-featured" aria-label={ui.featured}>
            <Link
              className="blog-featured-media"
              href={featured.canonicalUrl}
              aria-label={locale === "ko" ? `${featured.title} 글 읽기` : `Read ${featured.title}`}
            >
              <Image
                src={featured.cover}
                alt=""
                fill
                priority
                loading="eager"
                sizes="(max-width: 900px) calc(100vw - 40px), 47vw"
                className="blog-card-image"
              />
            </Link>
            <article className="blog-featured-copy">
              <p className="blog-kicker">{featured.category}</p>
              <h2>
                <Link href={featured.canonicalUrl}>{featured.title}</Link>
              </h2>
              <p>{featured.description}</p>
              <div className="blog-meta">
                <time dateTime={featured.publishedAt}>
                  {formatPostDate(featured.publishedAt, locale)}
                </time>
                <span>{featured.readingTime}</span>
              </div>
              <Link className="blog-read-link" href={featured.canonicalUrl}>
                {ui.read}
              </Link>
            </article>
          </section>
        ) : (
          <section className="blog-empty" aria-label={locale === "ko" ? "글 없음" : "No posts"}>
            <h2>{ui.emptyTitle}</h2>
            <p>{ui.emptyBody}</p>
          </section>
        )}

        {rest.length ? (
          <section className="blog-grid" aria-label={ui.latest}>
            {rest.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </section>
        ) : null}
      </main>
    </div>
  );
}

export { BlogCard, BlogHeader };
