import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PerformanceChart } from "./performance-chart";
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

describe("PerformanceChart", () => {
  it("renders nothing when fewer than 2 videos", () => {
    const { container } = render(
      <PerformanceChart videos={[makeVideo()]} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders chart heading with 2+ videos", () => {
    const videos = [
      makeVideo({ id: "v1" }),
      makeVideo({ id: "v2", publishedAt: new Date(Date.now() - 86400000).toISOString() }),
    ];
    render(<PerformanceChart videos={videos} />);
    expect(screen.getByText("Performance over time")).toBeInTheDocument();
  });

  it("renders metric toggle buttons", () => {
    const videos = [
      makeVideo({ id: "v1" }),
      makeVideo({ id: "v2", publishedAt: new Date(Date.now() - 86400000).toISOString() }),
    ];
    render(<PerformanceChart videos={videos} />);
    expect(screen.getByText("Views")).toBeInTheDocument();
    expect(screen.getByText("Engagement")).toBeInTheDocument();
  });

  it("allows switching metrics", () => {
    const videos = [
      makeVideo({ id: "v1" }),
      makeVideo({ id: "v2", publishedAt: new Date(Date.now() - 86400000).toISOString() }),
    ];
    render(<PerformanceChart videos={videos} />);
    fireEvent.click(screen.getByText("Engagement"));
    expect(screen.getByText("Engagement")).toBeInTheDocument();
  });
});
