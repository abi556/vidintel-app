import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { ApiError } from "@/types";

/**
 * Best-effort client IP for per-connection limits. Vercel and most proxies set
 * `x-forwarded-for` (first hop is the original client).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function createRatelimit(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return null;
  }
  const redis = new Redis({ url, token });
  const perMinute = Math.max(
    10,
    parseInt(process.env.RATE_LIMIT_CHANNEL_PER_MINUTE ?? "60", 10)
  );
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(perMinute, "1 m"),
    prefix: "vidintel:channel-resolve",
  });
}

const channelResolveLimit = createRatelimit();

/**
 * Stops scripted / bot traffic from burning YouTube quota by hammering POST /api/channel.
 * Uses a sliding window per IP when Upstash is configured.
 *
 * Perfect human vs bot detection is not possible without interactive proof (CAPTCHA).
 * A generous per-IP limit blocks obvious automation while allowing real users to retry and explore.
 * (Users behind the same NAT/office IP share one bucket.)
 */
export async function enforceChannelResolveRateLimit(
  request: Request
): Promise<NextResponse | null> {
  if (!channelResolveLimit) {
    return null;
  }
  const ip = getClientIp(request);
  const result = await channelResolveLimit.limit(ip);
  if (result.success) {
    return null;
  }
  const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
  const body: ApiError = {
    code: "RATE_LIMITED",
    message:
      "Too many channel lookups from this connection. Please wait a minute and try again.",
  };
  return NextResponse.json(body, {
    status: 429,
    headers: {
      "Retry-After": String(retryAfter),
      "X-RateLimit-Limit": String(result.limit),
      "X-RateLimit-Remaining": String(result.remaining),
    },
  });
}
