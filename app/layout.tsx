import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Nimdal | 탁찬우",
  description:
    "Web3, AI 자동화, 커뮤니티, 초기 제품 GTM을 다루는 그로스 마케터 탁찬우의 홈페이지."
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
