import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { BlogCard } from "@/components/blog/BlogCard";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogPostBody } from "@/components/blog/BlogPostBody";
import { PixelEffects } from "@/components/pixel/PixelEffects";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  formatPostDate,
  getBlogPostSlugs,
  getLocalizedBlogPost,
  getLocalizedBlogPosts
} from "@/content/blog/posts";
import { isLocale, locales } from "@/lib/content";
import {
  blogCanonicalUrl,
  metadataAlternates,
  openGraphLocaleByLocale
} from "@/lib/seo";
import { siteConfig } from "@/lib/site";

import styles from "@/components/blog/BlogSurface.module.css";

type BlogPostPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

const labels = {
  ko: {
    back: "블로그로 돌아가기",
    tags: "태그",
    related: "함께 읽을 글",
    updated: "수정일"
  },
  en: {
    back: "Back to BLOG",
    tags: "Post tags",
    related: "Read next",
    updated: "Updated"
  }
} as const;

export async function generateStaticParams() {
  const postSlugs = await getBlogPostSlugs();

  return locales.flatMap((locale) => postSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;

  if (!isLocale(localeParam)) {
    return { title: "Post not found" };
  }

  const locale = localeParam;
  const post = await getLocalizedBlogPost(locale, slug);

  if (!post) {
    return {
      title: locale === "ko"
        ? "글을 찾을 수 없습니다"
        : "Post not found"
    };
  }

  const image = new URL(post.cover, siteConfig.blogUrl).toString();

  return {
    title: post.title,
    description: post.description,
    alternates: metadataAlternates(locale, `/posts/${post.slug}`, "blog"),
    openGraph: {
      title: post.title,
      description: post.description,
      url: post.canonicalUrl,
      siteName: siteConfig.blogName,
      locale: openGraphLocaleByLocale[locale],
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [siteConfig.author],
      tags: [...post.tags],
      images: [{
        url: image,
        width: post.coverWidth,
        height: post.coverHeight,
        alt: post.title
      }]
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [image]
    }
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale: localeParam, slug } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam;
  const post = await getLocalizedBlogPost(locale, slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = (await getLocalizedBlogPosts(locale))
    .filter((item) => item.slug !== post.slug)
    .slice(0, 2);
  const ui = labels[locale];
  const image = new URL(post.cover, siteConfig.blogUrl).toString();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image,
    url: post.canonicalUrl,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    inLanguage: locale,
    author: {
      "@type": "Person",
      name: siteConfig.author,
      url: `${siteConfig.mainUrl}/${locale}/portfolio`
    },
    publisher: {
      "@type": "Person",
      name: siteConfig.author
    },
    mainEntityOfPage: post.canonicalUrl
  };

  return (
    <div className={`${styles.shell} blog-surface`}>
      <PixelEffects />
      <StructuredData data={jsonLd} />
      <BlogHeader
        locale={locale}
        hubHref={blogCanonicalUrl(locale)}
        languagePath={`/posts/${post.slug}`}
      />

      <main className={styles.articleMain} id="main-content">
        <article className={styles.article}>
          <header className={styles.articleHeader}>
            <Link href={blogCanonicalUrl(locale)} className={styles.backLink}>
              <ArrowRight size={18} weight="regular" aria-hidden="true" />
              {ui.back}
            </Link>
            <p className={styles.articleKicker}>{post.category}</p>
            <h1 className={styles.articleTitle}>{post.title}</h1>
            <p className={styles.articleDescription}>{post.description}</p>
            <div className={styles.articleMeta}>
              <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt, locale)}</time>
              <span>{post.readingTime}</span>
              {post.updatedAt !== post.publishedAt ? (
                <span>
                  {ui.updated} {formatPostDate(post.updatedAt, locale)}
                </span>
              ) : null}
            </div>
            <div className={styles.tagList} aria-label={ui.tags}>
              {post.tagLinks.map((tag) => (
                <Link key={tag.slug} href={tag.canonicalUrl}>
                  {tag.label}
                </Link>
              ))}
            </div>
          </header>

          <figure className={styles.articleCover}>
            <Image
              src={post.cover}
              alt=""
              fill
              priority
              loading="eager"
              sizes="(max-width: 900px) calc(100vw - 40px), 980px"
              className={styles.image}
            />
          </figure>

          <div className={styles.prose}>
            <BlogPostBody load={post.body} />
          </div>
        </article>

        {relatedPosts.length ? (
          <aside className={styles.related} aria-labelledby="related-title">
            <h2 className={styles.relatedTitle} id="related-title">{ui.related}</h2>
            <div className={styles.relatedList}>
              {relatedPosts.map((item) => (
                <BlogCard key={item.slug} post={item} />
              ))}
            </div>
          </aside>
        ) : null}
      </main>
    </div>
  );
}
