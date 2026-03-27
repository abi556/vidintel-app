import { describe, it, expect } from "vitest";
import { parseChannelInput } from "./url-parser";

describe("parseChannelInput", () => {
  describe("standard channel URL (/channel/UC...)", () => {
    it("extracts channel ID from full URL", () => {
      const result = parseChannelInput(
        "https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw"
      );
      expect(result).toEqual({
        type: "channel_id",
        value: "UC_x5XG1OV2P6uZZ5FSM9Ttw",
      });
    });

    it("handles mobile URL (m.youtube.com)", () => {
      const result = parseChannelInput(
        "https://m.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw"
      );
      expect(result).toEqual({
        type: "channel_id",
        value: "UC_x5XG1OV2P6uZZ5FSM9Ttw",
      });
    });

    it("strips trailing slash", () => {
      const result = parseChannelInput(
        "https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw/"
      );
      expect(result).toEqual({
        type: "channel_id",
        value: "UC_x5XG1OV2P6uZZ5FSM9Ttw",
      });
    });

    it("strips trailing path segments and query params", () => {
      const result = parseChannelInput(
        "https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw/videos?view=0"
      );
      expect(result).toEqual({
        type: "channel_id",
        value: "UC_x5XG1OV2P6uZZ5FSM9Ttw",
      });
    });
  });

  describe("handle URL (/@handle)", () => {
    it("extracts handle from full URL", () => {
      const result = parseChannelInput("https://www.youtube.com/@mkbhd");
      expect(result).toEqual({ type: "handle", value: "mkbhd" });
    });

    it("handles URL without www", () => {
      const result = parseChannelInput("https://youtube.com/@mkbhd");
      expect(result).toEqual({ type: "handle", value: "mkbhd" });
    });

    it("handles mobile URL", () => {
      const result = parseChannelInput("https://m.youtube.com/@mkbhd");
      expect(result).toEqual({ type: "handle", value: "mkbhd" });
    });

    it("strips trailing path segments and params", () => {
      const result = parseChannelInput(
        "https://www.youtube.com/@mkbhd/videos?view=0"
      );
      expect(result).toEqual({ type: "handle", value: "mkbhd" });
    });

    it("handles http (non-https) URL", () => {
      const result = parseChannelInput("http://www.youtube.com/@mkbhd");
      expect(result).toEqual({ type: "handle", value: "mkbhd" });
    });
  });

  describe("bare handle (@handle)", () => {
    it("parses bare handle with @", () => {
      const result = parseChannelInput("@mkbhd");
      expect(result).toEqual({ type: "handle", value: "mkbhd" });
    });

    it("parses bare handle with spaces around it", () => {
      const result = parseChannelInput("  @mkbhd  ");
      expect(result).toEqual({ type: "handle", value: "mkbhd" });
    });
  });

  describe("legacy username URL (/user/)", () => {
    it("extracts username", () => {
      const result = parseChannelInput(
        "https://www.youtube.com/user/GoogleDevelopers"
      );
      expect(result).toEqual({ type: "username", value: "GoogleDevelopers" });
    });

    it("strips trailing path and params", () => {
      const result = parseChannelInput(
        "https://www.youtube.com/user/GoogleDevelopers/videos"
      );
      expect(result).toEqual({ type: "username", value: "GoogleDevelopers" });
    });
  });

  describe("vanity/custom URL (/c/)", () => {
    it("extracts vanity name", () => {
      const result = parseChannelInput(
        "https://www.youtube.com/c/GoogleDevelopers"
      );
      expect(result).toEqual({ type: "vanity", value: "GoogleDevelopers" });
    });

    it("strips trailing path and params", () => {
      const result = parseChannelInput(
        "https://www.youtube.com/c/GoogleDevelopers/about"
      );
      expect(result).toEqual({ type: "vanity", value: "GoogleDevelopers" });
    });
  });

  describe("bare channel ID (UC...)", () => {
    it("detects raw channel ID pasted directly", () => {
      const result = parseChannelInput("UC_x5XG1OV2P6uZZ5FSM9Ttw");
      expect(result).toEqual({
        type: "direct_id",
        value: "UC_x5XG1OV2P6uZZ5FSM9Ttw",
      });
    });

    it("handles whitespace around raw ID", () => {
      const result = parseChannelInput("  UC_x5XG1OV2P6uZZ5FSM9Ttw  ");
      expect(result).toEqual({
        type: "direct_id",
        value: "UC_x5XG1OV2P6uZZ5FSM9Ttw",
      });
    });
  });

  describe("invalid inputs", () => {
    it("rejects video URL with specific message", () => {
      expect(() =>
        parseChannelInput("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
      ).toThrow("Please enter a channel URL, not a video link");
    });

    it("rejects youtu.be short video link", () => {
      expect(() =>
        parseChannelInput("https://youtu.be/dQw4w9WgXcQ")
      ).toThrow("Please enter a channel URL, not a video link");
    });

    it("rejects non-YouTube URL", () => {
      expect(() =>
        parseChannelInput("https://vimeo.com/channels/staffpicks")
      ).toThrow("Only YouTube channel URLs are supported");
    });

    it("rejects plain non-URL text", () => {
      expect(() => parseChannelInput("some random text")).toThrow();
    });

    it("rejects empty string", () => {
      expect(() => parseChannelInput("")).toThrow();
    });

    it("rejects whitespace-only string", () => {
      expect(() => parseChannelInput("   ")).toThrow();
    });

    it("rejects YouTube playlist URL", () => {
      expect(() =>
        parseChannelInput(
          "https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf"
        )
      ).toThrow();
    });
  });
});
