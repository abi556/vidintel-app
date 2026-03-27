import { describe, it, expect } from "vitest";
import { formatCompact, formatPercent, timeAgo, formatDate } from "./formatters";

describe("formatCompact", () => {
  it("formats billions", () => {
    expect(formatCompact(4_200_000_000)).toBe("4.2B");
  });

  it("formats millions", () => {
    expect(formatCompact(19_500_000)).toBe("19.5M");
    expect(formatCompact(1_000_000)).toBe("1M");
  });

  it("formats thousands", () => {
    expect(formatCompact(98_234)).toBe("98.2K");
    expect(formatCompact(1_000)).toBe("1K");
  });

  it("returns raw number below 1K", () => {
    expect(formatCompact(999)).toBe("999");
    expect(formatCompact(0)).toBe("0");
  });
});

describe("formatPercent", () => {
  it("formats engagement rate", () => {
    expect(formatPercent(0.06)).toBe("6.00%");
    expect(formatPercent(0.1234)).toBe("12.34%");
  });
});

describe("timeAgo", () => {
  it("shows days ago", () => {
    const threeDaysAgo = new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000
    ).toISOString();
    expect(timeAgo(threeDaysAgo)).toBe("3d ago");
  });

  it("shows hours ago", () => {
    const fiveHoursAgo = new Date(
      Date.now() - 5 * 60 * 60 * 1000
    ).toISOString();
    expect(timeAgo(fiveHoursAgo)).toBe("5h ago");
  });

  it("shows just now for recent", () => {
    expect(timeAgo(new Date().toISOString())).toBe("just now");
  });
});

describe("formatDate", () => {
  it("formats ISO date to readable string", () => {
    expect(formatDate("2026-03-20T14:00:00Z")).toBe("Mar 20, 2026");
  });
});
