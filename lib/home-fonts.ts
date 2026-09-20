import { Inter } from "next/font/google";

/**
 * The profile home sets type in the system face: San Francisco and Apple SD
 * Gothic Neo on Apple devices, which download nothing. Inter stands in for
 * San Francisco elsewhere; it is not preloaded, so Apple devices never fetch it.
 */
export const homeSans = Inter({
  variable: "--font-inter",
  display: "swap",
  preload: false,
  subsets: ["latin"]
});
