import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PortfolioExperience } from "@/components/PortfolioExperience";
import { PortfolioStructuredData } from "@/components/seo/PortfolioStructuredData";
import { portfolioData } from "@/lib/data";

const rooms = ["signal", "build", "proof", "next"] as const;

type Props = {
  params: Promise<{ slug: string; room: string }>;
};

function getProject(slug: string) {
  return portfolioData.caseStudies.find((project) => project.slug === slug);
}

function isRoom(room: string): room is (typeof rooms)[number] {
  return rooms.includes(room as (typeof rooms)[number]);
}

export function generateStaticParams() {
  return portfolioData.caseStudies.flatMap((project) =>
    rooms.map((room) => ({ slug: project.slug, room }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, room } = await params;
  const project = getProject(slug);

  if (!project || !isRoom(room)) {
    return {};
  }

  const title = `${project.client} ${room} room`;
  const description = `${project.oneLiner} Inspect the ${room} layer, current proof level, and stated limitations.`;
  const canonical = `/projects/${project.slug}/${room}`;
  const image = project.proofMedia?.[0]?.src ?? project.media.src;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      images: [{ url: image, alt: project.media.alt }]
    }
  };
}

export default async function ProjectRoomPage({ params }: Props) {
  const { slug, room } = await params;
  const project = getProject(slug);

  if (!project || !isRoom(room)) {
    notFound();
  }

  return (
    <>
      <PortfolioStructuredData data={portfolioData} />
      <PortfolioExperience initialProjectSlug={project.slug} initialRoomId={room} />
    </>
  );
}
