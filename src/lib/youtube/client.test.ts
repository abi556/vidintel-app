import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { youtubeGet } from "./client";

describe("youtubeGet", () => {
  beforeEach(() => {
    vi.stubEnv("YOUTUBE_API_KEY", "test-api-key");
    vi.restoreAllMocks();
  });

  it("calls the correct YouTube API URL with key and params", async () => {
    const mockResponse = { items: [] };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });
    global.fetch = fetchMock as typeof fetch;

    await youtubeGet("channels", { id: "UC123", part: "snippet" });

    const calledUrl = new URL(String((fetchMock as Mock).mock.calls[0][0]));
    expect(calledUrl.origin + calledUrl.pathname).toBe(
      "https://www.googleapis.com/youtube/v3/channels"
    );
    expect(calledUrl.searchParams.get("key")).toBe("test-api-key");
    expect(calledUrl.searchParams.get("id")).toBe("UC123");
    expect(calledUrl.searchParams.get("part")).toBe("snippet");
  });

  it("passes Next.js revalidate option to fetch", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ items: [] }),
    });
    global.fetch = fetchMock as typeof fetch;

    await youtubeGet("channels", { id: "UC123" }, { revalidate: 3600 });

    const fetchOptions = (fetchMock as Mock).mock.calls[0][1] as {
      next: { revalidate: number };
    };
    expect(fetchOptions.next.revalidate).toBe(3600);
  });

  it("defaults to VIDEO_DATA cache TTL when no revalidate specified", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ items: [] }),
    });
    global.fetch = fetchMock as typeof fetch;

    await youtubeGet("channels", { id: "UC123" });

    const fetchOptions = (fetchMock as Mock).mock.calls[0][1] as {
      next: { revalidate: number };
    };
    expect(fetchOptions.next.revalidate).toBe(300);
  });

  it("returns parsed JSON on success", async () => {
    const mockData = { items: [{ id: "UC123" }] };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await youtubeGet("channels", { id: "UC123" });
    expect(result).toEqual(mockData);
  });

  it("throws on non-ok response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
    });

    await expect(youtubeGet("channels", { id: "UC123" })).rejects.toThrow(
      "YouTube API 403"
    );
  });

  it("throws when API key is missing", async () => {
    vi.stubEnv("YOUTUBE_API_KEY", "");

    await expect(youtubeGet("channels", { id: "UC123" })).rejects.toThrow(
      "YOUTUBE_API_KEY"
    );
  });
});
