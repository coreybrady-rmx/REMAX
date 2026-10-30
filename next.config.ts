import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  // Absolute assets so the site works when reverse-proxied at remaxpeaks.com/corey-brady/
  assetPrefix:
    process.env.VERCEL === "1"
      ? "https://remax-peaks-agent-microsites.vercel.app"
      : undefined,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.cdn.filesafe.space",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "assets.utahrealestate.com",
      },
    ],
  },
};

export default nextConfig;

