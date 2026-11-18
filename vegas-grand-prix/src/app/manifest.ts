import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vegas Grand Prix 11/19",
    short_name: "Vegas GP",
    description: "Phone trip sheet for Las Vegas, Nov 19-21, 2026.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0F1A",
    theme_color: "#DC1C2E",
    icons: [
      { src: "/icons/favicon-32.png", sizes: "32x32", type: "image/png", purpose: "any" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-1024.png", sizes: "1024x1024", type: "image/png", purpose: "any" },
    ],
  };
}
