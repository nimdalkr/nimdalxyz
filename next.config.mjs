import path from "node:path";

import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.(md|mdx)$/
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  devIndicators: false,
  outputFileTracingRoot: path.join(process.cwd()),
  async redirects() {
    return [
      {
        source: "/blog",
        destination: "https://blog.nimdal.xyz/",
        permanent: true
      },
      {
        source: "/blog/:path*",
        destination: "https://blog.nimdal.xyz/:path*",
        permanent: true
      },
      {
        source: "/posts/:path*",
        destination: "https://blog.nimdal.xyz/posts/:path*",
        permanent: true
      },
      {
        source: "/tags/:path*",
        destination: "https://blog.nimdal.xyz/tags/:path*",
        permanent: true
      },
      {
        source: "/rss.xml",
        destination: "https://blog.nimdal.xyz/rss.xml",
        permanent: true
      }
    ];
  }
};

export default withMDX(nextConfig);
