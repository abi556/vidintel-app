import { describe, it, expect, vi, afterEach } from "vitest";
import { getClientIp, resolveChannelResolvePerMinute } from "./rate-limit";

describe("resolveChannelResolvePerMinute", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to 60 when unset", () => {
    delete process.env.RATE_LIMIT_CHANNEL_PER_MINUTE;
    expect(resolveChannelResolvePerMinute()).toBe(60);
  });

  it("treats empty string as invalid and falls back to 60", () => {
    vi.stubEnv("RATE_LIMIT_CHANNEL_PER_MINUTE", "");
    expect(resolveChannelResolvePerMinute()).toBe(60);
  });

  it("treats non-numeric values as invalid and falls back to 60", () => {
    vi.stubEnv("RATE_LIMIT_CHANNEL_PER_MINUTE", "not-a-number");
    expect(resolveChannelResolvePerMinute()).toBe(60);
  });

  it("uses a valid numeric env value", () => {
    vi.stubEnv("RATE_LIMIT_CHANNEL_PER_MINUTE", "120");
    expect(resolveChannelResolvePerMinute()).toBe(120);
  });

  it("enforces a minimum of 10", () => {
    vi.stubEnv("RATE_LIMIT_CHANNEL_PER_MINUTE", "5");
    expect(resolveChannelResolvePerMinute()).toBe(10);
  });
});

describe("getClientIp", () => {
  it("uses the first address in x-forwarded-for", () => {
    const req = new Request("http://localhost/api/channel", {
      headers: { "x-forwarded-for": "203.0.113.1, 10.0.0.1" },
    });
    expect(getClientIp(req)).toBe("203.0.113.1");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("http://localhost/api/channel", {
      headers: { "x-real-ip": "198.51.100.2" },
    });
    expect(getClientIp(req)).toBe("198.51.100.2");
  });

  it("returns unknown when no proxy headers are present", () => {
    const req = new Request("http://localhost/api/channel");
    expect(getClientIp(req)).toBe("unknown");
  });
});
