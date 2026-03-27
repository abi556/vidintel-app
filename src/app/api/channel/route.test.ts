import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/url-parser", () => ({
  parseChannelInput: vi.fn(),
}));

vi.mock("@/lib/youtube/resolve-channel", () => ({
  resolveChannel: vi.fn(),
}));

import { parseChannelInput } from "@/lib/url-parser";
import { resolveChannel } from "@/lib/youtube/resolve-channel";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/channel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/channel", () => {
  beforeEach(() => {
    vi.mocked(parseChannelInput).mockReset();
    vi.mocked(resolveChannel).mockReset();
  });

  it("returns channelId on valid input", async () => {
    vi.mocked(parseChannelInput).mockReturnValue({
      type: "handle",
      value: "mkbhd",
    });
    vi.mocked(resolveChannel).mockResolvedValue({
      id: "UCBJycsmduvYEL83R_U4JriQ",
      title: "MKBHD",
      description: "Tech",
      customUrl: "@mkbhd",
      thumbnailUrl: "https://example.com/thumb.jpg",
      subscriberCount: 19500000,
      videoCount: 1800,
      viewCount: 4200000000,
      uploadsPlaylistId: "UUBJycsmduvYEL83R_U4JriQ",
    });

    const res = await POST(makeRequest({ input: "@mkbhd" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.channelId).toBe("UCBJycsmduvYEL83R_U4JriQ");
  });

  it("returns 400 when input is missing", async () => {
    const res = await POST(makeRequest({}));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.code).toBe("INVALID_URL");
    expect(data.message).toBeDefined();
  });

  it("returns 400 when input is empty string", async () => {
    const res = await POST(makeRequest({ input: "   " }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.code).toBe("INVALID_URL");
  });

  it("returns 400 when parseChannelInput throws", async () => {
    vi.mocked(parseChannelInput).mockImplementation(() => {
      throw new Error("That looks like a video URL, not a channel.");
    });

    const res = await POST(makeRequest({ input: "https://youtube.com/watch?v=abc" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.code).toBe("INVALID_URL");
    expect(data.message).toContain("video URL");
  });

  it("returns 404 when resolveChannel throws 'not found'", async () => {
    vi.mocked(parseChannelInput).mockReturnValue({
      type: "handle",
      value: "nonexistent",
    });
    vi.mocked(resolveChannel).mockRejectedValue(
      new Error("Channel not found. Double-check the URL.")
    );

    const res = await POST(makeRequest({ input: "@nonexistent" }));
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.code).toBe("CHANNEL_NOT_FOUND");
  });

  it("returns 429 when YouTube quota is exceeded", async () => {
    vi.mocked(parseChannelInput).mockReturnValue({
      type: "handle",
      value: "mkbhd",
    });
    vi.mocked(resolveChannel).mockRejectedValue(
      new Error("YouTube API 403: Forbidden")
    );

    const res = await POST(makeRequest({ input: "@mkbhd" }));
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.code).toBe("QUOTA_EXCEEDED");
  });

  it("returns 502 on unexpected API errors", async () => {
    vi.mocked(parseChannelInput).mockReturnValue({
      type: "handle",
      value: "mkbhd",
    });
    vi.mocked(resolveChannel).mockRejectedValue(
      new Error("YouTube API 500: Internal Server Error")
    );

    const res = await POST(makeRequest({ input: "@mkbhd" }));
    const data = await res.json();

    expect(res.status).toBe(502);
    expect(data.code).toBe("API_ERROR");
  });

  it("returns 500 on network/unknown errors", async () => {
    vi.mocked(parseChannelInput).mockReturnValue({
      type: "handle",
      value: "mkbhd",
    });
    vi.mocked(resolveChannel).mockRejectedValue(new Error("fetch failed"));

    const res = await POST(makeRequest({ input: "@mkbhd" }));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.code).toBe("NETWORK_ERROR");
  });

  it("returns 400 on malformed JSON body", async () => {
    const req = new Request("http://localhost:3000/api/channel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json at all",
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.code).toBe("INVALID_URL");
  });
});
