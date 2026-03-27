import { NextResponse } from "next/server";
import { parseChannelInput } from "@/lib/url-parser";
import { resolveChannel } from "@/lib/youtube/resolve-channel";
import type { ApiError } from "@/types";

function errorResponse(status: number, error: ApiError) {
  return NextResponse.json(error, { status });
}

export async function POST(request: Request) {
  let body: { input?: string };

  try {
    body = await request.json();
  } catch {
    return errorResponse(400, {
      code: "INVALID_URL",
      message: "Invalid request body. Send JSON with an 'input' field.",
    });
  }

  const raw = body.input?.trim();
  if (!raw) {
    return errorResponse(400, {
      code: "INVALID_URL",
      message: "Please provide a YouTube channel URL, handle, or ID.",
    });
  }

  let parsed;
  try {
    parsed = parseChannelInput(raw);
  } catch (err) {
    return errorResponse(400, {
      code: "INVALID_URL",
      message: err instanceof Error ? err.message : "Could not parse that input.",
    });
  }

  try {
    const channel = await resolveChannel(parsed);
    return NextResponse.json({ channelId: channel.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.toLowerCase().includes("not found")) {
      return errorResponse(404, {
        code: "CHANNEL_NOT_FOUND",
        message: "Channel not found. Double-check the URL.",
      });
    }

    if (message.includes("403")) {
      return errorResponse(429, {
        code: "QUOTA_EXCEEDED",
        message: "Daily API limit reached. Try again tomorrow.",
      });
    }

    if (message.includes("YouTube API")) {
      return errorResponse(502, {
        code: "API_ERROR",
        message: "YouTube API is having issues. Try again shortly.",
        detail: message,
      });
    }

    return errorResponse(500, {
      code: "NETWORK_ERROR",
      message: "Something went wrong. Please try again.",
      detail: message,
    });
  }
}
