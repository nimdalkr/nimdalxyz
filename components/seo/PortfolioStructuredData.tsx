import type { PortfolioContent } from "@/lib/data";

type Props = {
  data: PortfolioContent;
};

export function PortfolioStructuredData({ data }: Props) {
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
      ...data.caseStudies.map((item) => ({
        "@type": "CreativeWork",
        name: item.client,
        headline: item.title,
        description: item.oneLiner,
        url: item.href ?? `https://nimdal.xyz/#project-${item.slug}`,
        creator: {
          "@type": "Person",
          name: "Tak Chanwoo",
          alternateName: "Nimdal"
        },
        about: item.stack,
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
