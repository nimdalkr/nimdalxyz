import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  devIndicators: false,
  experimental: {
    globalNotFound: true
  },
  outputFileTracingRoot: path.join(process.cwd()),
  outputFileTracingExcludes: {
    "**/*": [
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

export default nextConfig;
