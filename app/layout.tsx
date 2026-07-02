import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://nimdal.xyz"),
  title: "Nimdal | Tak Chanwoo Portfolio",
  description:
    "The personal portfolio of Tak Chanwoo, also known as Nimdal, covering Web3 research tools, automation systems, games, and growth work.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" }
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png" }]
  },
  openGraph: {
    title: "Nimdal | Tak Chanwoo Portfolio",
    description:
      "An interactive personal portfolio for Web3 research tools, automation systems, games, and the Nimdal identity.",
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
