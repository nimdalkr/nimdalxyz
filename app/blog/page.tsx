import type { Metadata } from "next";

import { BlogIndex } from "@/components/blog/BlogIndex";
import { getBlogPosts, getBlogTags } from "@/content/blog/posts";
import { absoluteBlogUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `${siteConfig.blogName} | Tak Chanwoo / Nimdal`,
  description: siteConfig.description,
  alternates: {
    canonical: absoluteBlogUrl("/")
  },
  openGraph: {
    title: `${siteConfig.blogName} | Tak Chanwoo / Nimdal`,
    description: siteConfig.description,
    url: absoluteBlogUrl("/"),
    siteName: siteConfig.blogName,
    type: "website",
    images: [
      {
        url: absoluteBlogUrl("/media/identity-octopus.jpg"),
        width: 1200,
        height: 630,
        alt: "Nimdal Logbook"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.blogName} | Tak Chanwoo / Nimdal`,
    description: siteConfig.description
  }
};

export default function BlogPage() {
  const posts = getBlogPosts();
  const tags = getBlogTags();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: siteConfig.blogName,
    url: absoluteBlogUrl("/"),
    description: siteConfig.description,
    author: {
      "@type": "Person",
      name: siteConfig.author,
      url: siteConfig.mainUrl
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: post.canonicalUrl,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt ?? post.publishedAt
    }))
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogIndex posts={posts} tags={tags} />
    </>
  );
}
