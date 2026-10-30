import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: "/your-next-move",
  async redirects() {
    return [
      {
        source: "/",
        destination: "/your-next-move",
        permanent: false,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
