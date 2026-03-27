// @ducanh2912/next-pwa uses Workbox's webpack plugin. Next.js 16 defaults to
// Turbopack for `next build`; use `next build --webpack` (see package.json).
import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { hostname: "yt3.ggpht.com" },
      { hostname: "i.ytimg.com" },
      { hostname: "i9.ytimg.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withPWA({
  dest: "public",
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: ({ sameOrigin, url }) =>
          sameOrigin && url.pathname.startsWith("/api/"),
        handler: "NetworkOnly",
        method: "GET",
        options: {
          cacheName: "apis",
        },
      },
    ],
  },
})(nextConfig);
