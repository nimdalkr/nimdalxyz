import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { BlogIndex } from "@/components/blog/BlogIndex";
import { getBlogTags, getPostsByTag, getTagLabel } from "@/content/blog/posts";
import { absoluteBlogUrl, siteConfig } from "@/lib/site";

type BlogTagPageProps = {
  params: Promise<{
    tag: string;
  }>;
};

export function generateStaticParams() {
  return getBlogTags().map((tag) => ({
    tag: tag.slug
  }));
}

export async function generateMetadata({ params }: BlogTagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const label = getTagLabel(tag);

  if (!label) {
    return {
      title: `Tag not found | ${siteConfig.blogName}`
    };
  }

  return {
    title: `${label} Notes | ${siteConfig.blogName}`,
    description: `Nimdal Logbook posts tagged ${label}.`,
    alternates: {
      canonical: absoluteBlogUrl(`/tags/${tag}`)
    },
    openGraph: {
      title: `${label} Notes | ${siteConfig.blogName}`,
      description: `Nimdal Logbook posts tagged ${label}.`,
      url: absoluteBlogUrl(`/tags/${tag}`),
      siteName: siteConfig.blogName,
      type: "website"
    }
  };
}

export default async function BlogTagPage({ params }: BlogTagPageProps) {
  const { tag } = await params;
  const label = getTagLabel(tag);

  if (!label) {
    notFound();
  }

  return <BlogIndex posts={getPostsByTag(tag)} tags={getBlogTags()} activeTag={label} />;
}
