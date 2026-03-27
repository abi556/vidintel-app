import { describe, it, expect } from "vitest";
import { videosToCSV } from "./csv-export";
import type { VideoData } from "@/types";

const MOCK_VIDEOS: VideoData[] = [
  {
    id: "v1",
    title: "First Video",
    publishedAt: "2026-03-20T14:00:00Z",
    thumbnailUrl: "https://example.com/thumb.jpg",
    viewCount: 10000,
    likeCount: 500,
    commentCount: 50,
    engagementRate: 0.055,
    isTrending: true,
  },
  {
    id: "v2",
    title: 'Title with "quotes" and, commas',
    publishedAt: "2026-03-18T10:00:00Z",
    thumbnailUrl: "https://example.com/thumb2.jpg",
    viewCount: 5000,
    likeCount: 200,
    commentCount: 30,
    engagementRate: 0.046,
    isTrending: false,
  },
];

describe("videosToCSV", () => {
  it("includes header row", () => {
    const csv = videosToCSV(MOCK_VIDEOS);
    const firstLine = csv.split("\n")[0];
    expect(firstLine).toBe(
      "Title,Video ID,Published,Views,Likes,Comments,Engagement Rate,Trending,URL"
    );
  });

  it("includes correct number of data rows", () => {
    const csv = videosToCSV(MOCK_VIDEOS);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(3);
  });

  it("formats video data correctly", () => {
    const csv = videosToCSV(MOCK_VIDEOS);
    const lines = csv.split("\n");
    expect(lines[1]).toContain("First Video");
    expect(lines[1]).toContain("v1");
    expect(lines[1]).toContain("10000");
    expect(lines[1]).toContain("5.50%");
    expect(lines[1]).toContain("Yes");
    expect(lines[1]).toContain("https://www.youtube.com/watch?v=v1");
  });

  it("escapes fields with commas and quotes", () => {
    const csv = videosToCSV(MOCK_VIDEOS);
    const lines = csv.split("\n");
    expect(lines[2]).toContain('"Title with ""quotes"" and, commas"');
  });

  it("formats date as YYYY-MM-DD", () => {
    const csv = videosToCSV(MOCK_VIDEOS);
    expect(csv).toContain("2026-03-20");
  });

  it("returns header only for empty array", () => {
    const csv = videosToCSV([]);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(1);
  });
});
