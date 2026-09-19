import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { BlogIndex } from "@/components/blog/BlogIndex";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  getLocalizedBlogTags,
  getLocalizedPostsByTag,
  getLocalizedTagLabel
} from "@/content/blog/posts";
import { isLocale, locales } from "@/lib/content";
import {
  blogCanonicalUrl,
  metadataAlternates,
  openGraphLocaleByLocale
} from "@/lib/seo";
import { getMediaDimensions } from "@/lib/media";
import { siteConfig } from "@/lib/site";

type BlogTagPageProps = {
  params: Promise<{
    locale: string;
    tag: string;
  }>;
};

export async function generateStaticParams() {
  const localizedTags = await Promise.all(
    locales.map(async (locale) => ({ locale, tags: await getLocalizedBlogTags(locale) }))
  );

  return localizedTags.flatMap(({ locale, tags }) =>
    tags.map((tag) => ({ locale, tag: tag.slug }))
  );
}

export async function generateMetadata({ params }: BlogTagPageProps): Promise<Metadata> {
  const { locale: localeParam, tag } = await params;

  if (!isLocale(localeParam)) {
    return { title: "Tag not found" };
  }

  const locale = localeParam;
  const label = await getLocalizedTagLabel(locale, tag);

  if (!label) {
    return {
      title: locale === "ko"
        ? "태그를 찾을 수 없습니다"
        : "Tag not found"
    };
  }

  const description = locale === "ko"
    ? `블로그의 ‘${label}’ 태그 글입니다.`
    : `BLOG posts tagged ${label}.`;
  const canonicalUrl = blogCanonicalUrl(locale, `/tags/${tag}`);

  return {
    title: label,
    description,
    alternates: metadataAlternates(locale, `/tags/${tag}`, "blog"),
    openGraph: {
      title: `${label} | ${siteConfig.blogName}`,
      description,
      url: canonicalUrl,
      siteName: siteConfig.blogName,
      locale: openGraphLocaleByLocale[locale],
      type: "website",
      images: [{
        url: new URL("/media/identity-octopus.jpg", siteConfig.blogUrl).toString(),
        ...getMediaDimensions("/media/identity-octopus.jpg"),
        alt: locale === "ko" ? "Nimdal의 픽셀 문어 아이덴티티" : "Nimdal pixel octopus identity"
      }]
    },
    twitter: {
      card: "summary",
      title: `${label} | ${siteConfig.blogName}`,
      description,
      images: [new URL("/media/identity-octopus.jpg", siteConfig.blogUrl).toString()]
    }
  };
}

export default async function BlogTagPage({ params }: BlogTagPageProps) {
  const { locale: localeParam, tag } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam;
  const label = await getLocalizedTagLabel(locale, tag);

  if (!label) {
    notFound();
  }

  const [posts, tags] = await Promise.all([
    getLocalizedPostsByTag(locale, tag),
    getLocalizedBlogTags(locale)
  ]);
  const canonicalUrl = blogCanonicalUrl(locale, `/tags/${tag}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: label,
    url: canonicalUrl,
    inLanguage: locale,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: post.canonicalUrl,
        name: post.title
      }))
    }
  };

  return (
    <>
      <StructuredData data={jsonLd} />
      <BlogIndex
        locale={locale}
        posts={posts}
        tags={tags}
        activeTag={label}
        hubHref={blogCanonicalUrl(locale)}
        languagePath={`/tags/${tag}`}
      />
    </>
  );
}
