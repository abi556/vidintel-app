import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChannelHeader } from "./channel-header";
import type { ChannelData, VideoData } from "@/types";

const MOCK_CHANNEL: ChannelData = {
  id: "UC123",
  title: "TestChannel",
  description: "A test channel",
  customUrl: "@testchannel",
  thumbnailUrl: "https://example.com/avatar.jpg",
  subscriberCount: 1_500_000,
  videoCount: 450,
  viewCount: 200_000_000,
  uploadsPlaylistId: "UU123",
};

function makeVideo(overrides: Partial<VideoData> = {}): VideoData {
  return {
    id: "v1",
    title: "Test",
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
  makeVideo({ id: "v1", viewCount: 20000, isTrending: true }),
  makeVideo({ id: "v2", viewCount: 5000, isTrending: false }),
];

describe("ChannelHeader", () => {
  it("renders channel title and handle", () => {
    render(<ChannelHeader channel={MOCK_CHANNEL} videos={MOCK_VIDEOS} />);
    expect(screen.getByText("TestChannel")).toBeInTheDocument();
    expect(screen.getByText("@testchannel")).toBeInTheDocument();
  });

  it("renders formatted subscriber count", () => {
    render(<ChannelHeader channel={MOCK_CHANNEL} videos={MOCK_VIDEOS} />);
    expect(screen.getByText("1.5M")).toBeInTheDocument();
  });

  it("renders formatted view count", () => {
    render(<ChannelHeader channel={MOCK_CHANNEL} videos={MOCK_VIDEOS} />);
    expect(screen.getByText("200M")).toBeInTheDocument();
  });

  it("renders analyzed video count", () => {
    render(<ChannelHeader channel={MOCK_CHANNEL} videos={MOCK_VIDEOS} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders trending count", () => {
    render(<ChannelHeader channel={MOCK_CHANNEL} videos={MOCK_VIDEOS} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Trending")).toBeInTheDocument();
  });

  it("renders average views", () => {
    render(<ChannelHeader channel={MOCK_CHANNEL} videos={MOCK_VIDEOS} />);
    expect(screen.getByText("12.5K")).toBeInTheDocument();
    expect(screen.getByText("Avg. views")).toBeInTheDocument();
  });

  it("renders average engagement", () => {
    render(<ChannelHeader channel={MOCK_CHANNEL} videos={MOCK_VIDEOS} />);
    expect(screen.getByText("5.5%")).toBeInTheDocument();
    expect(screen.getByText("Avg. engagement")).toBeInTheDocument();
  });

  it("renders avatar image", () => {
    render(<ChannelHeader channel={MOCK_CHANNEL} videos={MOCK_VIDEOS} />);
    const img = screen.getByAltText("TestChannel");
    expect(img).toBeInTheDocument();
  });

  it("hides trending stats when no videos", () => {
    render(<ChannelHeader channel={MOCK_CHANNEL} videos={[]} />);
    expect(screen.queryByText("Trending")).not.toBeInTheDocument();
    expect(screen.queryByText("Avg. views")).not.toBeInTheDocument();
  });
});
