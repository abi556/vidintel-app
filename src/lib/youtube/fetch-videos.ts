import { youtubeGet } from "./client";
import { MAX_RESULTS_PER_PAGE } from "@/lib/constants";
import type { VideoData } from "@/types";

interface PlaylistItemsResponse {
  items?: PlaylistItem[];
  nextPageToken?: string;
}

interface PlaylistItem {
  snippet: {
    publishedAt: string;
    title: string;
    resourceId: { videoId: string };
    thumbnails: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
  };
}

interface VideosResponse {
  items?: VideoStatsItem[];
}

interface VideoStatsItem {
  id: string;
  statistics: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

const STATS_BATCH_SIZE = 50;

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export async function fetchRecentVideos(
  uploadsPlaylistId: string,
  days: number
): Promise<VideoData[]> {
  if (!uploadsPlaylistId) {
    console.warn("[Vidintel] No uploads playlist ID — skipping video fetch");
    return [];
  }

  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const recentItems: PlaylistItem[] = [];
  let pageToken: string | undefined;
  let pageCount = 0;

  do {
    const params: Record<string, string> = {
      playlistId: uploadsPlaylistId,
      part: "snippet",
      maxResults: String(MAX_RESULTS_PER_PAGE),
    };
    if (pageToken) params.pageToken = pageToken;

    const data = await youtubeGet<PlaylistItemsResponse>(
      "playlistItems",
      params
    );

    pageCount++;

    if (!data.items?.length) {
      console.warn(
        `[Vidintel] playlistItems page ${pageCount} returned 0 items for ${uploadsPlaylistId}`
      );
      break;
    }

    let hitOldVideo = false;
    for (const item of data.items) {
      const publishedAt = new Date(item.snippet.publishedAt);
      if (publishedAt >= cutoff) {
        recentItems.push(item);
      } else {
        hitOldVideo = true;
        break;
      }
    }

    if (hitOldVideo) break;
    pageToken = data.nextPageToken;
  } while (pageToken);

  console.info(
    `[Vidintel] Found ${recentItems.length} videos in last ${days}d for ${uploadsPlaylistId} (${pageCount} API pages)`
  );

  if (recentItems.length === 0) return [];

  const videoIds = recentItems.map((i) => i.snippet.resourceId.videoId);
  const batches = chunk(videoIds, STATS_BATCH_SIZE);
  const statsMap = new Map<string, VideoStatsItem["statistics"]>();

  for (const batch of batches) {
    const statsData = await youtubeGet<VideosResponse>("videos", {
      id: batch.join(","),
      part: "statistics",
    });
    if (statsData.items) {
      for (const s of statsData.items) {
        statsMap.set(s.id, s.statistics);
      }
    }
  }

  const videos: VideoData[] = recentItems
    .map((item) => {
      const stats = statsMap.get(item.snippet.resourceId.videoId);
      if (!stats) return null;

      const views = Number(stats.viewCount ?? 0);
      const likes = Number(stats.likeCount ?? 0);
      const comments = Number(stats.commentCount ?? 0);
      const engagementRate = views > 0 ? (likes + comments) / views : 0;

      const thumb =
        item.snippet.thumbnails.high ??
        item.snippet.thumbnails.medium ??
        item.snippet.thumbnails.default;

      return {
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl:
          thumb?.url ??
          `https://i.ytimg.com/vi/${item.snippet.resourceId.videoId}/hqdefault.jpg`,
        viewCount: views,
        likeCount: likes,
        commentCount: comments,
        engagementRate,
        isTrending: false,
      };
    })
    .filter((v): v is VideoData => v !== null);

  if (videos.length > 0) {
    const avgViews =
      videos.reduce((sum, v) => sum + v.viewCount, 0) / videos.length;
    for (const video of videos) {
      video.isTrending = video.viewCount > avgViews;
    }
  }

  return videos;
}
