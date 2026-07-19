import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { BlogCard } from "@/components/blog/BlogCard";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  formatPostDate,
  getLocalizedBlogPost,
  getLocalizedBlogPosts
} from "@/content/blog/posts";
import { isLocale, locales, postSlugs } from "@/lib/content";
import {
  blogCanonicalUrl,
  metadataAlternates,
  openGraphLocaleByLocale
} from "@/lib/seo";
import { getMediaDimensions } from "@/lib/media";
import { siteConfig } from "@/lib/site";

type BlogPostPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

const labels = {
  ko: {
    back: "nimdalog로 돌아가기",
    tags: "글 태그",
    related: "다음으로 읽을 글",
    updated: "수정"
  },
  en: {
    back: "Back to nimdalog",
    tags: "Post tags",
    related: "Read next",
    updated: "Updated"
  }
} as const;

export function generateStaticParams() {
  return locales.flatMap((locale) => postSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;

  if (!isLocale(localeParam)) {
    return { title: `Post not found | ${siteConfig.blogName}` };
  }

  const locale = localeParam;
  const post = getLocalizedBlogPost(locale, slug);

  if (!post) {
    return { title: `Post not found | ${siteConfig.blogName}` };
  }

  const image = new URL(post.cover, siteConfig.blogUrl).toString();
  const imageDimensions = getMediaDimensions(post.cover);

  return {
    title: `${post.title} | ${siteConfig.blogName}`,
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
      images: [{ url: image, ...imageDimensions, alt: post.title }]
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
  const post = getLocalizedBlogPost(locale, slug);

  if (!post) {
    notFound();
  }

  const Content = post.Content;
  const relatedPosts = getLocalizedBlogPosts(locale)
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
    <div className="blog-shell">
      <StructuredData data={jsonLd} />
      <BlogHeader
        locale={locale}
        hubHref={blogCanonicalUrl(locale)}
        languagePath={`/posts/${post.slug}`}
      />

      <main className="blog-post-main" id="main-content">
        <article className="blog-article">
          <header className="blog-article-header">
            <Link href={blogCanonicalUrl(locale)} className="blog-back-link">
              {ui.back}
            </Link>
            <p className="blog-kicker">{post.category}</p>
            <h1>{post.title}</h1>
            <p>{post.description}</p>
            <div className="blog-meta">
              <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt, locale)}</time>
              <span>{post.readingTime}</span>
              {post.updatedAt !== post.publishedAt ? (
                <span>
                  {ui.updated} {formatPostDate(post.updatedAt, locale)}
                </span>
              ) : null}
            </div>
            <div className="blog-card-tags" aria-label={ui.tags}>
              {post.tagLinks.map((tag) => (
                <Link key={tag.slug} href={tag.canonicalUrl}>
                  {tag.label}
                </Link>
              ))}
            </div>
          </header>

          <figure className="blog-article-cover">
            <Image
              src={post.cover}
              alt=""
              fill
              priority
              loading="eager"
              sizes="(max-width: 900px) calc(100vw - 40px), 980px"
              className="blog-card-image"
            />
          </figure>

          <div className="blog-prose" style={{ maxWidth: "65ch" }}>
            <Content />
          </div>
        </article>

        {relatedPosts.length ? (
          <aside className="blog-related" aria-label={ui.related}>
            <p className="blog-kicker">{ui.related}</p>
            {relatedPosts.map((item) => (
              <BlogCard key={item.slug} post={item} />
            ))}
          </aside>
        ) : null}
      </main>
    </div>
  );
}
