import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { BlogCard, BlogHeader } from "@/components/blog/BlogIndex";
import { formatPostDate, getBlogPost, getBlogPosts } from "@/content/blog/posts";
import { absoluteBlogUrl, siteConfig } from "@/lib/site";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({
    slug: post.slug
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: `Post not found | ${siteConfig.blogName}`
    };
  }

  return {
    title: `${post.title} | ${siteConfig.blogName}`,
    description: post.description,
    alternates: {
      canonical: post.canonicalUrl
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: post.canonicalUrl,
      siteName: siteConfig.blogName,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [siteConfig.author],
      tags: [...post.tags],
      images: [
        {
          url: absoluteBlogUrl(post.cover),
          width: 1200,
          height: 630,
          alt: post.title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description
    }
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const Content = post.Content;
  const relatedPosts = getBlogPosts().filter((item) => item.slug !== post.slug).slice(0, 2);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: absoluteBlogUrl(post.cover),
    url: post.canonicalUrl,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: {
      "@type": "Person",
      name: siteConfig.author,
      url: siteConfig.mainUrl
    },
    publisher: {
      "@type": "Person",
      name: siteConfig.author
    },
    mainEntityOfPage: post.canonicalUrl
  };

  return (
    <div className="blog-shell">
      <div className="blog-water" aria-hidden />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogHeader />

      <main className="blog-post-main">
        <article className="blog-article">
          <header className="blog-article-header">
            <Link href="/blog" className="blog-back-link">
              Logbook
            </Link>
            <p className="blog-kicker">{post.category}</p>
            <h1>{post.title}</h1>
            <p>{post.description}</p>
            <div className="blog-meta">
              <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
              <span>{post.readingTime}</span>
            </div>
            <div className="blog-card-tags" aria-label={`${post.title} tags`}>
              {post.tagHrefs.map((tag) => (
                <Link key={tag.slug} href={tag.href}>
                  {tag.tag}
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
              sizes="(max-width: 900px) calc(100vw - 40px), 980px"
              className="blog-card-image"
            />
          </figure>

          <div className="blog-prose">
            <Content />
          </div>
        </article>

        {relatedPosts.length ? (
          <aside className="blog-related" aria-label="Related posts">
            <p className="blog-kicker">More Notes</p>
            {relatedPosts.map((item) => (
              <BlogCard key={item.slug} post={item} />
            ))}
          </aside>
        ) : null}
      </main>
    </div>
  );
}
