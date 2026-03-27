export interface ChannelData {
  id: string;
  title: string;
  description: string;
  customUrl: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  uploadsPlaylistId: string;
}

export interface VideoData {
  id: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  engagementRate: number;
  isTrending: boolean;
}

export interface AnalysisResult {
  channel: ChannelData;
  videos: VideoData[];
  fetchedAt: string;
  videoCount: number;
}

export type SortKey = "views" | "likes" | "date" | "engagement";
export type SortDirection = "asc" | "desc";
export type DateRange = "7d" | "30d" | "90d" | "all";

export type ChannelInputType =
  | "channel_id"
  | "handle"
  | "username"
  | "vanity"
  | "direct_id";

export interface ParsedChannelInput {
  type: ChannelInputType;
  value: string;
}

export interface ApiError {
  code:
    | "CHANNEL_NOT_FOUND"
    | "INVALID_URL"
    | "QUOTA_EXCEEDED"
    | "API_ERROR"
    | "NETWORK_ERROR";
  message: string;
  detail?: string;
}
