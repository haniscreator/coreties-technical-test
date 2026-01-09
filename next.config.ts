import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["@duckdb/node-api"],
    outputFileTracingIncludes: {
      "/api/**/*": ["./data/**/*"],
    },
  } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
};

export default nextConfig;
