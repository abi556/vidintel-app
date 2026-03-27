"use client";

import Image from "next/image";
import { useMemo } from "react";
import type { VideoData, ChannelInsights } from "@/types";
import { computeInsights } from "@/lib/analytics";
import { formatCompact } from "@/lib/formatters";
import { CollapsibleSection } from "./collapsible-section";

interface InsightsPanelProps {
  videos: VideoData[];
}

export function InsightsPanel({ videos }: InsightsPanelProps) {
  const insights = useMemo<ChannelInsights | null>(() => {
    if (videos.length === 0) return null;
    return computeInsights(videos);
  }, [videos]);

  if (!insights) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Insights</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <TopPerformersCard insights={insights} />
        <UploadCadenceCard insights={insights} />
        <BestPostingTimeCard insights={insights} />
        <FastestGrowingCard insights={insights} />
      </div>

      {videos.length >= 4 && (
        <CollapsibleSection
          title="Posting Performance Heatmap"
          subtitle="(UTC)"
          defaultOpen={false}
        >
          <HeatmapContent heatmap={insights.bestPostingTime.heatmap} />
        </CollapsibleSection>
      )}
    </div>
  );
}

function TopPerformersCard({ insights }: { insights: ChannelInsights }) {
  const { byViews, byEngagement, byComments } = insights.topPerformers;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
      <div className="flex items-center gap-2">
        <TrophyIcon />
        <h3 className="text-sm font-semibold text-foreground">
          Top Performers
        </h3>
      </div>

      <MiniVideoRow label="Most views" video={byViews} stat={formatCompact(byViews.viewCount)} />
      <MiniVideoRow
        label="Best engagement"
        video={byEngagement}
        stat={`${(byEngagement.engagementRate * 100).toFixed(1)}%`}
      />
      <MiniVideoRow label="Most comments" video={byComments} stat={formatCompact(byComments.commentCount)} />
    </div>
  );
}

function MiniVideoRow({
  label,
  video,
  stat,
}: {
  label: string;
  video: VideoData;
  stat: string;
}) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 group"
    >
      <Image
        src={video.thumbnailUrl}
        alt={video.title}
        width={48}
        height={27}
        className="rounded object-cover shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-xs font-medium text-foreground truncate group-hover:text-accent transition-colors">
          {video.title}
        </p>
      </div>
      <span className="text-xs font-semibold text-accent shrink-0">{stat}</span>
    </a>
  );
}

function UploadCadenceCard({ insights }: { insights: ChannelInsights }) {
  const { avgDaysBetweenUploads, consistencyScore, longestGapDays, shortestGapDays } =
    insights.uploadFrequency;

  const consistencyLabel =
    consistencyScore >= 0.8
      ? "Very consistent"
      : consistencyScore >= 0.5
        ? "Moderate"
        : "Irregular";

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
      <div className="flex items-center gap-2">
        <CalendarIcon />
        <h3 className="text-sm font-semibold text-foreground">
          Upload Cadence
        </h3>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-muted-foreground">Average gap</span>
          <span className="text-lg font-bold text-foreground">
            {avgDaysBetweenUploads}
            <span className="text-xs font-normal text-muted ml-0.5">days</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Consistency</span>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{ width: `${consistencyScore * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-foreground">
              {consistencyLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Shortest: {shortestGapDays}d</span>
          <span>Longest: {longestGapDays}d</span>
        </div>
      </div>
    </div>
  );
}

function BestPostingTimeCard({ insights }: { insights: ChannelInsights }) {
  const { bestDay, bestHour } = insights.bestPostingTime;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ClockIcon />
        <h3 className="text-sm font-semibold text-foreground">
          Best Posting Time
        </h3>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">Best day</p>
          <p className="text-base font-bold text-foreground">{bestDay.name}</p>
          <p className="text-xs text-muted">
            {formatCompact(bestDay.avgViews)} avg views &middot;{" "}
            {bestDay.videoCount} videos
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Best hour (UTC)</p>
          <p className="text-base font-bold text-foreground">{bestHour.name}</p>
          <p className="text-xs text-muted">
            {formatCompact(bestHour.avgViews)} avg views &middot;{" "}
            {bestHour.videoCount} videos
          </p>
        </div>
      </div>
    </div>
  );
}

function FastestGrowingCard({ insights }: { insights: ChannelInsights }) {
  const v = insights.fastestGrowing;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
      <div className="flex items-center gap-2">
        <RocketIcon />
        <h3 className="text-sm font-semibold text-foreground">
          Fastest Growing
        </h3>
      </div>

      <a
        href={`https://www.youtube.com/watch?v=${v.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
          <Image
            src={v.thumbnailUrl}
            alt={v.title}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover"
          />
        </div>
        <p className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-accent transition-colors">
          {v.title}
        </p>
      </a>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Velocity</span>
        <span className="text-sm font-bold text-accent">
          {formatCompact(v.velocity)} views/hr
        </span>
      </div>
    </div>
  );
}

function HeatmapContent({ heatmap }: { heatmap: number[][] }) {
  const maxVal = Math.max(...heatmap.flat().filter((v) => v > 0), 1);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="flex gap-0.5">
          <div className="w-8 shrink-0" />
          {hours.map((h) => (
            <div
              key={h}
              className="flex-1 text-center text-[9px] text-muted-foreground"
            >
              {h % 3 === 0 ? `${h}` : ""}
            </div>
          ))}
        </div>

        {days.map((day, di) => (
          <div key={day} className="flex gap-0.5 mt-0.5">
            <div className="w-8 shrink-0 text-[10px] text-muted-foreground flex items-center">
              {day}
            </div>
            {hours.map((h) => {
              const val = heatmap[di][h];
              const intensity = val > 0 ? Math.max(0.1, val / maxVal) : 0;
              return (
                <div
                  key={h}
                  className="flex-1 aspect-square rounded-sm"
                  style={{
                    backgroundColor:
                      intensity > 0
                        ? `rgba(255, 0, 0, ${intensity})`
                        : "var(--border)",
                  }}
                  title={
                    val > 0
                      ? `${day} ${h}:00 — ${formatCompact(val)} avg views`
                      : `${day} ${h}:00 — No data`
                  }
                />
              );
            })}
          </div>
        ))}

        <div className="flex items-center justify-end gap-1.5 mt-2">
          <span className="text-[9px] text-muted-foreground">Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((opacity) => (
            <div
              key={opacity}
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor:
                  opacity === 0
                    ? "var(--border)"
                    : `rgba(255, 0, 0, ${opacity})`,
              }}
            />
          ))}
          <span className="text-[9px] text-muted-foreground">More</span>
        </div>
      </div>
    </div>
  );
}

function TrophyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning" aria-hidden="true">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-link" aria-hidden="true">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent" aria-hidden="true">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}
