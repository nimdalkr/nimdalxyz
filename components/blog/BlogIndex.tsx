import Image from "next/image";
import Link from "next/link";

import type { BlogPost, BlogTag } from "@/content/blog/posts";
import { formatPostDate } from "@/content/blog/posts";
import { siteConfig } from "@/lib/site";

type BlogIndexProps = {
  posts: readonly BlogPost[];
  tags: readonly BlogTag[];
  activeTag?: string;
};

export function BlogHeader() {
  return (
    <header className="blog-header">
      <Link className="blog-brand" href="/blog" aria-label="Open nimdalog">
        <Image src="/media/identity-octopus.jpg" alt="" width={42} height={42} className="blog-brand-mark" />
        <span>
          <strong>nimdalog</strong>
        </span>
      </Link>
      <nav className="blog-nav" aria-label="Blog navigation">
        <Link href={siteConfig.mainUrl}>Home</Link>
        <Link href={`${siteConfig.mainUrl}/portfolio`}>Portfolio</Link>
        <Link href="/rss.xml">RSS</Link>
      </nav>
    </header>
  );
}

export function BlogIndex({ posts, tags, activeTag }: BlogIndexProps) {
  const [featured, ...rest] = posts;

  return (
    <div className="blog-shell">
      <div className="blog-water" aria-hidden />
      <BlogHeader />

      <main className="blog-main">
        <section className="blog-hero" aria-labelledby="blog-title">
          <div>
            <p className="blog-kicker">{activeTag ? "Tagged Notes" : "Personal Blog"}</p>
            <h1 id="blog-title">{activeTag ? activeTag : siteConfig.blogName}</h1>
          </div>
          <p>
            Notes from Tak Chanwoo / Nimdal on Web3 research, product systems, campaign operations,
            automation, and the work behind personal builds.
          </p>
        </section>

        <section className="blog-tag-row" aria-label="Blog tags">
          <Link className={!activeTag ? "is-active" : undefined} href="/blog">
            All
          </Link>
          {tags.map((tag) => (
            <Link key={tag.slug} className={activeTag === tag.label ? "is-active" : undefined} href={tag.href}>
              {tag.label}
              <span>{tag.count}</span>
            </Link>
          ))}
        </section>

        {featured ? (
          <section className="blog-featured" aria-label="Featured post">
            <Link className="blog-featured-media" href={featured.href} aria-label={`Read ${featured.title}`}>
              <Image
                src={featured.cover}
                alt=""
                fill
                priority
                sizes="(max-width: 900px) calc(100vw - 40px), 47vw"
                className="blog-card-image"
              />
            </Link>
            <article className="blog-featured-copy">
              <p className="blog-kicker">{featured.category}</p>
              <h2>
                <Link href={featured.href}>{featured.title}</Link>
              </h2>
              <p>{featured.description}</p>
              <div className="blog-meta">
                <time dateTime={featured.publishedAt}>{formatPostDate(featured.publishedAt)}</time>
                <span>{featured.readingTime}</span>
              </div>
              <Link className="blog-read-link" href={featured.href}>
                Read note
              </Link>
            </article>
          </section>
        ) : (
          <section className="blog-empty" aria-label="No posts">
            <h2>No notes yet.</h2>
            <p>nimdalog is ready, but this tag does not have any published posts yet.</p>
          </section>
        )}

        {rest.length ? (
          <section className="blog-grid" aria-label="Latest posts">
            {rest.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </section>
        ) : null}
      </main>
    </div>
  );
}

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="blog-card">
      <Link className="blog-card-media" href={post.href} aria-label={`Read ${post.title}`}>
        <Image src={post.cover} alt="" fill sizes="(max-width: 900px) calc(100vw - 40px), 360px" className="blog-card-image" />
      </Link>
      <div className="blog-card-body">
        <div className="blog-card-topline">
          <span>{post.category}</span>
          <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
        </div>
        <h2>
          <Link href={post.href}>{post.title}</Link>
        </h2>
        <p>{post.description}</p>
        <div className="blog-card-tags" aria-label={`${post.title} tags`}>
          {post.tagHrefs.map((tag) => (
            <Link key={tag.slug} href={tag.href}>
              {tag.tag}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
