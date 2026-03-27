import type { ChannelData, VideoData, ChannelInsights } from "@/types";
import { PRODUCT_DESCRIPTOR } from "@/lib/constants";

interface ExportPayload {
  meta: {
    exportedAt: string;
    generator: string;
    version: string;
    productTagline: string;
  };
  channel: {
    id: string;
    title: string;
    customUrl: string;
    subscriberCount: number;
    viewCount: number;
    videoCount: number;
  };
  insights: {
    topPerformers: {
      byViews: string;
      byEngagement: string;
      byComments: string;
    };
    uploadFrequency: ChannelInsights["uploadFrequency"];
    bestPostingTime: {
      bestDay: string;
      bestHour: string;
    };
    fastestGrowing: {
      videoId: string;
      title: string;
      velocity: number;
    };
  };
  videos: Array<{
    id: string;
    title: string;
    publishedAt: string;
    url: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    engagementRate: number;
    isTrending: boolean;
  }>;
}

export function videosToJSON(
  channel: ChannelData,
  videos: VideoData[],
  insights: ChannelInsights | null
): string {
  const payload: ExportPayload = {
    meta: {
      exportedAt: new Date().toISOString(),
      generator: "Vidintel",
      version: "1.0.0",
      productTagline: PRODUCT_DESCRIPTOR,
    },
    channel: {
      id: channel.id,
      title: channel.title,
      customUrl: channel.customUrl,
      subscriberCount: channel.subscriberCount,
      viewCount: channel.viewCount,
      videoCount: channel.videoCount,
    },
    insights: insights
      ? {
          topPerformers: {
            byViews: insights.topPerformers.byViews.title,
            byEngagement: insights.topPerformers.byEngagement.title,
            byComments: insights.topPerformers.byComments.title,
          },
          uploadFrequency: insights.uploadFrequency,
          bestPostingTime: {
            bestDay: insights.bestPostingTime.bestDay.name,
            bestHour: insights.bestPostingTime.bestHour.name,
          },
          fastestGrowing: {
            videoId: insights.fastestGrowing.id,
            title: insights.fastestGrowing.title,
            velocity: insights.fastestGrowing.velocity,
          },
        }
      : {
          topPerformers: { byViews: "", byEngagement: "", byComments: "" },
          uploadFrequency: {
            avgDaysBetweenUploads: 0,
            consistencyScore: 0,
            longestGapDays: 0,
            shortestGapDays: 0,
          },
          bestPostingTime: { bestDay: "", bestHour: "" },
          fastestGrowing: { videoId: "", title: "", velocity: 0 },
        },
    videos: videos.map((v) => ({
      id: v.id,
      title: v.title,
      publishedAt: v.publishedAt,
      url: `https://www.youtube.com/watch?v=${v.id}`,
      viewCount: v.viewCount,
      likeCount: v.likeCount,
      commentCount: v.commentCount,
      engagementRate: v.engagementRate,
      isTrending: v.isTrending,
    })),
  };

  return JSON.stringify(payload, null, 2);
}

export function downloadJSON(json: string, filename: string): void {
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
