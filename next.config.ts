import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["@duckdb/node-api"],
    outputFileTracingIncludes: {
      "/api/**/*": ["./data/**/*"],
    },
  } as any,
};

export default nextConfig;
