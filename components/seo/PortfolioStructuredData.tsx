import { featuredProjectSlugs, type PortfolioContent } from "@/lib/data";

type Props = {
  data: PortfolioContent;
};

export function PortfolioStructuredData({ data }: Props) {
  const featuredProjectSet = new Set<string>(featuredProjectSlugs);
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: "Tak Chanwoo",
        alternateName: "Nimdal",
        url: "https://nimdal.xyz/",
        email: data.contact.email,
        image: "https://nimdal.xyz/media/operator-portrait.png",
        sameAs: ["https://x.com/0xnimdal", "https://blog.nimdal.xyz/"],
        knowsAbout: [
          "Web3 research",
          "marketing operations",
          "automation systems",
          "game-like product interfaces"
        ]
      },
      {
        "@type": "WebSite",
        name: "Nimdal",
        url: "https://nimdal.xyz/",
        description: data.profile.subheadline
      },
      ...data.caseStudies
        .filter((item) => featuredProjectSet.has(item.slug))
        .map((item) => ({
          "@type": "CreativeWork",
          name: item.client,
          headline: item.title,
          description: item.oneLiner,
          url: `https://nimdal.xyz/projects/${item.slug}/proof`,
          image: `https://nimdal.xyz${item.proofMedia?.[0]?.src ?? item.media.src}`,
          creator: {
            "@type": "Person",
            name: "Tak Chanwoo",
            alternateName: "Nimdal"
          },
          about: item.stack,
          keywords: [item.category, item.proofLevel, ...item.stack],
          workExample: item.artifacts?.map((artifact) => ({
            "@type": "CreativeWork",
            name: artifact.label,
            url: artifact.href
          })),
          isAccessibleForFree: true
        }))
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
