import Image from "next/image";
import type { ChannelData, VideoData } from "@/types";
import { formatCompact } from "@/lib/formatters";

interface ChannelHeaderProps {
  channel: ChannelData;
  videos: VideoData[];
}

export function ChannelHeader({ channel, videos }: ChannelHeaderProps) {
  const trendingCount = videos.filter((v) => v.isTrending).length;
  const avgViews =
    videos.length > 0
      ? Math.round(
          videos.reduce((sum, v) => sum + v.viewCount, 0) / videos.length
        )
      : 0;
  const validEngagements = videos.filter((v) => Number.isFinite(v.engagementRate));
  const avgEngagement =
    validEngagements.length > 0
      ? validEngagements.reduce((sum, v) => sum + v.engagementRate, 0) /
        validEngagements.length
      : 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <Image
        src={channel.thumbnailUrl}
        alt={channel.title}
        width={80}
        height={80}
        className="rounded-full"
      />

      <div className="flex-1 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-foreground">{channel.title}</h1>
        <p className="text-sm text-muted mt-0.5">{channel.customUrl}</p>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3">
          <StatChip
            label="Subscribers"
            value={formatCompact(channel.subscriberCount)}
          />
          <StatChip
            label="Total views"
            value={formatCompact(channel.viewCount)}
          />
          <StatChip
            label="Analyzed"
            value={String(videos.length)}
            highlight
          />
          {videos.length > 0 && (
            <>
              <StatChip
                label="Trending"
                value={String(trendingCount)}
                icon={<TrendingIcon />}
              />
              <StatChip
                label="Avg. views"
                value={formatCompact(avgViews)}
              />
              <StatChip
                label="Avg. engagement"
                value={`${(avgEngagement * 100).toFixed(1)}%`}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatChip({
  label,
  value,
  highlight,
  icon,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="text-center sm:text-left">
      <p
        className={`flex items-center gap-1 text-sm font-semibold ${
          highlight ? "text-accent" : "text-foreground"
        }`}
      >
        {icon}
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function TrendingIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-accent"
      aria-hidden="true"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
