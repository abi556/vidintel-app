"use client";

import type { PerformanceFloorMode } from "@/lib/video-filters";

interface VideoListFiltersProps {
  titleQuery: string;
  onTitleQueryChange: (value: string) => void;
  trendingOnly: boolean;
  onTrendingOnlyChange: (value: boolean) => void;
  performanceMode: PerformanceFloorMode;
  onPerformanceModeChange: (value: PerformanceFloorMode) => void;
  minViewsInput: string;
  onMinViewsInputChange: (value: string) => void;
  minEngagementPercentInput: string;
  onMinEngagementPercentInputChange: (value: string) => void;
}

const FLOOR_OPTIONS: { value: PerformanceFloorMode; label: string }[] = [
  { value: "all", label: "All videos" },
  { value: "median_views", label: "Above median views" },
  { value: "median_engagement", label: "Above median engagement" },
];

export function VideoListFilters({
  titleQuery,
  onTitleQueryChange,
  trendingOnly,
  onTrendingOnlyChange,
  performanceMode,
  onPerformanceModeChange,
  minViewsInput,
  onMinViewsInputChange,
  minEngagementPercentInput,
  onMinEngagementPercentInputChange,
}: VideoListFiltersProps) {
  return (
    <div className="flex flex-col gap-3 mb-5">
      <div className="w-full">
        <label htmlFor="video-title-search" className="sr-only">
          Search video titles
        </label>
        <input
          id="video-title-search"
          type="search"
          value={titleQuery}
          onChange={(e) => onTitleQueryChange(e.target.value)}
          placeholder="Search titles…"
          autoComplete="off"
          className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <button
          type="button"
          onClick={() => onTrendingOnlyChange(!trendingOnly)}
          aria-pressed={trendingOnly}
          className={`h-8 shrink-0 rounded-lg px-3 text-xs font-medium transition-colors cursor-pointer ${
            trendingOnly
              ? "bg-accent text-white"
              : "text-muted hover:text-foreground hover:bg-surface-hover border border-border bg-surface"
          }`}
        >
          Trending only
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-[min(100%,280px)]">
          <label htmlFor="performance-floor" className="sr-only">
            Performance floor
          </label>
          <select
            id="performance-floor"
            value={performanceMode}
            onChange={(e) =>
              onPerformanceModeChange(e.target.value as PerformanceFloorMode)
            }
            className="h-8 w-full rounded-lg border border-border bg-surface px-2 text-xs text-foreground outline-none cursor-pointer"
          >
            {FLOOR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="min-views"
              className="text-xs text-muted-foreground whitespace-nowrap"
            >
              Min views
            </label>
            <input
              id="min-views"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={minViewsInput}
              onChange={(e) => onMinViewsInputChange(e.target.value)}
              className="h-8 w-30 rounded-lg border border-border bg-surface px-2 text-xs text-foreground tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="min-engagement"
              className="text-xs text-muted-foreground whitespace-nowrap"
            >
              Min engagement %
            </label>
            <input
              id="min-engagement"
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={0.1}
              value={minEngagementPercentInput}
              onChange={(e) =>
                onMinEngagementPercentInputChange(e.target.value)
              }
              className="h-8 w-18 rounded-lg border border-border bg-surface px-2 text-xs text-foreground tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
