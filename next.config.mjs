import path from "node:path";

import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.(md|mdx)$/
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost", "blog.localhost"],
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  devIndicators: false,
  experimental: {
    globalNotFound: true,
    serverActions: {
      bodySizeLimit: "4mb"
    }
  },
  outputFileTracingRoot: path.join(process.cwd())
};

export default withMDX(nextConfig);
