import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VideoList } from "./video-list";
import type { VideoData, ChannelData } from "@/types";

function makeVideo(overrides: Partial<VideoData> = {}): VideoData {
  return {
    id: "v1",
    title: "Test Video",
    publishedAt: new Date().toISOString(),
    thumbnailUrl: "https://example.com/thumb.jpg",
    viewCount: 10000,
    likeCount: 500,
    commentCount: 50,
    engagementRate: 0.055,
    isTrending: false,
    ...overrides,
  };
}

const MOCK_CHANNEL: ChannelData = {
  id: "UC123",
  title: "TestChannel",
  description: "A test channel",
  customUrl: "@TestChannel",
  thumbnailUrl: "https://example.com/avatar.jpg",
  subscriberCount: 10000,
  videoCount: 100,
  viewCount: 1000000,
  uploadsPlaylistId: "UU123",
};

const MOCK_VIDEOS: VideoData[] = [
  makeVideo({
    id: "v1",
    title: "High Views",
    viewCount: 100_000,
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  }),
  makeVideo({
    id: "v2",
    title: "Low Views",
    viewCount: 500,
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  }),
  makeVideo({
    id: "v3",
    title: "Old Video",
    viewCount: 50_000,
    publishedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
  }),
];

describe("VideoList", () => {
  it("renders video cards", () => {
    render(<VideoList videos={MOCK_VIDEOS} channel={MOCK_CHANNEL} />);
    expect(screen.getAllByText("High Views").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Low Views").length).toBeGreaterThanOrEqual(1);
  });

  it("displays count of visible videos", () => {
    render(<VideoList videos={MOCK_VIDEOS} channel={MOCK_CHANNEL} />);
    expect(screen.getByText(/of 3/)).toBeInTheDocument();
  });

  it("filters videos by 7d range", () => {
    render(<VideoList videos={MOCK_VIDEOS} channel={MOCK_CHANNEL} />);
    fireEvent.click(screen.getByText("7 days"));
    expect(screen.getAllByText("High Views").length).toBeGreaterThanOrEqual(1);
    const videoCards = screen.queryAllByRole("heading", { level: 3 });
    const cardTitles = videoCards.map((el) => el.textContent);
    expect(cardTitles).not.toContain("Low Views");
    expect(cardTitles).not.toContain("Old Video");
  });

  it("shows older videos when 90d is selected", () => {
    render(<VideoList videos={MOCK_VIDEOS} channel={MOCK_CHANNEL} />);
    fireEvent.click(screen.getByText("90 days"));
    expect(screen.getAllByText("High Views").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Low Views").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Old Video").length).toBeGreaterThanOrEqual(1);
  });

  it("shows empty state when no videos match filter", () => {
    const oldVideo = makeVideo({
      id: "v99",
      publishedAt: new Date(
        Date.now() - 100 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });
    render(<VideoList videos={[oldVideo]} channel={MOCK_CHANNEL} />);
    fireEvent.click(screen.getByText("7 days"));
    expect(
      screen.getByText("No videos found in this date range.")
    ).toBeInTheDocument();
  });

  it("sorts by views descending by default", () => {
    render(<VideoList videos={MOCK_VIDEOS} channel={MOCK_CHANNEL} />);
    fireEvent.click(screen.getByText("90 days"));
    const titles = screen
      .getAllByRole("link")
      .map((el) => el.textContent?.trim());
    const highIdx = titles.findIndex((t) => t?.includes("High Views"));
    const oldIdx = titles.findIndex((t) => t?.includes("Old Video"));
    const lowIdx = titles.findIndex((t) => t?.includes("Low Views"));
    expect(highIdx).toBeLessThan(oldIdx);
    expect(oldIdx).toBeLessThan(lowIdx);
  });

  it("renders export dropdown button", () => {
    render(<VideoList videos={MOCK_VIDEOS} channel={MOCK_CHANNEL} />);
    expect(screen.getByText("Export")).toBeInTheDocument();
  });
});
