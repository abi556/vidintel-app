/**
 * Product descriptor for metadata, PWA manifest, exports, PDF — not the home hero copy.
 */
export const PRODUCT_DESCRIPTOR = "YouTube channel performance analyzer";

export const SITE_TITLE_DEFAULT = `Vidintel — ${PRODUCT_DESCRIPTOR}`;

/**
 * Shared meta description: root layout, Open Graph, Twitter, PWA manifest, JSON-LD.
 */
export const SITE_DESCRIPTION =
  `${PRODUCT_DESCRIPTOR}: paste a channel URL to see views, engagement, and trending signals. Built for creators and agencies.`;

/** File in `/public` — default Open Graph / Twitter / messaging link previews. */
export const SITE_OG_IMAGE = "/cover.png";

export const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export const MAX_RESULTS_PER_PAGE = 50;

export const CACHE_TTL = {
  CHANNEL_RESOLUTION: 3600,
  VIDEO_DATA: 300,
} as const;

export const DATE_RANGE_DAYS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "60d": 60,
  "90d": 90,
  all: Infinity,
};
