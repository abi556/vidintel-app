import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChannelHeader } from "./channel-header";
import type { ChannelData } from "@/types";

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

describe("ChannelHeader", () => {
  it("renders channel title and handle", () => {
    render(<ChannelHeader channel={MOCK_CHANNEL} videoCount={12} />);
    expect(screen.getByText("TestChannel")).toBeInTheDocument();
    expect(screen.getByText("@testchannel")).toBeInTheDocument();
  });

  it("renders formatted subscriber count", () => {
    render(<ChannelHeader channel={MOCK_CHANNEL} videoCount={12} />);
    expect(screen.getByText("1.5M")).toBeInTheDocument();
  });

  it("renders formatted view count", () => {
    render(<ChannelHeader channel={MOCK_CHANNEL} videoCount={12} />);
    expect(screen.getByText("200M")).toBeInTheDocument();
  });

  it("renders analyzed video count in accent", () => {
    render(<ChannelHeader channel={MOCK_CHANNEL} videoCount={12} />);
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("renders avatar image", () => {
    render(<ChannelHeader channel={MOCK_CHANNEL} videoCount={12} />);
    const img = screen.getByAltText("TestChannel");
    expect(img).toBeInTheDocument();
  });
});
