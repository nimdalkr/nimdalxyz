import type { Metadata } from "next";

import "./globals.css";

const themeScript = `
(() => {
  const storageKey = "koriel-theme";
  const stored = window.localStorage.getItem(storageKey);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = stored === "light" || stored === "dark" ? stored : (prefersDark ? "dark" : "light");
  document.documentElement.dataset.theme = resolved;
})();
`;

export const metadata: Metadata = {
  title: "Nimdal | 탁찬우",
  description: "Terminal-inspired personal homepage for Nimdal, a growth marketer, GTM operator, and community builder."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
