import { Bricolage_Grotesque, IBM_Plex_Mono, Nanum_Myeongjo, Noto_Serif_KR } from "next/font/google";

/**
 * The Ink Records type system.
 *
 * The page is a document written in ink, so Korean is set in myeongjo rather
 * than a UI gothic: the thick-thin contrast and the entasis on every stem are
 * what a brush leaves behind, and they answer the drawn strokes on the page.
 * Nanum Myeongjo carries the headlines, Noto Serif KR the reading text, and
 * the mono stays for stamped labels and figures.
 *
 * Only Bricolage is preloaded. The production build preloads every
 * `preload: true` face on every route, including the profile home, which
 * never sets these; the serif and mono faces load from their @font-face
 * rules instead.
 */
export const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  display: "swap",
  preload: true,
  subsets: ["latin"]
});

export const nanumMyeongjo = Nanum_Myeongjo({
  variable: "--font-display-kr",
  weight: ["700", "800"],
  display: "swap",
  preload: false,
  subsets: ["latin"]
});

export const notoSerifKr = Noto_Serif_KR({
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
  subsets: ["latin"]
});

export const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  display: "swap",
  preload: false,
  subsets: ["latin"]
});
