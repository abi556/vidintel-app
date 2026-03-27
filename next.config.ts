import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { hostname: "yt3.ggpht.com" },
      { hostname: "i.ytimg.com" },
      { hostname: "i9.ytimg.com" },
    ],
  },
};

export default nextConfig;
