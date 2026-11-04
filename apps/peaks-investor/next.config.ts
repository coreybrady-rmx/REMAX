import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(import.meta.dirname),
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
