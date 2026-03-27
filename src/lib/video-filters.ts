import type { VideoData } from "@/types";

export type PerformanceFloorMode = "all" | "median_views" | "median_engagement";

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

export interface ListFilterOptions {
  titleQuery: string;
  trendingOnly: boolean;
  performanceMode: PerformanceFloorMode;
  /** Minimum views (inclusive). Null or non-positive = disabled. */
  minViews: number | null;
  /** Minimum engagement as a 0–1 rate. Null or non-positive = disabled. */
  minEngagementRate: number | null;
}

export function applyListFilters(
  videos: VideoData[],
  options: ListFilterOptions
): VideoData[] {
  const q = options.titleQuery.trim().toLowerCase();
  const medViews = median(videos.map((v) => v.viewCount));
  const medEng = median(videos.map((v) => v.engagementRate));

  return videos.filter((v) => {
    if (q && !v.title.toLowerCase().includes(q)) return false;
    if (options.trendingOnly && !v.isTrending) return false;
    if (options.performanceMode === "median_views" && v.viewCount < medViews) {
      return false;
    }
    if (
      options.performanceMode === "median_engagement" &&
      v.engagementRate < medEng
    ) {
      return false;
    }
    if (
      options.minViews != null &&
      options.minViews > 0 &&
      v.viewCount < options.minViews
    ) {
      return false;
    }
    if (
      options.minEngagementRate != null &&
      options.minEngagementRate > 0 &&
      v.engagementRate < options.minEngagementRate
    ) {
      return false;
    }
    return true;
  });
}
