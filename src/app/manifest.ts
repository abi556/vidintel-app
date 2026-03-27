import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_TITLE_DEFAULT } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_TITLE_DEFAULT,
    short_name: "Vidintel",
    description: SITE_DESCRIPTION,
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
