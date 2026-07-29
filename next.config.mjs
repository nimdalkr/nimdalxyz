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
  outputFileTracingRoot: path.join(process.cwd()),
  // The private editor routes never touch the WebGL stage, but tracing pulls
  // three.js into every function and pushed /write/edit past Vercel's 250mb
  // uncompressed function limit, which failed the deploy outright.
  // The stage is loaded with `ssr: false`, so three.js never executes on the
  // server: it belongs in the client bundle only. Tracing pulled it into every
  // function anyway, and /write/edit was already close enough to Vercel's 250mb
  // uncompressed limit that the extra weight failed the deploy outright.
  outputFileTracingExcludes: {
    "**/*": [
      "node_modules/three/**",
      "node_modules/@react-three/**",
      // Local working directories at the repo root. Tracing sweeps these into
      // every function; tmp/ alone is ~263mb of old audit artifacts.
      "tmp/**",
      "audits/**",
      "artifacts/**",
      "wiki/**",
      "docs/**"
    ]
  }
};

export default withMDX(nextConfig);
