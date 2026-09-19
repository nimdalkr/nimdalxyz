import { Bricolage_Grotesque, IBM_Plex_Mono } from "next/font/google";

/**
 * The profile home's faces, kept apart from the BLOG's ink type system so the
 * home never loads its Korean serif @font-face sets. Bricolage carries the
 * page; the mono face only sets the skip link, so it is not preloaded.
 */
export const homeDisplay = Bricolage_Grotesque({
  variable: "--font-display",
  display: "swap",
  preload: true,
  subsets: ["latin"]
});

export const homeMono = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: "600",
  display: "swap",
  preload: false,
  subsets: ["latin"]
});
