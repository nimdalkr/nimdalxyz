import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://nimdal.xyz"),
  title: {
    default: "Nimdal / Tak Chanwoo - Web3 Research, Automation & Product Systems",
    template: "%s - Nimdal"
  },
  description:
    "Tak Chanwoo builds Web3 research tools, automation systems, marketing operations, and playful product interfaces through the Nimdal pixel-octopus identity.",
  alternates: {
    canonical: "/"
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" }
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png" }]
  },
  openGraph: {
    title: "Nimdal / Tak Chanwoo",
    description:
      "Web3 research tools, automation systems, marketing operations, and playful product interfaces.",
    type: "website",
    url: "https://nimdal.xyz/",
    siteName: "Nimdal",
    images: [
      {
        url: "/media/identity-octopus.jpg",
        width: 1024,
        height: 1024,
        alt: "Nimdal pixel octopus identity."
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Nimdal / Tak Chanwoo",
    description:
      "Web3 research tools, automation systems, marketing operations, and playful product interfaces.",
    images: ["/media/identity-octopus.jpg"]
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
