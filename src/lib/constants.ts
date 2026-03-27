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
