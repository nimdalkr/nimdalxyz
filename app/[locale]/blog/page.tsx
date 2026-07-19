import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { BlogIndex } from "@/components/blog/BlogIndex";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  getLocalizedBlogPosts,
  getLocalizedBlogTags
} from "@/content/blog/posts";
import { isLocale, siteContent } from "@/lib/content";
import {
  absoluteCanonicalUrl,
  blogCanonicalUrl,
  blogHubMetadataAlternates,
  canonicalSurfaceFromHeader,
  canonicalSurfaceHeader,
  openGraphLocaleByLocale
} from "@/lib/seo";
import { getMediaDimensions } from "@/lib/media";
import { siteConfig } from "@/lib/site";

type BlogHubPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: BlogHubPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return { title: `nimdalog | ${siteConfig.name}` };
  }

  const locale = localeParam;
  const surface = canonicalSurfaceFromHeader((await headers()).get(canonicalSurfaceHeader));
  const copy = siteContent[locale].blog;
  const url = surface === "blog"
    ? blogCanonicalUrl(locale)
    : absoluteCanonicalUrl(locale, "/blog", "main");
  const image = new URL("/media/identity-octopus.jpg", siteConfig.blogUrl).toString();
  const imageDimensions = getMediaDimensions("/media/identity-octopus.jpg");

  return {
    title: `${copy.title} | Nimdal`,
    description: copy.description,
    alternates: blogHubMetadataAlternates(locale, surface),
    openGraph: {
      title: `${copy.title} | Nimdal`,
      description: copy.description,
      url,
      siteName: siteConfig.blogName,
      locale: openGraphLocaleByLocale[locale],
      type: "website",
      images: [{ url: image, ...imageDimensions, alt: "Nimdal pixel octopus identity" }]
    },
    twitter: {
      card: "summary",
      title: `${copy.title} | Nimdal`,
      description: copy.description,
      images: [image]
    }
  };
}

export default async function BlogHubPage({ params }: BlogHubPageProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam;
  const surface = canonicalSurfaceFromHeader((await headers()).get(canonicalSurfaceHeader));
  const posts = getLocalizedBlogPosts(locale);
  const tags = getLocalizedBlogTags(locale);
  const hubHref = surface === "blog"
    ? blogCanonicalUrl(locale)
    : absoluteCanonicalUrl(locale, "/blog", "main");
  const alternateLocale = locale === "ko" ? "en" : "ko";
  const languageHref = surface === "blog"
    ? blogCanonicalUrl(alternateLocale)
    : absoluteCanonicalUrl(alternateLocale, "/blog", "main");
  const copy = siteContent[locale].blog;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: copy.title,
    url: hubHref,
    description: copy.description,
    inLanguage: locale,
    author: {
      "@type": "Person",
      name: siteConfig.author,
      url: `${siteConfig.mainUrl}/${locale}/portfolio`
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: post.canonicalUrl,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      inLanguage: locale
    }))
  };

  return (
    <>
      <StructuredData data={jsonLd} />
      <BlogIndex
        locale={locale}
        posts={posts}
        tags={tags}
        hubHref={hubHref}
        languageHref={languageHref}
      />
    </>
  );
}
