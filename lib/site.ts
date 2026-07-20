export const siteConfig = {
  mainUrl: "https://nimdal.xyz",
  blogUrl: "https://blog.nimdal.xyz",
  name: "Nimdal",
  blogName: "Nimdal BLOG",
  author: "Tak Chanwoo / Nimdal",
  email: "0xnimdal@gmail.com",
  description:
    "Notes from Nimdal on Web3 research, product systems, campaign operations, automation, and personal builds."
} as const;

export function absoluteMainUrl(path = "/") {
  return new URL(path, siteConfig.mainUrl).toString();
}

export function absoluteBlogUrl(path = "/") {
  return new URL(path, siteConfig.blogUrl).toString();
}
