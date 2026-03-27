"use client";

import { useState, useMemo, useCallback } from "react";
import type { VideoData, ChannelData, SortKey, SortDirection, DateRange } from "@/types";
import { DATE_RANGE_DAYS } from "@/lib/constants";
import { getViewVelocity } from "@/lib/analytics";
import { SortControls } from "./sort-controls";
import { DateFilter } from "./date-filter";
import { VideoCard } from "./video-card";
import { PerformanceChart } from "./performance-chart";
import { InsightsPanel } from "./insights-panel";
import { ExportDropdown } from "./export-dropdown";

interface VideoListProps {
  videos: VideoData[];
  channel: ChannelData;
}

const SORT_ACCESSORS: Record<SortKey, (v: VideoData) => number> = {
  views: (v) => v.viewCount,
  likes: (v) => v.likeCount,
  date: (v) => new Date(v.publishedAt).getTime(),
  engagement: (v) => v.engagementRate,
};

export function VideoList({ videos, channel }: VideoListProps) {
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  const toggleDirection = useCallback(() => {
    setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
  }, []);

  const velocityMap = useMemo(() => {
    const map = new Map<string, number>();
    if (videos.length > 0) {
      for (const v of getViewVelocity(videos)) {
        map.set(v.id, v.velocity);
      }
    }
    return map;
  }, [videos]);

  const filtered = useMemo(() => {
    const daysLimit = DATE_RANGE_DAYS[dateRange];
    if (daysLimit === Infinity) return videos;

    const cutoff = Date.now() - daysLimit * 24 * 60 * 60 * 1000;
    return videos.filter((v) => new Date(v.publishedAt).getTime() >= cutoff);
  }, [videos, dateRange]);

  const sorted = useMemo(() => {
    const accessor = SORT_ACCESSORS[sortKey];
    const multiplier = sortDirection === "desc" ? -1 : 1;
    return [...filtered].sort(
      (a, b) => multiplier * (accessor(a) - accessor(b))
    );
  }, [filtered, sortKey, sortDirection]);

  return (
    <div className="space-y-6">
      <InsightsPanel videos={videos} />

      <PerformanceChart videos={filtered} />

      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Videos</h2>
            <span className="text-xs text-muted-foreground">
              {sorted.length} of {videos.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <DateFilter selected={dateRange} onChange={setDateRange} />
            <SortControls
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortKeyChange={setSortKey}
              onSortDirectionToggle={toggleDirection}
            />
            <ExportDropdown videos={sorted} channel={channel} />
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-12 text-center">
            <p className="text-sm text-muted">
              No videos found in this date range.
            </p>
            <button
              onClick={() => setDateRange("all")}
              className="mt-3 text-xs text-accent hover:underline cursor-pointer"
            >
              Show all videos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                velocity={velocityMap.get(video.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
