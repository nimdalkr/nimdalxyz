import { PortfolioExperience } from "@/components/PortfolioExperience";
import { PortfolioStructuredData } from "@/components/seo/PortfolioStructuredData";
import { portfolioData } from "@/lib/data";

export default function Home() {
  return (
    <>
      <PortfolioStructuredData data={portfolioData} />
      <PortfolioExperience />
    </>
  );
}
