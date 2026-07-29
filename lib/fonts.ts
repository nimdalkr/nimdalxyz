import { Bricolage_Grotesque, Gothic_A1, IBM_Plex_Mono, Noto_Sans_KR } from "next/font/google";

/**
 * Riso Press type system.
 *
 * Display is a grotesque with print-era character rather than a UI neutral. Korean
 * display gets its own face because Bricolage carries no Hangul, and a bilingual
 * headline must not silently drop to the body weight.
 */
export const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  display: "swap",
  preload: true,
  subsets: ["latin"]
});

export const gothicA1 = Gothic_A1({
  variable: "--font-display-kr",
  weight: ["700", "800"],
  display: "swap",
  preload: false,
  subsets: ["latin"]
});

export const notoSansKr = Noto_Sans_KR({
  variable: "--font-sans",
  weight: ["400", "500", "700", "900"],
  display: "swap",
  preload: true,
  subsets: ["latin"]
});

export const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  display: "swap",
  preload: true,
  subsets: ["latin"]
});
