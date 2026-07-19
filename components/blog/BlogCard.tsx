import Image from "next/image";
import Link from "next/link";

import type { LocalizedBlogPost } from "@/content/blog/posts";
import { formatPostDate } from "@/content/blog/posts";

export function BlogCard({ post }: { post: LocalizedBlogPost }) {
  const readLabel = post.locale === "ko" ? `${post.title} 읽기` : `Read ${post.title}`;

  return (
    <article className="blog-card">
      <Link className="blog-card-media" href={post.canonicalUrl} aria-label={readLabel}>
        <Image
          src={post.cover}
          alt=""
          fill
          sizes="(max-width: 900px) calc(100vw - 40px), 360px"
          className="blog-card-image"
        />
      </Link>
      <div className="blog-card-body">
        <div className="blog-card-topline">
          <span>{post.category}</span>
          <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt, post.locale)}</time>
        </div>
        <h2>
          <Link href={post.canonicalUrl}>{post.title}</Link>
        </h2>
        <p>{post.description}</p>
        <div className="blog-card-tags" aria-label={post.locale === "ko" ? "글 태그" : "Post tags"}>
          {post.tagLinks.map((tag) => (
            <Link key={tag.slug} href={tag.canonicalUrl}>
              {tag.label}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
