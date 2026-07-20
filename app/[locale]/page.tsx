import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegacyHashBridge } from "@/components/compat/LegacyHashBridge";
import {
  PersonalPortfolioHome,
  type PersonalProject
} from "@/components/home/CinematicSequence";
import { StructuredData } from "@/components/seo/StructuredData";
import { getLocalizedBlogPosts } from "@/content/blog/posts";
import { careerCases, isLocale, projects, siteContent, type Locale } from "@/lib/content";
import { absoluteCanonicalUrl, metadataAlternates, openGraphLocaleByLocale } from "@/lib/seo";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

function localeOrNotFound(value: string) {
  if (!isLocale(value)) notFound();
  return value;
}

function projectBySlug(slug: string) {
  const project = projects.find((item) => item.slug === slug);
  if (!project) throw new Error(`Missing project: ${slug}`);
  return project;
}

function personalProject(
  locale: Locale,
  slug: "alphaduo" | "hyperalphaduo" | "mylol",
  category: PersonalProject["category"]
): PersonalProject {
  const project = projectBySlug(slug);
  const copy = project.copy[locale];
  const media = slug === "mylol"
    ? project.media.find((item) => item.src.endsWith("mylol-draft.webp"))
    : project.media.find((item) => item.role === "proof");

  if (!media) throw new Error(`Missing proof image: ${slug}`);

  return {
    slug,
    title: copy.title,
    category,
    status: project.status === "live" ? "LIVE" : "PROTOTYPE",
    src: media.src,
    alt: media.alt[locale]
  };
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const locale = localeOrNotFound((await params).locale);
  const content = siteContent[locale];
  const canonical = absoluteCanonicalUrl(locale);

  return {
    title: content.seo.title,
    description: content.seo.description,
    alternates: metadataAlternates(locale),
    openGraph: {
      title: content.seo.title,
      description: content.seo.description,
      url: canonical,
      locale: openGraphLocaleByLocale[locale],
      type: "website",
      images: [{ url: "/media/identity-octopus.jpg", width: 400, height: 400, alt: content.home.identity.avatarAlt }]
    },
    twitter: { card: "summary", title: content.seo.title, description: content.seo.description, images: ["/media/identity-octopus.jpg"] }
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const locale = localeOrNotFound((await params).locale);
  const content = siteContent[locale];
  const identity = content.home.identity;
  const selectedProjects: [PersonalProject, PersonalProject, PersonalProject] = [
    personalProject(locale, "alphaduo", "NFT"),
    personalProject(locale, "hyperalphaduo", "RESEARCH"),
    personalProject(locale, "mylol", "GAME")
  ];
  const selectedSignals = [
    content.career.signals[1],
    content.career.signals[2],
    content.career.signals[3],
    content.career.signals[5]
  ].map((signal, index) => ({
    value: signal.value.split(" ")[0],
    label: ["YEARS", "CLIENTS", "CAMPAIGNS", "KOL NETWORK"][index]
  }));

  const careerCase = (id: string) => {
    const item = careerCases.find((career) => career.id === id);
    if (!item) throw new Error(`Missing career case: ${id}`);
    return item;
  };

  const nevada = careerCase("nevada-korea-marketing-lead");
  const community = careerCase("community-kol-campaigns");
  const mkr = careerCase("mkr-agency-operating-system");
  const leica = careerCase("leica-online-acquisition");
  const hospital = careerCase("busan-h-animal-hospital");
  const joya = careerCase("swiss-j-functional-shoes");
  const localizedPosts = await getLocalizedBlogPosts(locale);
  const engagements = [
    {
      period: nevada.period,
      organization: "1six.tech Inc. / NEVADA",
      relationship: "CLIENT · KR GTM",
      focus: "SEO / KOL / LOCALIZATION"
    },
    {
      period: community.period,
      organization: "071Labs / AlphaDuo",
      relationship: "WEB3 · COMMUNITY / KOL",
      focus: "CONTENT / COMMUNITY OPS"
    },
    {
      period: mkr.period,
      organization: "MKR",
      relationship: "AGENCY OPERATIONS",
      focus: "CLIENT OPS / CAMPAIGN SYSTEM"
    }
  ];
  const brands = [
    { period: leica.period, name: "Leica", focus: "ONLINE ACQUISITION" },
    { period: hospital.period, name: "H Animal Medical Center", focus: "LOCAL MARKETING" },
    { period: joya.period, name: "Joya / Swiss J", focus: "FUNCTIONAL FOOTWEAR" }
  ];
  const postPreviews = localizedPosts.map((post) => ({
    slug: post.slug,
    publishedAt: post.publishedAt,
    title: post.title,
    category: post.category,
    readingTime: post.readingTime
  }));

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Nimdal",
      url: absoluteCanonicalUrl(locale),
      inLanguage: locale,
      description: content.seo.description
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: identity.legalName,
      alternateName: "Nimdal",
      url: absoluteCanonicalUrl(locale, "/portfolio"),
      image: "https://nimdal.xyz/media/operator-portrait.png",
      email: `mailto:${content.home.contact.email}`,
      sameAs: ["https://x.com/0xnimdal", "https://t.me/nimdal", "https://linkedin.com/in/chanwoo-tak-132b281a4"]
    }
  ];

  return (
    <>
      <LegacyHashBridge locale={locale} />
      <StructuredData data={structuredData} />
      <PersonalPortfolioHome
        locale={locale}
        identity={identity}
        projects={selectedProjects}
        engagements={engagements}
        brands={brands}
        signals={selectedSignals}
        posts={postPreviews}
        email={content.home.contact.email}
      />
    </>
  );
}
