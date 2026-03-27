import { describe, it, expect } from "vitest";
import { YOUTUBE_API_BASE, MAX_RESULTS_PER_PAGE, CACHE_TTL, DATE_RANGE_DAYS } from "./constants";

describe("constants", () => {
  it("has correct YouTube API base URL", () => {
    expect(YOUTUBE_API_BASE).toBe("https://www.googleapis.com/youtube/v3");
  });

  it("has correct max results per page", () => {
    expect(MAX_RESULTS_PER_PAGE).toBe(50);
  });

  it("has correct cache TTLs", () => {
    expect(CACHE_TTL.CHANNEL_RESOLUTION).toBe(3600);
    expect(CACHE_TTL.VIDEO_DATA).toBe(300);
  });

  it("has correct date range mappings", () => {
    expect(DATE_RANGE_DAYS["7d"]).toBe(7);
    expect(DATE_RANGE_DAYS["30d"]).toBe(30);
    expect(DATE_RANGE_DAYS["90d"]).toBe(90);
    expect(DATE_RANGE_DAYS["all"]).toBe(Infinity);
  });
});
