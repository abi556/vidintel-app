import { describe, it, expect } from "vitest";
import { getClientIp } from "./rate-limit";

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
