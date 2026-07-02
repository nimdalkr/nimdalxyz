import { Download } from "lucide-react";

export function SavePortfolioPdfButton() {
  return (
    <a
      className="career-print-button"
      href="/media/career/tak-chanwoo-nimdal-portfolio-v2.pdf"
      download="Tak_Chanwoo_Nimdal_Portfolio.pdf"
    >
      <Download size={15} aria-hidden />
      Save as PDF
    </a>
  );
}
