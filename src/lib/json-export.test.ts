import { describe, it, expect } from "vitest";
import { PRODUCT_DESCRIPTOR } from "@/lib/constants";
import { videosToJSON } from "./json-export";
import type { ChannelData, VideoData, ChannelInsights } from "@/types";

const channel: ChannelData = {
  id: "UC123",
  title: "Test Channel",
  description: "desc",
  customUrl: "@test",
  thumbnailUrl: "https://example.com/thumb.jpg",
  subscriberCount: 1000,
  videoCount: 50,
  viewCount: 100000,
  uploadsPlaylistId: "UU123",
};

const videos: VideoData[] = [
  {
    id: "v1",
    title: "Video One",
    publishedAt: "2025-01-01T00:00:00Z",
    thumbnailUrl: "https://example.com/v1.jpg",
    viewCount: 5000,
    likeCount: 200,
    commentCount: 30,
    engagementRate: 0.046,
    isTrending: true,
  },
];

describe("videosToJSON", () => {
  it("produces valid JSON", () => {
    const json = videosToJSON(channel, videos, null);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it("includes meta, channel, insights, and videos sections", () => {
    const json = videosToJSON(channel, videos, null);
    const parsed = JSON.parse(json);
    expect(parsed.meta).toBeDefined();
    expect(parsed.meta.generator).toBe("Vidintel");
    expect(parsed.meta.productTagline).toBe(PRODUCT_DESCRIPTOR);
    expect(parsed.channel.title).toBe("Test Channel");
    expect(parsed.videos).toHaveLength(1);
    expect(parsed.videos[0].url).toContain("youtube.com");
  });

  it("includes insights when provided", () => {
    const insights: ChannelInsights = {
      topPerformers: {
        byViews: videos[0],
        byEngagement: videos[0],
        byComments: videos[0],
      },
      uploadFrequency: {
        avgDaysBetweenUploads: 3,
        consistencyScore: 0.85,
        longestGapDays: 5,
        shortestGapDays: 1,
      },
      bestPostingTime: {
        bestDay: { name: "Monday", avgViews: 5000, videoCount: 1 },
        bestHour: { hour: 14, name: "2 PM", avgViews: 5000, videoCount: 1 },
        heatmap: [],
      },
      velocities: [{ ...videos[0], velocity: 100 }],
      fastestGrowing: { ...videos[0], velocity: 100 },
    };

    const json = videosToJSON(channel, videos, insights);
    const parsed = JSON.parse(json);
    expect(parsed.insights.topPerformers.byViews).toBe("Video One");
    expect(parsed.insights.uploadFrequency.avgDaysBetweenUploads).toBe(3);
    expect(parsed.insights.fastestGrowing.velocity).toBe(100);
  });
});
