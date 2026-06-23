import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Nimdal | Signal Engine",
  description:
    "A cinematic, strategy-first marketing portfolio for Web3 launches, Web2 growth systems, positioning, funnels, community, and performance creative.",
  openGraph: {
    title: "Nimdal | Signal Engine",
    description:
      "Growth marketer for launches, communities, funnels, and demand systems that need proof instead of noise.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
