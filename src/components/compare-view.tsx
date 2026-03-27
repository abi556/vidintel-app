"use client";

import Image from "next/image";
import { useMemo } from "react";
import type { ChannelData, VideoData, ChannelInsights } from "@/types";
import { computeInsights } from "@/lib/analytics";
import { formatCompact, formatPercent } from "@/lib/formatters";

interface CompareViewProps {
  channelA: ChannelData;
  videosA: VideoData[];
  channelB: ChannelData;
  videosB: VideoData[];
}

type Winner = "a" | "b" | "tie";

interface MetricRow {
  label: string;
  valueA: string;
  valueB: string;
  rawA: number;
  rawB: number;
  higherIsBetter: boolean;
}

export function CompareView({
  channelA,
  videosA,
  channelB,
  videosB,
}: CompareViewProps) {
  const insightsA = useMemo<ChannelInsights | null>(
    () => (videosA.length > 0 ? computeInsights(videosA) : null),
    [videosA]
  );
  const insightsB = useMemo<ChannelInsights | null>(
    () => (videosB.length > 0 ? computeInsights(videosB) : null),
    [videosB]
  );

  const avgViewsA =
    videosA.length > 0
      ? videosA.reduce((s, v) => s + v.viewCount, 0) / videosA.length
      : 0;
  const avgViewsB =
    videosB.length > 0
      ? videosB.reduce((s, v) => s + v.viewCount, 0) / videosB.length
      : 0;

  const validEngA = videosA.filter((v) => Number.isFinite(v.engagementRate));
  const validEngB = videosB.filter((v) => Number.isFinite(v.engagementRate));
  const avgEngA =
    validEngA.length > 0
      ? validEngA.reduce((s, v) => s + v.engagementRate, 0) / validEngA.length
      : 0;
  const avgEngB =
    validEngB.length > 0
      ? validEngB.reduce((s, v) => s + v.engagementRate, 0) / validEngB.length
      : 0;

  const trendingA = videosA.filter((v) => v.isTrending).length;
  const trendingB = videosB.filter((v) => v.isTrending).length;

  const metrics: MetricRow[] = [
    {
      label: "Subscribers",
      valueA: formatCompact(channelA.subscriberCount),
      valueB: formatCompact(channelB.subscriberCount),
      rawA: channelA.subscriberCount,
      rawB: channelB.subscriberCount,
      higherIsBetter: true,
    },
    {
      label: "Total Views",
      valueA: formatCompact(channelA.viewCount),
      valueB: formatCompact(channelB.viewCount),
      rawA: channelA.viewCount,
      rawB: channelB.viewCount,
      higherIsBetter: true,
    },
    {
      label: "Videos Analyzed",
      valueA: String(videosA.length),
      valueB: String(videosB.length),
      rawA: videosA.length,
      rawB: videosB.length,
      higherIsBetter: true,
    },
    {
      label: "Avg. Views",
      valueA: formatCompact(Math.round(avgViewsA)),
      valueB: formatCompact(Math.round(avgViewsB)),
      rawA: avgViewsA,
      rawB: avgViewsB,
      higherIsBetter: true,
    },
    {
      label: "Avg. Engagement",
      valueA: formatPercent(avgEngA),
      valueB: formatPercent(avgEngB),
      rawA: avgEngA,
      rawB: avgEngB,
      higherIsBetter: true,
    },
    {
      label: "Trending Videos",
      valueA: `${trendingA} / ${videosA.length}`,
      valueB: `${trendingB} / ${videosB.length}`,
      rawA: trendingA,
      rawB: trendingB,
      higherIsBetter: true,
    },
    {
      label: "Upload Frequency",
      valueA: insightsA
        ? `${insightsA.uploadFrequency.avgDaysBetweenUploads}d`
        : "N/A",
      valueB: insightsB
        ? `${insightsB.uploadFrequency.avgDaysBetweenUploads}d`
        : "N/A",
      rawA: insightsA?.uploadFrequency.avgDaysBetweenUploads ?? 999,
      rawB: insightsB?.uploadFrequency.avgDaysBetweenUploads ?? 999,
      higherIsBetter: false,
    },
    {
      label: "Consistency",
      valueA: insightsA
        ? `${Math.round(insightsA.uploadFrequency.consistencyScore * 100)}%`
        : "N/A",
      valueB: insightsB
        ? `${Math.round(insightsB.uploadFrequency.consistencyScore * 100)}%`
        : "N/A",
      rawA: insightsA?.uploadFrequency.consistencyScore ?? 0,
      rawB: insightsB?.uploadFrequency.consistencyScore ?? 0,
      higherIsBetter: true,
    },
    {
      label: "Best Posting Day",
      valueA: insightsA?.bestPostingTime.bestDay.name ?? "N/A",
      valueB: insightsB?.bestPostingTime.bestDay.name ?? "N/A",
      rawA: 0,
      rawB: 0,
      higherIsBetter: true,
    },
    {
      label: "Fastest Growing",
      valueA: insightsA
        ? `${formatCompact(insightsA.fastestGrowing.velocity)}/hr`
        : "N/A",
      valueB: insightsB
        ? `${formatCompact(insightsB.fastestGrowing.velocity)}/hr`
        : "N/A",
      rawA: insightsA?.fastestGrowing.velocity ?? 0,
      rawB: insightsB?.fastestGrowing.velocity ?? 0,
      higherIsBetter: true,
    },
  ];

  function getWinner(row: MetricRow): Winner {
    if (row.rawA === row.rawB) return "tie";
    if (row.label === "Best Posting Day") return "tie";
    return row.higherIsBetter
      ? row.rawA > row.rawB
        ? "a"
        : "b"
      : row.rawA < row.rawB
        ? "a"
        : "b";
  }

  const winsA = metrics.filter((m) => getWinner(m) === "a").length;
  const winsB = metrics.filter((m) => getWinner(m) === "b").length;

  return (
    <div className="space-y-6">
      {/* Channel headers */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <ChannelCard channel={channelA} videoCount={videosA.length} />
        <div className="flex flex-col items-center gap-1 px-4">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            vs
          </span>
        </div>
        <ChannelCard channel={channelB} videoCount={videosB.length} />
      </div>

      {/* Score summary */}
      <div className="flex items-center justify-center gap-4 rounded-xl border border-border bg-surface p-4">
        <div className={`text-center ${winsA > winsB ? "text-success" : "text-muted"}`}>
          <p className="text-2xl font-bold">{winsA}</p>
          <p className="text-xs">wins</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className={`text-center ${winsB > winsA ? "text-success" : "text-muted"}`}>
          <p className="text-2xl font-bold">{winsB}</p>
          <p className="text-xs">wins</p>
        </div>
      </div>

      {/* Metrics table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface text-xs text-muted-foreground">
              <th className="text-left px-4 py-3 font-medium">Metric</th>
              <th className="text-right px-4 py-3 font-medium">
                {channelA.title}
              </th>
              <th className="text-right px-4 py-3 font-medium">
                {channelB.title}
              </th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((row) => {
              const winner = getWinner(row);
              return (
                <tr
                  key={row.label}
                  className="border-t border-border hover:bg-surface/50 transition-colors"
                >
                  <td className="px-4 py-2.5 text-muted">{row.label}</td>
                  <td
                    className={`px-4 py-2.5 text-right font-medium ${
                      winner === "a"
                        ? "text-success"
                        : "text-foreground"
                    }`}
                  >
                    {row.valueA}
                    {winner === "a" && (
                      <WinBadge />
                    )}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right font-medium ${
                      winner === "b"
                        ? "text-success"
                        : "text-foreground"
                    }`}
                  >
                    {row.valueB}
                    {winner === "b" && (
                      <WinBadge />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChannelCard({
  channel,
  videoCount,
}: {
  channel: ChannelData;
  videoCount: number;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-4">
      <Image
        src={channel.thumbnailUrl}
        alt={channel.title}
        width={56}
        height={56}
        className="rounded-full"
      />
      <div className="text-center">
        <h3 className="text-sm font-semibold text-foreground">
          {channel.title}
        </h3>
        <p className="text-xs text-muted">{channel.customUrl}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {videoCount} videos analyzed
        </p>
      </div>
    </div>
  );
}

function WinBadge() {
  return (
    <span className="ml-1.5 inline-flex items-center" title="Winner">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-success"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}
