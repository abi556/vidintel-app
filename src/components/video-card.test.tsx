import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VideoCard } from "./video-card";
import type { VideoData } from "@/types";

const MOCK_VIDEO: VideoData = {
  id: "v123",
  title: "How to Build an App",
  publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  thumbnailUrl: "https://example.com/thumb.jpg",
  viewCount: 50_000,
  likeCount: 2_000,
  commentCount: 150,
  engagementRate: 0.043,
  isTrending: false,
};

describe("VideoCard", () => {
  it("renders video title", () => {
    render(<VideoCard video={MOCK_VIDEO} />);
    expect(screen.getByText("How to Build an App")).toBeInTheDocument();
  });

  it("renders formatted view count", () => {
    render(<VideoCard video={MOCK_VIDEO} />);
    expect(screen.getByText("50K")).toBeInTheDocument();
  });

  it("renders engagement rate", () => {
    render(<VideoCard video={MOCK_VIDEO} />);
    expect(screen.getByText("4.30%")).toBeInTheDocument();
  });

  it("links to YouTube", () => {
    render(<VideoCard video={MOCK_VIDEO} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=v123"
    );
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("shows trending badge when isTrending is true", () => {
    render(<VideoCard video={{ ...MOCK_VIDEO, isTrending: true }} />);
    expect(screen.getByText("Trending")).toBeInTheDocument();
  });

  it("hides trending badge when isTrending is false", () => {
    render(<VideoCard video={MOCK_VIDEO} />);
    expect(screen.queryByText("Trending")).not.toBeInTheDocument();
  });

  it("shows relative time", () => {
    render(<VideoCard video={MOCK_VIDEO} />);
    expect(screen.getByText("2d ago")).toBeInTheDocument();
  });
});
