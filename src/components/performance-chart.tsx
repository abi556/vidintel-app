"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { VideoData } from "@/types";
import { formatCompact } from "@/lib/formatters";

interface PerformanceChartProps {
  videos: VideoData[];
}

type Metric = "views" | "engagement";

interface ChartPoint {
  date: string;
  label: string;
  value: number;
  title: string;
}

export function PerformanceChart({ videos }: PerformanceChartProps) {
  const [metric, setMetric] = useState<Metric>("views");

  const data = useMemo(() => {
    const sorted = [...videos].sort(
      (a, b) =>
        new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
    );

    return sorted.map<ChartPoint>((v) => ({
      date: v.publishedAt,
      label: new Date(v.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value: metric === "views" ? v.viewCount : v.engagementRate,
      title: v.title,
    }));
  }, [videos, metric]);

  if (videos.length < 2) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          Performance over time
        </h3>
        <div className="flex gap-1">
          <MetricButton
            active={metric === "views"}
            onClick={() => setMetric("views")}
          >
            Views
          </MetricButton>
          <MetricButton
            active={metric === "engagement"}
            onClick={() => setMetric("engagement")}
          >
            Engagement
          </MetricButton>
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--muted)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted)" }}
              tickLine={false}
              axisLine={false}
              width={50}
              tickFormatter={(v: number) =>
                metric === "views"
                  ? formatCompact(v)
                  : Number.isFinite(v)
                    ? `${(v * 100).toFixed(1)}%`
                    : "0%"
              }
            />
            <Tooltip content={<ChartTooltip metric={metric} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#chartFill)"
              dot={false}
              activeDot={{
                r: 4,
                fill: "var(--accent)",
                stroke: "var(--background)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MetricButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-7 rounded-md px-2.5 text-xs font-medium transition-colors cursor-pointer ${
        active
          ? "bg-accent text-white"
          : "text-muted hover:text-foreground hover:bg-surface-hover"
      }`}
    >
      {children}
    </button>
  );
}

function ChartTooltip({
  active,
  payload,
  metric,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
  metric: Metric;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-foreground line-clamp-1 max-w-48">
        {point.title}
      </p>
      <p className="text-xs text-muted mt-0.5">{point.label}</p>
      <p className="text-sm font-semibold text-accent mt-1">
        {metric === "views"
          ? formatCompact(point.value)
          : Number.isFinite(point.value)
            ? `${(point.value * 100).toFixed(2)}%`
            : "N/A"}
      </p>
    </div>
  );
}
