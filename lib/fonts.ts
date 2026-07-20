import { IBM_Plex_Mono, Noto_Sans_KR } from "next/font/google";

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
