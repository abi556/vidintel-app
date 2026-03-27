"use client";

import { useState, useMemo, useCallback } from "react";
import type { VideoData, ChannelData, SortKey, SortDirection, DateRange } from "@/types";
import { DATE_RANGE_DAYS } from "@/lib/constants";
import { getViewVelocity } from "@/lib/analytics";
import {
  applyListFilters,
  type PerformanceFloorMode,
} from "@/lib/video-filters";
import { SortControls } from "./sort-controls";
import { DateFilter } from "./date-filter";
import { VideoListFilters } from "./video-list-filters";
import { VideoCard } from "./video-card";
import { PerformanceChart } from "./performance-chart";
import { InsightsPanel } from "./insights-panel";
import { ExportDropdown } from "./export-dropdown";

function parseMinViews(raw: string): number | null {
  const t = raw.trim().replace(/,/g, "");
  if (!t) return null;
  const n = Number.parseInt(t, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseMinEngagementRatePercent(raw: string): number | null {
  const t = raw.trim().replace(",", ".");
  if (!t) return null;
  const n = Number.parseFloat(t);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.min(n / 100, 1);
}

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
  const [anchorNow, setAnchorNow] = useState<number>(() => Date.now());
  const [titleQuery, setTitleQuery] = useState("");
  const [trendingOnly, setTrendingOnly] = useState(false);
  const [performanceMode, setPerformanceMode] =
    useState<PerformanceFloorMode>("all");
  const [minViewsInput, setMinViewsInput] = useState("");
  const [minEngagementPercentInput, setMinEngagementPercentInput] =
    useState("");

  const toggleDirection = useCallback(() => {
    setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
  }, []);

  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
    setAnchorNow(Date.now());
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

  const dateFiltered = useMemo(() => {
    const daysLimit = DATE_RANGE_DAYS[dateRange];
    if (daysLimit === Infinity) return videos;

    const cutoff = anchorNow - daysLimit * 24 * 60 * 60 * 1000;
    return videos.filter((v) => new Date(v.publishedAt).getTime() >= cutoff);
  }, [videos, dateRange, anchorNow]);

  const listFiltered = useMemo(() => {
    const minViews = parseMinViews(minViewsInput);
    const minEngagementRate = parseMinEngagementRatePercent(
      minEngagementPercentInput
    );
    return applyListFilters(dateFiltered, {
      titleQuery,
      trendingOnly,
      performanceMode,
      minViews,
      minEngagementRate,
    });
  }, [
    dateFiltered,
    titleQuery,
    trendingOnly,
    performanceMode,
    minViewsInput,
    minEngagementPercentInput,
  ]);

  const sorted = useMemo(() => {
    const accessor = SORT_ACCESSORS[sortKey];
    const multiplier = sortDirection === "desc" ? -1 : 1;
    return [...listFiltered].sort(
      (a, b) => multiplier * (accessor(a) - accessor(b))
    );
  }, [listFiltered, sortKey, sortDirection]);

  const clearListFilters = useCallback(() => {
    setTitleQuery("");
    setTrendingOnly(false);
    setPerformanceMode("all");
    setMinViewsInput("");
    setMinEngagementPercentInput("");
  }, []);

  return (
    <div className="space-y-6">
      <InsightsPanel videos={videos} />

      <PerformanceChart videos={dateFiltered} />

      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Videos</h2>
            <span className="text-xs text-muted-foreground">
              {sorted.length} of {videos.length}
            </span>
          </div>

          <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            <div className="w-full sm:w-auto">
              <DateFilter selected={dateRange} onChange={handleDateRangeChange} />
            </div>
            <div className="w-full sm:w-auto">
              <SortControls
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSortKeyChange={setSortKey}
                onSortDirectionToggle={toggleDirection}
              />
            </div>
            <div className="w-full sm:w-auto">
              <ExportDropdown videos={sorted} channel={channel} />
            </div>
          </div>
        </div>

        <VideoListFilters
          titleQuery={titleQuery}
          onTitleQueryChange={setTitleQuery}
          trendingOnly={trendingOnly}
          onTrendingOnlyChange={setTrendingOnly}
          performanceMode={performanceMode}
          onPerformanceModeChange={setPerformanceMode}
          minViewsInput={minViewsInput}
          onMinViewsInputChange={setMinViewsInput}
          minEngagementPercentInput={minEngagementPercentInput}
          onMinEngagementPercentInputChange={setMinEngagementPercentInput}
        />

        {dateFiltered.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-12 text-center">
            <p className="text-sm text-muted">
              No videos found in this date range.
            </p>
            <button
              type="button"
              onClick={() => handleDateRangeChange("90d")}
              className="mt-3 text-xs text-accent hover:underline cursor-pointer"
            >
              Show 90 days
            </button>
          </div>
        ) : sorted.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-12 text-center">
            <p className="text-sm text-muted">
              No videos match your filters. Try widening the search or turning
              off some options.
            </p>
            <button
              type="button"
              onClick={clearListFilters}
              className="mt-3 text-xs text-accent hover:underline cursor-pointer"
            >
              Clear filters
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
