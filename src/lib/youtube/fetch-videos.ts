import { youtubeGet } from "./client";
import { MAX_RESULTS_PER_PAGE } from "@/lib/constants";
import type { VideoData } from "@/types";

interface PlaylistItemsResponse {
  items: PlaylistItem[];
  nextPageToken?: string;
}

interface PlaylistItem {
  snippet: {
    publishedAt: string;
    title: string;
    resourceId: { videoId: string };
    thumbnails: { high: { url: string } };
  };
}

interface VideosResponse {
  items: VideoStatsItem[];
}

interface VideoStatsItem {
  id: string;
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

export async function fetchRecentVideos(
  uploadsPlaylistId: string,
  days: number
): Promise<VideoData[]> {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const recentItems: PlaylistItem[] = [];
  let pageToken: string | undefined;

  // Paginate through playlistItems until we hit videos older than cutoff
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

    if (!data.items?.length) break;

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

  if (recentItems.length === 0) return [];

  // Batch fetch video statistics
  const videoIds = recentItems.map((i) => i.snippet.resourceId.videoId);
  const statsData = await youtubeGet<VideosResponse>("videos", {
    id: videoIds.join(","),
    part: "statistics",
  });

  const statsMap = new Map(statsData.items.map((s) => [s.id, s.statistics]));

  // Build VideoData array
  const videos: VideoData[] = recentItems
    .map((item) => {
      const stats = statsMap.get(item.snippet.resourceId.videoId);
      if (!stats) return null;

      const views = Number(stats.viewCount);
      const likes = Number(stats.likeCount);
      const comments = Number(stats.commentCount);
      const engagementRate = views > 0 ? (likes + comments) / views : 0;

      return {
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl: item.snippet.thumbnails.high.url,
        viewCount: views,
        likeCount: likes,
        commentCount: comments,
        engagementRate,
        isTrending: false,
      };
    })
    .filter((v): v is VideoData => v !== null);

  // Mark trending: above average views
  if (videos.length > 0) {
    const avgViews =
      videos.reduce((sum, v) => sum + v.viewCount, 0) / videos.length;
    for (const video of videos) {
      video.isTrending = video.viewCount > avgViews;
    }
  }

  return videos;
}
