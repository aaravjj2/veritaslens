import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel project may expect output under `dist` (dashboard Output Directory).
  distDir: process.env.VERCEL ? "dist" : ".next",
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Service-Worker-Allowed", value: "/" },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
