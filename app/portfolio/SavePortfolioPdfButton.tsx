"use client";

import { Download } from "lucide-react";

export function SavePortfolioPdfButton() {
  return (
    <button className="career-print-button" type="button" onClick={() => window.print()}>
      <Download size={15} aria-hidden />
      Save as PDF
    </button>
  );
}
