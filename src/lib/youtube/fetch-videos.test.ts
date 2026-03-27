import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchRecentVideos } from "./fetch-videos";
import * as client from "./client";

vi.mock("./client");

const NOW = new Date("2026-03-27T12:00:00Z");

const makePlaylistItem = (videoId: string, daysAgo: number) => ({
  snippet: {
    publishedAt: new Date(
      NOW.getTime() - daysAgo * 24 * 60 * 60 * 1000
    ).toISOString(),
    title: `Video ${videoId}`,
    resourceId: { videoId },
    thumbnails: {
      high: { url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` },
    },
  },
});

const makeVideoStats = (videoId: string, views: number, likes: number, comments: number) => ({
  id: videoId,
  statistics: {
    viewCount: String(views),
    likeCount: String(likes),
    commentCount: String(comments),
  },
});

describe("fetchRecentVideos", () => {
  beforeEach(() => {
    vi.mocked(client.youtubeGet).mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  it("fetches playlist items and video stats, returns combined VideoData[]", async () => {
    vi.mocked(client.youtubeGet)
      .mockResolvedValueOnce({
        items: [
          makePlaylistItem("vid1", 2),
          makePlaylistItem("vid2", 5),
          makePlaylistItem("vid3", 40),
        ],
      })
      .mockResolvedValueOnce({
        items: [
          makeVideoStats("vid1", 100000, 5000, 200),
          makeVideoStats("vid2", 50000, 2000, 100),
        ],
      });

    const result = await fetchRecentVideos("UU_uploads_id", 30);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("vid1");
    expect(result[0].viewCount).toBe(100000);
    expect(result[0].likeCount).toBe(5000);
    expect(result[0].commentCount).toBe(200);
    expect(result[1].id).toBe("vid2");
  });

  it("filters out videos older than the specified days", async () => {
    vi.mocked(client.youtubeGet)
      .mockResolvedValueOnce({
        items: [
          makePlaylistItem("recent", 3),
          makePlaylistItem("old", 60),
        ],
      })
      .mockResolvedValueOnce({
        items: [makeVideoStats("recent", 10000, 500, 50)],
      });

    const result = await fetchRecentVideos("UU_test", 30);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("recent");
  });

  it("calculates engagement rate as (likes + comments) / views", async () => {
    vi.mocked(client.youtubeGet)
      .mockResolvedValueOnce({
        items: [makePlaylistItem("vid1", 1)],
      })
      .mockResolvedValueOnce({
        items: [makeVideoStats("vid1", 10000, 500, 100)],
      });

    const result = await fetchRecentVideos("UU_test", 30);

    expect(result[0].engagementRate).toBeCloseTo(0.06, 4);
  });

  it("marks videos above average views as trending", async () => {
    vi.mocked(client.youtubeGet)
      .mockResolvedValueOnce({
        items: [
          makePlaylistItem("low", 1),
          makePlaylistItem("high", 2),
        ],
      })
      .mockResolvedValueOnce({
        items: [
          makeVideoStats("low", 1000, 50, 10),
          makeVideoStats("high", 9000, 500, 100),
        ],
      });

    const result = await fetchRecentVideos("UU_test", 30);

    const low = result.find((v) => v.id === "low")!;
    const high = result.find((v) => v.id === "high")!;
    expect(low.isTrending).toBe(false);
    expect(high.isTrending).toBe(true);
  });

  it("returns empty array when playlist has no items", async () => {
    vi.mocked(client.youtubeGet).mockResolvedValueOnce({ items: [] });

    const result = await fetchRecentVideos("UU_empty", 30);
    expect(result).toEqual([]);
  });

  it("handles videos with zero views gracefully", async () => {
    vi.mocked(client.youtubeGet)
      .mockResolvedValueOnce({
        items: [makePlaylistItem("zero", 1)],
      })
      .mockResolvedValueOnce({
        items: [makeVideoStats("zero", 0, 0, 0)],
      });

    const result = await fetchRecentVideos("UU_test", 30);

    expect(result[0].viewCount).toBe(0);
    expect(result[0].engagementRate).toBe(0);
  });

  it("paginates when nextPageToken is present and videos are still within range", async () => {
    vi.mocked(client.youtubeGet)
      .mockResolvedValueOnce({
        items: [makePlaylistItem("page1", 5)],
        nextPageToken: "TOKEN_ABC",
      })
      .mockResolvedValueOnce({
        items: [
          makePlaylistItem("page2", 10),
          makePlaylistItem("tooOld", 40),
        ],
      })
      .mockResolvedValueOnce({
        items: [
          makeVideoStats("page1", 5000, 200, 30),
          makeVideoStats("page2", 3000, 100, 20),
        ],
      });

    const result = await fetchRecentVideos("UU_test", 30);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("page1");
    expect(result[1].id).toBe("page2");
  });
});
