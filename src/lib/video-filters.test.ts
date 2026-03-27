import { describe, it, expect } from "vitest";
import {
  median,
  applyListFilters,
  type PerformanceFloorMode,
} from "./video-filters";
import type { VideoData } from "@/types";

function v(overrides: Partial<VideoData> & Pick<VideoData, "id">): VideoData {
  return {
    title: "T",
    publishedAt: new Date().toISOString(),
    thumbnailUrl: "https://example.com/t.jpg",
    viewCount: 1000,
    likeCount: 10,
    commentCount: 5,
    engagementRate: 0.015,
    isTrending: false,
    ...overrides,
  };
}

describe("median", () => {
  it("returns 0 for empty array", () => {
    expect(median([])).toBe(0);
  });

  it("returns single value", () => {
    expect(median([7])).toBe(7);
  });

  it("returns middle for odd length", () => {
    expect(median([1, 9, 3])).toBe(3);
  });

  it("returns average of two middles for even length", () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });
});

describe("applyListFilters", () => {
  const base: VideoData[] = [
    v({
      id: "a",
      title: "Apple Review",
      viewCount: 100,
      engagementRate: 0.1,
      isTrending: true,
    }),
    v({
      id: "b",
      title: "Banana Facts",
      viewCount: 200,
      engagementRate: 0.05,
      isTrending: false,
    }),
    v({
      id: "c",
      title: "Cherry Tips",
      viewCount: 300,
      engagementRate: 0.02,
      isTrending: false,
    }),
  ];

  const defaults: {
    titleQuery: string;
    trendingOnly: boolean;
    performanceMode: PerformanceFloorMode;
    minViews: number | null;
    minEngagementRate: number | null;
  } = {
    titleQuery: "",
    trendingOnly: false,
    performanceMode: "all",
    minViews: null,
    minEngagementRate: null,
  };

  it("returns all when no constraints", () => {
    expect(applyListFilters(base, defaults)).toHaveLength(3);
  });

  it("filters by title substring case-insensitively", () => {
    expect(
      applyListFilters(base, { ...defaults, titleQuery: "banana" })
    ).toHaveLength(1);
    expect(
      applyListFilters(base, { ...defaults, titleQuery: "APPLE" })[0].id
    ).toBe("a");
  });

  it("filters trending only", () => {
    expect(
      applyListFilters(base, { ...defaults, trendingOnly: true })
    ).toHaveLength(1);
    expect(
      applyListFilters(base, { ...defaults, trendingOnly: true })[0].id
    ).toBe("a");
  });

  it("filters above median views", () => {
    const out = applyListFilters(base, {
      ...defaults,
      performanceMode: "median_views",
    });
    // median of 100,200,300 = 200 → keep views >= 200
    expect(out.map((x) => x.id).sort()).toEqual(["b", "c"]);
  });

  it("filters above median engagement", () => {
    const out = applyListFilters(base, {
      ...defaults,
      performanceMode: "median_engagement",
    });
    // median of 0.1, 0.05, 0.02 = 0.05
    expect(out.map((x) => x.id).sort()).toEqual(["a", "b"]);
  });

  it("applies min views", () => {
    const out = applyListFilters(base, {
      ...defaults,
      minViews: 200,
    });
    expect(out.map((x) => x.id).sort()).toEqual(["b", "c"]);
  });

  it("applies min engagement rate", () => {
    const out = applyListFilters(base, {
      ...defaults,
      minEngagementRate: 0.06,
    });
    expect(out.map((x) => x.id)).toEqual(["a"]);
  });
});
