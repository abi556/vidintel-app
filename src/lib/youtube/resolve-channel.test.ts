import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveChannel } from "./resolve-channel";
import * as client from "./client";
import { CACHE_TTL } from "@/lib/constants";
import type { ParsedChannelInput } from "@/types";

vi.mock("./client");

const CHANNEL_CACHE = { revalidate: CACHE_TTL.CHANNEL_RESOLUTION };

const MOCK_CHANNEL_ITEM = {
  id: "UCBJycsmduvYEL83R_U4JriQ",
  snippet: {
    title: "MKBHD",
    description: "Quality Tech Videos",
    customUrl: "@mkbhd",
    thumbnails: {
      high: { url: "https://yt3.ggpht.com/thumbnail.jpg" },
    },
  },
  statistics: {
    subscriberCount: "19500000",
    videoCount: "1800",
    viewCount: "4200000000",
  },
  contentDetails: {
    relatedPlaylists: {
      uploads: "UUBJycsmduvYEL83R_U4JriQ",
    },
  },
};

describe("resolveChannel", () => {
  beforeEach(() => {
    vi.mocked(client.youtubeGet).mockReset();
  });

  it("resolves handle via forHandle param", async () => {
    vi.mocked(client.youtubeGet).mockResolvedValue({
      items: [MOCK_CHANNEL_ITEM],
    });

    const input: ParsedChannelInput = { type: "handle", value: "mkbhd" };
    const result = await resolveChannel(input);

    expect(client.youtubeGet).toHaveBeenCalledWith("channels", {
      forHandle: "mkbhd",
      part: "id,snippet,statistics,contentDetails",
    }, CHANNEL_CACHE);
    expect(result.id).toBe("UCBJycsmduvYEL83R_U4JriQ");
    expect(result.title).toBe("MKBHD");
    expect(result.subscriberCount).toBe(19500000);
    expect(result.uploadsPlaylistId).toBe("UUBJycsmduvYEL83R_U4JriQ");
  });

  it("resolves channel_id via id param", async () => {
    vi.mocked(client.youtubeGet).mockResolvedValue({
      items: [MOCK_CHANNEL_ITEM],
    });

    const input: ParsedChannelInput = {
      type: "channel_id",
      value: "UCBJycsmduvYEL83R_U4JriQ",
    };
    const result = await resolveChannel(input);

    expect(client.youtubeGet).toHaveBeenCalledWith("channels", {
      id: "UCBJycsmduvYEL83R_U4JriQ",
      part: "id,snippet,statistics,contentDetails",
    }, CHANNEL_CACHE);
    expect(result.id).toBe("UCBJycsmduvYEL83R_U4JriQ");
  });

  it("resolves direct_id via id param", async () => {
    vi.mocked(client.youtubeGet).mockResolvedValue({
      items: [MOCK_CHANNEL_ITEM],
    });

    const input: ParsedChannelInput = {
      type: "direct_id",
      value: "UCBJycsmduvYEL83R_U4JriQ",
    };
    await resolveChannel(input);

    expect(client.youtubeGet).toHaveBeenCalledWith("channels", {
      id: "UCBJycsmduvYEL83R_U4JriQ",
      part: "id,snippet,statistics,contentDetails",
    }, CHANNEL_CACHE);
  });

  it("resolves username via forUsername param", async () => {
    vi.mocked(client.youtubeGet).mockResolvedValue({
      items: [MOCK_CHANNEL_ITEM],
    });

    const input: ParsedChannelInput = {
      type: "username",
      value: "GoogleDevelopers",
    };
    await resolveChannel(input);

    expect(client.youtubeGet).toHaveBeenCalledWith("channels", {
      forUsername: "GoogleDevelopers",
      part: "id,snippet,statistics,contentDetails",
    }, CHANNEL_CACHE);
  });

  it("resolves vanity via forHandle first", async () => {
    vi.mocked(client.youtubeGet).mockResolvedValue({
      items: [MOCK_CHANNEL_ITEM],
    });

    const input: ParsedChannelInput = {
      type: "vanity",
      value: "GoogleDevelopers",
    };
    await resolveChannel(input);

    expect(client.youtubeGet).toHaveBeenCalledWith("channels", {
      forHandle: "GoogleDevelopers",
      part: "id,snippet,statistics,contentDetails",
    }, CHANNEL_CACHE);
  });

  it("falls back to search for vanity when forHandle returns empty", async () => {
    vi.mocked(client.youtubeGet)
      .mockResolvedValueOnce({ items: [] })
      .mockResolvedValueOnce({
        items: [{ id: { channelId: "UCBJycsmduvYEL83R_U4JriQ" } }],
      })
      .mockResolvedValueOnce({ items: [MOCK_CHANNEL_ITEM] });

    const input: ParsedChannelInput = {
      type: "vanity",
      value: "GoogleDevelopers",
    };
    const result = await resolveChannel(input);

    expect(client.youtubeGet).toHaveBeenCalledTimes(3);
    expect(result.id).toBe("UCBJycsmduvYEL83R_U4JriQ");
  });

  it("throws when channel is not found", async () => {
    vi.mocked(client.youtubeGet).mockResolvedValue({ items: [] });

    const input: ParsedChannelInput = { type: "handle", value: "nonexistent" };

    await expect(resolveChannel(input)).rejects.toThrow("Channel not found");
  });

  it("maps all fields correctly to ChannelData", async () => {
    vi.mocked(client.youtubeGet).mockResolvedValue({
      items: [MOCK_CHANNEL_ITEM],
    });

    const input: ParsedChannelInput = { type: "handle", value: "mkbhd" };
    const result = await resolveChannel(input);

    expect(result).toEqual({
      id: "UCBJycsmduvYEL83R_U4JriQ",
      title: "MKBHD",
      description: "Quality Tech Videos",
      customUrl: "@mkbhd",
      thumbnailUrl: "https://yt3.ggpht.com/thumbnail.jpg",
      subscriberCount: 19500000,
      videoCount: 1800,
      viewCount: 4200000000,
      uploadsPlaylistId: "UUBJycsmduvYEL83R_U4JriQ",
    });
  });
});
