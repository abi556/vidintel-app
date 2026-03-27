import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VideoList } from "./video-list";
import type { VideoData } from "@/types";

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
    publishedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  }),
];

describe("VideoList", () => {
  it("renders video cards", () => {
    render(<VideoList videos={MOCK_VIDEOS} />);
    expect(screen.getByText("High Views")).toBeInTheDocument();
    expect(screen.getByText("Low Views")).toBeInTheDocument();
  });

  it("displays count of visible videos", () => {
    render(<VideoList videos={MOCK_VIDEOS} />);
    expect(screen.getByText(/of 3/)).toBeInTheDocument();
  });

  it("filters videos by 7d range", () => {
    render(<VideoList videos={MOCK_VIDEOS} />);
    fireEvent.click(screen.getByText("7 days"));
    expect(screen.getByText("High Views")).toBeInTheDocument();
    expect(screen.queryByText("Low Views")).not.toBeInTheDocument();
    expect(screen.queryByText("Old Video")).not.toBeInTheDocument();
  });

  it("shows all videos when All is selected", () => {
    render(<VideoList videos={MOCK_VIDEOS} />);
    fireEvent.click(screen.getByText("All"));
    expect(screen.getByText("High Views")).toBeInTheDocument();
    expect(screen.getByText("Low Views")).toBeInTheDocument();
    expect(screen.getByText("Old Video")).toBeInTheDocument();
  });

  it("shows empty state when no videos match filter", () => {
    const oldVideo = makeVideo({
      id: "v99",
      publishedAt: new Date(
        Date.now() - 100 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });
    render(<VideoList videos={[oldVideo]} />);
    fireEvent.click(screen.getByText("7 days"));
    expect(screen.getByText("No videos found in this date range.")).toBeInTheDocument();
  });

  it("sorts by views descending by default", () => {
    render(<VideoList videos={MOCK_VIDEOS} />);
    fireEvent.click(screen.getByText("All"));
    const titles = screen.getAllByRole("link").map((el) => el.textContent?.trim());
    const highIdx = titles.findIndex((t) => t?.includes("High Views"));
    const oldIdx = titles.findIndex((t) => t?.includes("Old Video"));
    const lowIdx = titles.findIndex((t) => t?.includes("Low Views"));
    expect(highIdx).toBeLessThan(oldIdx);
    expect(oldIdx).toBeLessThan(lowIdx);
  });
});
