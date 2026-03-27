import { describe, it, expect } from "vitest";
import type { VideoData } from "@/types";
import {
  getTopPerformers,
  getUploadFrequency,
  getBestPostingTime,
  getViewVelocity,
  computeInsights,
} from "./analytics";

function makeVideo(overrides: Partial<VideoData> & { id: string }): VideoData {
  return {
    title: `Video ${overrides.id}`,
    publishedAt: new Date().toISOString(),
    thumbnailUrl: `https://i.ytimg.com/vi/${overrides.id}/hqdefault.jpg`,
    viewCount: 1000,
    likeCount: 50,
    commentCount: 10,
    engagementRate: 0.06,
    isTrending: false,
    ...overrides,
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

const sampleVideos: VideoData[] = [
  makeVideo({
    id: "v1",
    title: "Viral Hit",
    viewCount: 500_000,
    likeCount: 25_000,
    commentCount: 3_000,
    engagementRate: 0.056,
    publishedAt: new Date(Date.now() - 2 * DAY_MS).toISOString(),
  }),
  makeVideo({
    id: "v2",
    title: "Niche Gem",
    viewCount: 10_000,
    likeCount: 2_000,
    commentCount: 800,
    engagementRate: 0.28,
    publishedAt: new Date(Date.now() - 10 * DAY_MS).toISOString(),
  }),
  makeVideo({
    id: "v3",
    title: "Comment Magnet",
    viewCount: 80_000,
    likeCount: 1_000,
    commentCount: 5_000,
    engagementRate: 0.075,
    publishedAt: new Date(Date.now() - 20 * DAY_MS).toISOString(),
  }),
  makeVideo({
    id: "v4",
    title: "Steady Performer",
    viewCount: 50_000,
    likeCount: 3_000,
    commentCount: 500,
    engagementRate: 0.07,
    publishedAt: new Date(Date.now() - 30 * DAY_MS).toISOString(),
  }),
];

describe("getTopPerformers", () => {
  it("returns the video with the most views", () => {
    const result = getTopPerformers(sampleVideos);
    expect(result.byViews.id).toBe("v1");
  });

  it("returns the video with the highest engagement rate", () => {
    const result = getTopPerformers(sampleVideos);
    expect(result.byEngagement.id).toBe("v2");
  });

  it("returns the video with the most comments", () => {
    const result = getTopPerformers(sampleVideos);
    expect(result.byComments.id).toBe("v3");
  });

  it("handles a single video by returning it for all categories", () => {
    const single = [sampleVideos[0]];
    const result = getTopPerformers(single);
    expect(result.byViews.id).toBe("v1");
    expect(result.byEngagement.id).toBe("v1");
    expect(result.byComments.id).toBe("v1");
  });

  it("throws for an empty array", () => {
    expect(() => getTopPerformers([])).toThrow();
  });
});

describe("getUploadFrequency", () => {
  it("calculates average days between uploads", () => {
    const result = getUploadFrequency(sampleVideos);
    expect(result.avgDaysBetweenUploads).toBeGreaterThan(0);
    expect(result.avgDaysBetweenUploads).toBeLessThanOrEqual(30);
  });

  it("returns consistency score between 0 and 1", () => {
    const result = getUploadFrequency(sampleVideos);
    expect(result.consistencyScore).toBeGreaterThanOrEqual(0);
    expect(result.consistencyScore).toBeLessThanOrEqual(1);
  });

  it("returns perfect consistency for evenly spaced videos", () => {
    const evenly = [
      makeVideo({ id: "e1", publishedAt: new Date(Date.now() - 30 * DAY_MS).toISOString() }),
      makeVideo({ id: "e2", publishedAt: new Date(Date.now() - 20 * DAY_MS).toISOString() }),
      makeVideo({ id: "e3", publishedAt: new Date(Date.now() - 10 * DAY_MS).toISOString() }),
      makeVideo({ id: "e4", publishedAt: new Date(Date.now()).toISOString() }),
    ];
    const result = getUploadFrequency(evenly);
    expect(result.consistencyScore).toBeCloseTo(1, 1);
    expect(result.avgDaysBetweenUploads).toBeCloseTo(10, 0);
  });

  it("identifies longest and shortest gaps", () => {
    const result = getUploadFrequency(sampleVideos);
    expect(result.longestGapDays).toBeGreaterThanOrEqual(result.shortestGapDays);
    expect(result.shortestGapDays).toBeGreaterThan(0);
  });

  it("handles fewer than 2 videos gracefully", () => {
    const result = getUploadFrequency([sampleVideos[0]]);
    expect(result.avgDaysBetweenUploads).toBe(0);
    expect(result.consistencyScore).toBe(1);
  });
});

describe("getBestPostingTime", () => {
  it("returns a best day with name and avgViews", () => {
    const result = getBestPostingTime(sampleVideos);
    expect(result.bestDay.name).toBeTruthy();
    expect(result.bestDay.avgViews).toBeGreaterThan(0);
    expect(result.bestDay.videoCount).toBeGreaterThan(0);
  });

  it("returns a best hour with valid hour range", () => {
    const result = getBestPostingTime(sampleVideos);
    expect(result.bestHour.hour).toBeGreaterThanOrEqual(0);
    expect(result.bestHour.hour).toBeLessThanOrEqual(23);
    expect(result.bestHour.avgViews).toBeGreaterThan(0);
  });

  it("returns a 7x24 heatmap", () => {
    const result = getBestPostingTime(sampleVideos);
    expect(result.heatmap).toHaveLength(7);
    for (const row of result.heatmap) {
      expect(row).toHaveLength(24);
    }
  });

  it("heatmap contains at least one non-zero cell", () => {
    const result = getBestPostingTime(sampleVideos);
    const hasNonZero = result.heatmap.some((row) => row.some((val) => val > 0));
    expect(hasNonZero).toBe(true);
  });
});

describe("getViewVelocity", () => {
  it("enriches each video with a velocity property", () => {
    const result = getViewVelocity(sampleVideos);
    expect(result).toHaveLength(sampleVideos.length);
    for (const v of result) {
      expect(v.velocity).toBeGreaterThanOrEqual(0);
      expect(typeof v.velocity).toBe("number");
    }
  });

  it("sorts by velocity descending", () => {
    const result = getViewVelocity(sampleVideos);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].velocity).toBeGreaterThanOrEqual(result[i].velocity);
    }
  });

  it("calculates velocity as views / hours since publish", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const vids = [makeVideo({ id: "vv1", viewCount: 10_000, publishedAt: twoHoursAgo })];
    const result = getViewVelocity(vids);
    expect(result[0].velocity).toBeCloseTo(5000, -2);
  });

  it("handles video published just now (avoids division by zero)", () => {
    const vids = [makeVideo({ id: "now", viewCount: 100, publishedAt: new Date().toISOString() })];
    const result = getViewVelocity(vids);
    expect(Number.isFinite(result[0].velocity)).toBe(true);
  });
});

describe("computeInsights", () => {
  it("returns a complete ChannelInsights object", () => {
    const insights = computeInsights(sampleVideos);
    expect(insights.topPerformers).toBeDefined();
    expect(insights.uploadFrequency).toBeDefined();
    expect(insights.bestPostingTime).toBeDefined();
    expect(insights.velocities).toHaveLength(sampleVideos.length);
    expect(insights.fastestGrowing).toBeDefined();
    expect(insights.fastestGrowing.velocity).toBeGreaterThan(0);
  });

  it("fastestGrowing is the first element in velocities", () => {
    const insights = computeInsights(sampleVideos);
    expect(insights.fastestGrowing.id).toBe(insights.velocities[0].id);
  });
});
