import type { NextConfig } from "next";
import path from "node:path";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(import.meta.dirname),
  eslint: { ignoreDuringBuilds: true },
  ...(basePath ? { basePath } : {}),
};

export default nextConfig;
