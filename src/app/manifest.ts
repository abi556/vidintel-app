import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vidintel — YouTube Competitor Video Analysis",
    short_name: "Vidintel",
    description:
      "Paste any YouTube channel URL and instantly see which videos are performing best.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0f0f",
    theme_color: "#ff0000",
    icons: [
      {
        src: "/favicon-dark.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}
