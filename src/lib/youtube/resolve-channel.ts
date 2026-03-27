import { youtubeGet } from "./client";
import { CACHE_TTL } from "@/lib/constants";
import type { ChannelData, ParsedChannelInput } from "@/types";

const CHANNEL_PARTS = "id,snippet,statistics,contentDetails";

interface YouTubeChannelResponse {
  items: YouTubeChannelItem[];
}

interface YouTubeChannelItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl: string;
    thumbnails: { high: { url: string } };
  };
  statistics: {
    subscriberCount: string;
    videoCount: string;
    viewCount: string;
  };
  contentDetails: {
    relatedPlaylists: { uploads: string };
  };
}

interface YouTubeSearchResponse {
  items: { id: { channelId: string } }[];
}

function mapToChannelData(item: YouTubeChannelItem): ChannelData {
  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    customUrl: item.snippet.customUrl,
    thumbnailUrl: item.snippet.thumbnails.high.url,
    subscriberCount: Number(item.statistics.subscriberCount),
    videoCount: Number(item.statistics.videoCount),
    viewCount: Number(item.statistics.viewCount),
    uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads,
  };
}

export async function resolveChannel(
  input: ParsedChannelInput
): Promise<ChannelData> {
  const params: Record<string, string> = { part: CHANNEL_PARTS };

  switch (input.type) {
    case "channel_id":
    case "direct_id":
      params.id = input.value;
      break;
    case "handle":
      params.forHandle = input.value;
      break;
    case "username":
      params.forUsername = input.value;
      break;
    case "vanity":
      params.forHandle = input.value;
      break;
  }

  const channelCacheTTL = { revalidate: CACHE_TTL.CHANNEL_RESOLUTION };

  const data = await youtubeGet<YouTubeChannelResponse>(
    "channels",
    params,
    channelCacheTTL
  );

  if (data.items?.length > 0) {
    return mapToChannelData(data.items[0]);
  }

  // Vanity fallback: try search.list (100 units, no long cache)
  if (input.type === "vanity") {
    const searchData = await youtubeGet<YouTubeSearchResponse>("search", {
      q: input.value,
      type: "channel",
      maxResults: "1",
      part: "snippet",
    });

    if (searchData.items?.length > 0) {
      const channelId = searchData.items[0].id.channelId;
      const channelData = await youtubeGet<YouTubeChannelResponse>(
        "channels",
        { id: channelId, part: CHANNEL_PARTS },
        channelCacheTTL
      );

      if (channelData.items?.length > 0) {
        return mapToChannelData(channelData.items[0]);
      }
    }
  }

  throw new Error("Channel not found. Double-check the URL.");
}
