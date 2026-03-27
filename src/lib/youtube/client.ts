import { YOUTUBE_API_BASE, CACHE_TTL } from "@/lib/constants";

interface YoutubeGetOptions {
  revalidate?: number;
}

export async function youtubeGet<T>(
  endpoint: string,
  params: Record<string, string>,
  options?: YoutubeGetOptions
): Promise<T> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY environment variable is not set");
  }

  const url = new URL(`${YOUTUBE_API_BASE}/${endpoint}`);
  url.searchParams.set("key", apiKey);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const revalidate = options?.revalidate ?? CACHE_TTL.VIDEO_DATA;

  const res = await fetch(url.toString(), {
    next: { revalidate },
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body?.error?.message ?? JSON.stringify(body?.error ?? body);
    } catch {}
    throw new Error(`YouTube API ${res.status}: ${detail}`);
  }

  return res.json();
}
